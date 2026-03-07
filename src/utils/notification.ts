import type { Reminder } from '@/types/reminder';
import { browser } from 'wxt/browser';

function getNotificationButtons(reminder: Reminder): Browser.notifications.NotificationButton[] {
    if (reminder.recurrence) {
        return [
            { title: 'Remove reminder' },
            { title: 'Edit' },
        ];
    }
    return [
        { title: 'Snooze 5 min' },
        { title: 'Remove reminder' },
    ];
}

export async function createNotification(reminder: Reminder): Promise<string> {
    const iconUrl = browser.runtime.getURL('/icons/48.png');

    const isFirefox = import.meta.env.BROWSER === 'firefox';

    const notificationOptions: Browser.notifications.NotificationCreateOptions = {
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Tab Reminder',
        message: `Reminder: ${reminder.title}`,
        ...(isFirefox
            ? {}
            : {
                  buttons: getNotificationButtons(reminder),
                  requireInteraction: true,
              }),
    };

    try {
        const notificationId = await browser.notifications.create(notificationOptions);
        return notificationId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (browser.notifications) {
        return true; // Permission is granted via manifest
    }
    return false;
}
