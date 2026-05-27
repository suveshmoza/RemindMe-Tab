import type { RecurrenceRule } from './reminder';

export interface ReminderFormData {
    triggerTime: number;
    title: string;
    url: string;
    tabId: number;
    recurrence?: RecurrenceRule;
}
