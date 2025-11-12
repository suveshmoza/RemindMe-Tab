import { POLLING_INTERVAL_MS, STORAGE_KEY } from '@/constants';
import type { Reminder } from '@/types/reminder';
import { useEffect } from 'react';
import { browser } from 'wxt/browser';

interface UseStorageListenerOptions {
    onRemindersChange: (reminders: Reminder[]) => void;
    onPoll?: () => void;
}

export function useStorageListener({ onRemindersChange, onPoll }: UseStorageListenerOptions) {
    useEffect(() => {
        const handleStorageChange = (changes: { [key: string]: Browser.storage.StorageChange }) => {
            if (changes[STORAGE_KEY]) {
                const newReminders = (changes[STORAGE_KEY].newValue as Reminder[]) || [];
                onRemindersChange(newReminders);
            }
        };

        browser.storage.onChanged.addListener(handleStorageChange);

        // Poll for reminders updates (in case storage listener doesn't work)
        const interval = onPoll ? setInterval(onPoll, POLLING_INTERVAL_MS) : null;

        return () => {
            browser.storage.onChanged.removeListener(handleStorageChange);
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [onRemindersChange, onPoll]);
}

