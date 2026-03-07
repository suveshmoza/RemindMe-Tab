export type RecurrencePattern = 'daily' | 'weekly' | 'every-n-days' | 'every-n-hours' | 'every-n-minutes';
export type RecurrenceEndCondition = 'forever' | 'after-occurrences' | 'until-date';

export interface RecurrenceRule {
    pattern: RecurrencePattern;
    interval?: number;
    endCondition: RecurrenceEndCondition;
    endAfterOccurrences?: number;
    endDate?: number;
    occurrenceCount?: number;
}

export interface Reminder {
    id: string;
    tabId: number;
    url: string;
    title: string;
    triggerTime: number; // timestamp in milliseconds
    createdAt: number; // timestamp in milliseconds
    snoozedUntil?: number; // timestamp in milliseconds
    recurrence?: RecurrenceRule;
}
