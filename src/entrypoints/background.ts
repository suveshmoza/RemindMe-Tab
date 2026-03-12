import {
    getReminders,
    updateReminder,
    deleteReminder,
    getReminder,
    addReminder,
} from '@/utils/storage';
import { createNotification, requestNotificationPermission } from '@/utils/notification';
import { getNextTriggerTime, shouldRecur } from '@/utils/recurrence';
import { PENDING_RECURRENCE_STORAGE_KEY } from '@/constants';
import type { Reminder } from '@/types/reminder';
import type { MessageType, MessageResponse } from '@/types/messages';
import { browser } from 'wxt/browser';

export default defineBackground(() => {
    // Request notification permission on install
    browser.runtime.onInstalled.addListener(async (details) => {
        await requestNotificationPermission();
        if (details.reason === 'update') {
            const currentVersion = browser.runtime.getManifest().version;
            const key = 'local:last-opened-changelog-version';
            const lastOpened = await storage.getItem<string>(key);

            if (lastOpened !== currentVersion) {
                await storage.setItem(key, currentVersion);
                await browser.tabs.create({ url: 'https://remindme-tab.vercel.app/changelog' });
            }
        }
    });

    // Handle alarm triggers
    browser.alarms.onAlarm.addListener(async (alarm: Browser.alarms.Alarm) => {
        if (alarm.name.startsWith('reminder-')) {
            // Remove the 'reminder-' prefix to get the actual reminder ID
            const reminderId = alarm.name.replace(/^reminder-/, '');
            const reminder = await getReminder(reminderId);

            if (!reminder) {
                console.error('Reminder not found:', reminderId);
                return;
            }

            // Check if reminder was snoozed
            const now = Date.now();
            if (reminder.snoozedUntil && now < reminder.snoozedUntil) {
                // Reschedule for snooze time
                browser.alarms.create(`reminder-${reminderId}`, { when: reminder.snoozedUntil });
                return;
            }

            // Clear snooze if it was set
            if (reminder.snoozedUntil) {
                await updateReminder(reminderId, { snoozedUntil: undefined });
            }

            // Create notification
            try {
                const notificationId = await createNotification(reminder);
                await storage.setItem(`local:notification-${notificationId}`, reminderId);
            } catch (error) {
                console.error('Error creating notification:', error);
            }

            // Reschedule if recurring
            if (reminder.recurrence) {
                const rule = reminder.recurrence;
                const count = (rule.occurrenceCount ?? 0) + 1;
                const nextTrigger = getNextTriggerTime(rule, reminder.triggerTime);
                const updatedRule = { ...rule, occurrenceCount: count };
                const updatedReminder = {
                    ...reminder,
                    recurrence: updatedRule,
                    triggerTime: nextTrigger,
                };

                if (shouldRecur(updatedReminder, nextTrigger)) {
                    await updateReminder(reminderId, {
                        triggerTime: nextTrigger,
                        recurrence: updatedRule,
                        snoozedUntil: undefined,
                        createdAt: Date.now(),
                    });
                    browser.alarms.create(`reminder-${reminderId}`, { when: nextTrigger });
                }
            }
        }
    });

    // Handle notification clicks
    browser.notifications.onClicked.addListener(async (notificationId: string) => {
        const key = `notification-${notificationId}`;
        const result = await storage.getItem<string>(`local:${key}`);
        const reminderId = result;

        if (reminderId) {
            const reminder = await getReminder(reminderId);
            if (reminder) {
                // Focus the tab
                try {
                    const tab = await browser.tabs.get(reminder.tabId);
                    if (tab.windowId) {
                        await browser.windows.update(tab.windowId, { focused: true });
                        await browser.tabs.update(reminder.tabId, { active: true });
                    }
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error('Error focusing tab:', error.message);
                    } else {
                        console.error('Error focusing tab:', error);
                    }
                    // Tab might be closed, try to open it
                    await browser.tabs.create({ url: reminder.url });
                }
            }
            // Clean up
            await storage.removeItem(`local:${key}`);
            browser.notifications.clear(notificationId);
        }
    });

    // Handle notification button clicks - only for browsers that support buttons
    const isFirefox = import.meta.env.BROWSER === 'firefox';
    if (!isFirefox) {
        browser.notifications.onButtonClicked.addListener(
            async (notificationId: string, buttonIndex: number) => {
                const key = `notification-${notificationId}`;
                const result = await storage.getItem<string>(`local:${key}`);
                const reminderId = result;

                if (!reminderId) return;
                const reminder = await getReminder(reminderId);
                if (!reminder) return;

                if (reminder.recurrence) {
                    // Recurring reminder: buttons are "Stop reminder" | "Edit"
                    if (buttonIndex === 0) {
                        // Stop reminder — remove recurrence and delete the reminder
                        const alarmName = `reminder-${reminderId}`;
                        browser.alarms.clear(alarmName);
                        await deleteReminder(reminderId);
                    } else if (buttonIndex === 1) {
                        // Edit — open popup so the user can modify the reminder
                        await storage.setItem(PENDING_RECURRENCE_STORAGE_KEY, reminderId);
                        try {
                            await (browser.action as any).openPopup();
                        } catch {
                            // openPopup may not be available in all contexts
                        }
                    }
                } else {
                    // One-time reminder: buttons are "Snooze 5 min" | "Remove reminder"
                    if (buttonIndex === 0) {
                        const snoozeTime = Date.now() + 5 * 60 * 1000;
                        await updateReminder(reminderId, { snoozedUntil: snoozeTime });
                        browser.alarms.create(`reminder-${reminderId}`, { when: snoozeTime });
                    } else if (buttonIndex === 1) {
                        const alarmName = `reminder-${reminderId}`;
                        browser.alarms.clear(alarmName);
                        await deleteReminder(reminderId);
                    }
                }

                await storage.removeItem(`local:${key}`);
                browser.notifications.clear(notificationId);
            }
        );
    }

    // Handle messages from popup
    browser.runtime.onMessage.addListener(
        (
            message: MessageType,
            _sender: Browser.runtime.MessageSender,
            sendResponse: (response: MessageResponse) => void
        ) => {
            if (message.type === 'createReminder') {
                handleCreateReminder(message.reminder)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true; // Keep channel open for async response
            } else if (message.type === 'updateReminder') {
                handleUpdateReminder(message.id, message.updates)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'deleteReminder') {
                handleDeleteReminder(message.id)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'getReminders') {
                getReminders()
                    .then((reminders) => {
                        sendResponse({ success: true, reminders });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'snoozeReminder') {
                handleSnoozeReminder(message.id, message.minutes)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'makeRecurring') {
                convertToRecurring(message.id, message.intervalMinutes)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage =
                            error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            }
            return false;
        }
    );

    async function handleCreateReminder(reminder: Reminder): Promise<void> {
        await addReminder(reminder);

        // Schedule alarm
        const alarmName = `reminder-${reminder.id}`;
        const now = Date.now();
        const delay = reminder.triggerTime - now;

        if (delay <= 0) {
            // If time has already passed, trigger immediately
            try {
                const notificationId = await createNotification(reminder);
                await storage.setItem(`local:notification-${notificationId}`, reminder.id);
            } catch (error) {
                console.error('Error creating immediate notification:', error);
            }

            // If recurring, schedule the next occurrence even though we fired immediately
            if (reminder.recurrence) {
                const rule = reminder.recurrence;
                const count = (rule.occurrenceCount ?? 0) + 1;
                const nextTrigger = getNextTriggerTime(rule, reminder.triggerTime);
                const updatedRule = { ...rule, occurrenceCount: count };
                const updatedReminder = {
                    ...reminder,
                    recurrence: updatedRule,
                    triggerTime: nextTrigger,
                };

                if (shouldRecur(updatedReminder, nextTrigger) && nextTrigger > now) {
                    await updateReminder(reminder.id, {
                        triggerTime: nextTrigger,
                        recurrence: updatedRule,
                        snoozedUntil: undefined,
                        createdAt: now,
                    });
                    browser.alarms.create(alarmName, { when: nextTrigger });
                }
            }
        } else {
            browser.alarms.create(alarmName, { when: reminder.triggerTime });
        }
    }

    async function handleUpdateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
        await updateReminder(id, updates);

        // Reschedule alarm if triggerTime changed
        if (updates.triggerTime) {
            const alarmName = `reminder-${id}`;
            browser.alarms.clear(alarmName);
            browser.alarms.create(alarmName, { when: updates.triggerTime });
        }
    }

    async function handleDeleteReminder(id: string): Promise<void> {
        await deleteReminder(id);

        // Clear alarm
        const alarmName = `reminder-${id}`;
        browser.alarms.clear(alarmName);
    }

    async function handleSnoozeReminder(id: string, minutes: number): Promise<void> {
        const reminder = await getReminder(id);
        if (!reminder) {
            throw new Error('Reminder not found');
        }

        const snoozeTime = Date.now() + minutes * 60 * 1000;
        await updateReminder(id, { snoozedUntil: snoozeTime });

        // Reschedule alarm
        const alarmName = `reminder-${id}`;
        browser.alarms.clear(alarmName);
        browser.alarms.create(alarmName, { when: snoozeTime });
    }

    async function convertToRecurring(reminderId: string, intervalMinutes: number): Promise<void> {
        const reminder = await getReminder(reminderId);
        if (!reminder) throw new Error('Reminder not found');

        const now = Date.now();
        const nextTrigger = now + intervalMinutes * 60 * 1000;

        await updateReminder(reminderId, {
            triggerTime: nextTrigger,
            snoozedUntil: undefined,
            createdAt: now,
            recurrence: {
                pattern: 'every-n-minutes',
                interval: intervalMinutes,
                endCondition: 'forever',
                occurrenceCount: 0,
            },
        });

        const alarmName = `reminder-${reminderId}`;
        browser.alarms.clear(alarmName);
        browser.alarms.create(alarmName, { when: nextTrigger });
    }

    // Restore alarms on startup
    browser.runtime.onStartup.addListener(async () => {
        const reminders = await getReminders();
        const now = Date.now();

        for (const reminder of reminders) {
            const triggerTime = reminder.snoozedUntil || reminder.triggerTime;
            if (triggerTime > now) {
                browser.alarms.create(`reminder-${reminder.id}`, { when: triggerTime });
            }
        }
    });

    // Also restore alarms when service worker wakes up
    (async () => {
        const reminders = await getReminders();
        const now = Date.now();

        for (const reminder of reminders) {
            const triggerTime = reminder.snoozedUntil || reminder.triggerTime;
            if (triggerTime > now) {
                browser.alarms.create(`reminder-${reminder.id}`, { when: triggerTime });
            }
        }
    })();
});
