import type { Reminder, RecurrenceRule } from '@/types/reminder';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function getIntervalMs(rule: RecurrenceRule): number {
    const interval = rule.interval ?? 1;
    switch (rule.pattern) {
        case 'every-n-minutes':
            return interval * MS_PER_MINUTE;
        case 'every-n-hours':
            return interval * MS_PER_HOUR;
        case 'every-n-days':
            return interval * MS_PER_DAY;
        case 'daily':
            return MS_PER_DAY;
        case 'weekly':
            return 7 * MS_PER_DAY;
    }
}

export function getNextTriggerTime(rule: RecurrenceRule, lastTriggerTime: number): number {
    return lastTriggerTime + getIntervalMs(rule);
}

export function shouldRecur(reminder: Reminder, nextTrigger: number): boolean {
    const rule = reminder.recurrence;
    if (!rule) return false;

    switch (rule.endCondition) {
        case 'forever':
            return true;
        case 'after-occurrences': {
            const count = rule.occurrenceCount ?? 0;
            return count < (rule.endAfterOccurrences ?? 1);
        }
        case 'until-date':
            return nextTrigger <= (rule.endDate ?? 0);
    }
}

export function formatRecurrenceLabel(rule: RecurrenceRule): string {
    const interval = rule.interval ?? 1;
    switch (rule.pattern) {
        case 'daily':
            return 'daily';
        case 'weekly':
            return 'weekly';
        case 'every-n-days':
            return interval === 1 ? 'daily' : `every ${interval} days`;
        case 'every-n-hours':
            return interval === 1 ? 'every hour' : `every ${interval} hours`;
        case 'every-n-minutes':
            return interval === 1 ? 'every minute' : `every ${interval} minutes`;
        default:
            return rule.pattern;
    }
}
