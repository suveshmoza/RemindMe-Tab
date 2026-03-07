import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import { storage } from 'wxt/utils/storage';
import { ReminderForm } from '@/components/ReminderForm';
import { ReminderList } from '@/components/ReminderList';
import { RecurrenceFromNotificationPicker } from '@/components/RecurrenceFromNotificationPicker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToastContainer } from '@/components/ui/toast';
import { Plus } from 'lucide-react';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useReminders } from '@/hooks/useReminders';
import { useStorageListener } from '@/hooks/useStorageListener';
import { useToast } from '@/hooks/useToast';
import { PENDING_RECURRENCE_STORAGE_KEY } from '@/constants';
import type { ReminderFormData } from '@/types/reminder-form-data';

function App() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingRecurrenceReminderId, setPendingRecurrenceReminderId] = useState<string | null>(null);
    const { currentTab, loading: tabLoading } = useCurrentTab();
    const { reminders, loading: remindersLoading, createReminder, updateReminder, deleteReminder, makeRecurring, loadReminders } =
        useReminders();
    const { toasts, showError, showSuccess, removeToast } = useToast();

    const loading = tabLoading || remindersLoading;

    // Check for pending recurrence from notification on mount + listen for changes
    useEffect(() => {
        (async () => {
            const pendingId = await storage.getItem<string>(PENDING_RECURRENCE_STORAGE_KEY);
            if (pendingId) {
                setPendingRecurrenceReminderId(pendingId);
            }
        })();

        const unwatch = storage.watch<string>(PENDING_RECURRENCE_STORAGE_KEY, (newValue) => {
            setPendingRecurrenceReminderId(newValue ?? null);
        });

        return () => { unwatch(); };
    }, []);

    const handleRecurrencePick = useCallback(
        async (intervalMinutes: number) => {
            if (!pendingRecurrenceReminderId) return;
            try {
                await makeRecurring(pendingRecurrenceReminderId, intervalMinutes);
                showSuccess(`Reminder set to repeat every ${intervalMinutes} minutes`);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to set recurring';
                showError(message);
            } finally {
                await storage.removeItem(PENDING_RECURRENCE_STORAGE_KEY);
                setPendingRecurrenceReminderId(null);
            }
        },
        [pendingRecurrenceReminderId, makeRecurring, showSuccess, showError]
    );

    const handleRecurrenceCancel = useCallback(async () => {
        await storage.removeItem(PENDING_RECURRENCE_STORAGE_KEY);
        setPendingRecurrenceReminderId(null);
    }, []);

    // Set up storage listener
    useStorageListener({
        onRemindersChange: useCallback(
            () => {
                // Reload reminders when storage changes
                loadReminders();
            },
            [loadReminders]
        ),
        onPoll: loadReminders,
    });

    const handleCreateReminder = useCallback(
        async (data: ReminderFormData) => {
            try {
                await createReminder(data);
                showSuccess('Reminder created successfully');
                setIsDialogOpen(false);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to create reminder';
                showError(message);
            }
        },
        [createReminder, showSuccess, showError]
    );

    const handleUpdateReminder = useCallback(
        async (id: string, updates: Parameters<typeof updateReminder>[1]) => {
            try {
                await updateReminder(id, updates);
                showSuccess('Reminder updated successfully');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to update reminder';
                showError(message);
            }
        },
        [updateReminder, showSuccess, showError]
    );

    const handleDeleteReminder = useCallback(
        async (id: string) => {
            try {
                await deleteReminder(id);
                showSuccess('Reminder deleted successfully');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to delete reminder';
                showError(message);
            }
        },
        [deleteReminder, showSuccess, showError]
    );

    const handleFormSubmit = useCallback(
        async (data: ReminderFormData) => {
            await handleCreateReminder(data);
        },
        [handleCreateReminder]
    );

    const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
    const handleDialogChange = useCallback((open: boolean) => setIsDialogOpen(open), []);

    if (loading) {
        return (
            <div className='p-4 w-96'>
                <p className='text-center'>Loading...</p>
            </div>
        );
    }

    return (
        <div className='p-4 w-96 h-[500px] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <img
                        src={browser.runtime.getURL('/icons/48.png')}
                        alt='RemindMe Tab'
                        width={32}
                        height={32}
                        className='mt-2'
                        loading='eager'
                    />
                    <h1 className='text-2xl font-bold underline decoration-wavy decoration-blue-400'>RemindMe Tab</h1>
                </div>
                <Button size='icon' onClick={handleOpenDialog} className='h-8 w-8'>
                    <Plus className='h-4 w-4' />
                </Button>
            </div>

            <ReminderList
                reminders={reminders}
                onDelete={handleDeleteReminder}
                onEdit={handleUpdateReminder}
                onError={showError}
            />

            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent className='max-h-[85vh]'>
                    <DialogHeader>
                        <DialogTitle>Create Reminder</DialogTitle>
                        <DialogDescription>Set a reminder for the current tab</DialogDescription>
                    </DialogHeader>
                    <div className='overflow-y-auto max-h-[calc(85vh-8rem)]'>
                        <ReminderForm onSubmit={handleFormSubmit} currentTab={currentTab || undefined} />
                    </div>
                </DialogContent>
            </Dialog>

            <RecurrenceFromNotificationPicker
                open={!!pendingRecurrenceReminderId}
                onPick={handleRecurrencePick}
                onCancel={handleRecurrenceCancel}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default App;
