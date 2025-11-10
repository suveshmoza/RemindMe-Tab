import type { Reminder } from './reminder';

export type MessageType =
    | { type: 'createReminder'; reminder: Reminder }
    | { type: 'updateReminder'; id: string; updates: Partial<Reminder> }
    | { type: 'deleteReminder'; id: string }
    | { type: 'getReminders' }
    | { type: 'snoozeReminder'; id: string; minutes: number };

export type MessageResponse = { success: true; reminders?: Reminder[] } | { success: false; error: string };
