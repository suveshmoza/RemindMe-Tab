import { useCallback, useState } from 'react';
import { browser } from 'wxt/browser';
import { ReminderForm } from '@/components/ReminderForm';
import { ReminderList } from '@/components/ReminderList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToastContainer } from '@/components/ui/toast';
import { Plus } from 'lucide-react';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useReminders } from '@/hooks/useReminders';
import { useStorageListener } from '@/hooks/useStorageListener';
import { useToast } from '@/hooks/useToast';
import type { ReminderFormData } from '@/types/reminder-form-data';

function App() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { currentTab, loading: tabLoading } = useCurrentTab();
    const { reminders, loading: remindersLoading, createReminder, updateReminder, deleteReminder, loadReminders } =
        useReminders();
    const { toasts, showError, showSuccess, removeToast } = useToast();

    const loading = tabLoading || remindersLoading;

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

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default App;
