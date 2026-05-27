import type { Reminder } from '@/types/reminder';

/**
 * Filters out past reminders that aren't snoozed
 */
export function filterActiveReminders(reminders: Reminder[]): Reminder[] {
    const now = Date.now();
    return reminders.filter((reminder) => {
        const triggerTime = reminder.snoozedUntil || reminder.triggerTime;
        return triggerTime > now;
    });
}

/**
 * Gets the effective trigger time for a reminder (snoozed or original)
 */
export function getTriggerTime(reminder: Reminder): number {
    return reminder.snoozedUntil || reminder.triggerTime;
}

/**
 * Checks if a reminder is past its trigger time
 */
export function isReminderPast(reminder: Reminder): boolean {
    const triggerTime = getTriggerTime(reminder);
    return triggerTime < Date.now();
}

/**
 * Validates that a trigger time is in the future
 */
export function isValidFutureTime(triggerTime: number): boolean {
    return triggerTime > Date.now();
}
