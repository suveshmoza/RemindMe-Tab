export interface Reminder {
    id: string;
    tabId: number;
    url: string;
    title: string;
    triggerTime: number; // timestamp in milliseconds
    createdAt: number; // timestamp in milliseconds
    snoozedUntil?: number; // timestamp in milliseconds
}
