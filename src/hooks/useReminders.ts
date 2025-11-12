import type { MessageResponse } from '@/types/messages';
import type { Reminder } from '@/types/reminder';
import type { ReminderFormData } from '@/types/reminder-form-data';
import { filterActiveReminders } from '@/utils/reminder-helpers';
import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

interface UseRemindersReturn {
    reminders: Reminder[];
    loading: boolean;
    error: Error | null;
    createReminder: (data: ReminderFormData) => Promise<void>;
    updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
    deleteReminder: (id: string) => Promise<void>;
    loadReminders: () => Promise<void>;
}

export function useReminders(): UseRemindersReturn {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadReminders = useCallback(async () => {
        try {
            setError(null);
            const response = (await browser.runtime.sendMessage({
                type: 'getReminders',
            })) as MessageResponse;

            if (response && response.success && response.reminders) {
                const activeReminders = filterActiveReminders(response.reminders);
                setReminders(activeReminders);
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load reminders');
            setError(error);
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createReminder = useCallback(
        async (data: ReminderFormData) => {
            try {
                setError(null);
                const reminder: Reminder = {
                    id: `${Date.now()}-${Math.random()}`,
                    tabId: data.tabId,
                    url: data.url,
                    title: data.title,
                    triggerTime: data.triggerTime,
                    createdAt: Date.now(),
                };

                const response = (await browser.runtime.sendMessage({
                    type: 'createReminder',
                    reminder,
                })) as MessageResponse;

                if (response && response.success) {
                    await loadReminders();
                } else {
                    const errorMsg = response?.error || 'Unknown error';
                    throw new Error(errorMsg);
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to create reminder');
                setError(error);
                throw error;
            }
        },
        [loadReminders]
    );

    const updateReminder = useCallback(
        async (id: string, updates: Partial<Reminder>) => {
            try {
                setError(null);
                const response = (await browser.runtime.sendMessage({
                    type: 'updateReminder',
                    id,
                    updates,
                })) as MessageResponse;

                if (response && response.success) {
                    await loadReminders();
                } else {
                    throw new Error(response?.error || 'Failed to update reminder');
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to update reminder');
                setError(error);
                throw error;
            }
        },
        [loadReminders]
    );

    const deleteReminder = useCallback(
        async (id: string) => {
            try {
                setError(null);
                const response = (await browser.runtime.sendMessage({
                    type: 'deleteReminder',
                    id,
                })) as MessageResponse;

                if (response && response.success) {
                    await loadReminders();
                } else {
                    throw new Error(response?.error || 'Failed to delete reminder');
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to delete reminder');
                setError(error);
                throw error;
            }
        },
        [loadReminders]
    );

    // Load reminders on mount
    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    return {
        reminders,
        loading,
        error,
        createReminder,
        updateReminder,
        deleteReminder,
        loadReminders,
    };
}

