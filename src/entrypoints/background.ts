import { getReminders, updateReminder, deleteReminder, getReminder, addReminder } from '../utils/storage';
import { createNotification, requestNotificationPermission } from '../utils/notification';
import type { Reminder } from '../utils/storage';
import { browser } from 'wxt/browser';

export type MessageType =
    | { type: 'createReminder'; reminder: Reminder }
    | { type: 'updateReminder'; id: string; updates: Partial<Reminder> }
    | { type: 'deleteReminder'; id: string }
    | { type: 'getReminders' }
    | { type: 'snoozeReminder'; id: string; minutes: number };

export type MessageResponse = { success: true; reminders?: Reminder[] } | { success: false; error: string };

export default defineBackground(() => {
    // Request notification permission on install
    browser.runtime.onInstalled.addListener(async () => {
        await requestNotificationPermission();
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
                // Store notification ID to reminder mapping
                await storage.setItem(`local:notification-${notificationId}`, reminderId);
            } catch (error) {
                console.error('Error creating notification:', error);
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

    // Handle notification button clicks (snooze) - only for browsers that support buttons
    // Firefox doesn't support notification buttons, so this listener won't be registered
    const isFirefox = import.meta.env.BROWSER === 'firefox';
    if (!isFirefox) {
        browser.notifications.onButtonClicked.addListener(async (notificationId: string, buttonIndex: number) => {
            const key = `notification-${notificationId}`;
            const result = await storage.getItem<string>(`local:${key}`);
            const reminderId = result;

            if (reminderId) {
                const reminder = await getReminder(reminderId);
                if (!reminder) {
                    return;
                }

                const now = Date.now();
                let snoozeTime: number;

                switch (buttonIndex) {
                    case 0: // +5min
                        snoozeTime = now + 5 * 60 * 1000;
                        break;
                    case 1: // +15min
                        snoozeTime = now + 15 * 60 * 1000;
                        break;
                    case 2: // +30min
                        snoozeTime = now + 30 * 60 * 1000;
                        break;
                    case 3: // Custom - for now, default to 1 hour, will be handled by popup
                        snoozeTime = now + 60 * 60 * 1000;
                        break;
                    default:
                        return;
                }

                await updateReminder(reminderId, { snoozedUntil: snoozeTime });
                browser.alarms.create(`reminder-${reminderId}`, { when: snoozeTime });

                // Clean up
                await storage.removeItem(`local:${key}`);
                browser.notifications.clear(notificationId);
            }
        });
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
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true; // Keep channel open for async response
            } else if (message.type === 'updateReminder') {
                handleUpdateReminder(message.id, message.updates)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'deleteReminder') {
                handleDeleteReminder(message.id)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'getReminders') {
                getReminders()
                    .then((reminders) => {
                        sendResponse({ success: true, reminders });
                    })
                    .catch((error: unknown) => {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        sendResponse({ success: false, error: errorMessage });
                    });
                return true;
            } else if (message.type === 'snoozeReminder') {
                handleSnoozeReminder(message.id, message.minutes)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch((error: unknown) => {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
