import type { Reminder } from '@/types/reminder';
import { browser } from 'wxt/browser';

export async function createNotification(reminder: Reminder): Promise<string> {
    // Use the PNG icon from the extension
    const iconUrl = browser.runtime.getURL('/icons/48.png');

    // Build notification options based on browser support
    const isFirefox = import.meta.env.BROWSER === 'firefox';

    const notificationOptions: Browser.notifications.NotificationCreateOptions = {
        type: 'basic',
        iconUrl: iconUrl,
        title: 'Tab Reminder',
        message: `Reminder: ${reminder.title}`,
        // Only include buttons and requireInteraction for non-Firefox browsers
        ...(isFirefox
            ? {}
            : {
                  buttons: [
                      { title: 'Snooze 5min' },
                      { title: 'Snooze 15min' },
                      { title: 'Snooze 30min' },
                      { title: 'Custom (1hr)' },
                  ],
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
