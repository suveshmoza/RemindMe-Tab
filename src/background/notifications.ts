import type { Reminder } from '../types/reminder';

export async function createNotification(reminder: Reminder): Promise<string> {
    // Use the PNG icon from the extension
    const iconUrl = chrome.runtime.getURL('icon-48.png');

    const notificationOptions: chrome.notifications.NotificationCreateOptions = {
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Tab Reminder',
        message: `Reminder: ${reminder.title}`,
        buttons: [
            { title: 'Snooze 5min' },
            { title: 'Snooze 15min' },
            { title: 'Snooze 30min' },
            { title: 'Custom (1hr)' },
        ],
        requireInteraction: true,
    };

    try {
        const notificationId = await chrome.notifications.create(notificationOptions);
        return notificationId;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (chrome.notifications) {
        return true; // Permission is granted via manifest
    }
    return false;
}
