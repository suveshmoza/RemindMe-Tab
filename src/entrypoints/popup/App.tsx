import { ReminderForm } from '@/components/ReminderForm';
import { ReminderList } from '@/components/ReminderList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';
import type { Reminder } from '../../utils/storage';
function App() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [currentTab, setCurrentTab] = useState<{ id: number; title: string; url: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadCurrentTab();
        loadReminders();

        // Set up storage listener to update reminders when they change
        const handleStorageChange = (changes: { [key: string]: Browser.storage.StorageChange }) => {
            if (changes.reminders) {
                setReminders(changes.reminders.newValue || []);
            }
        };

        browser.storage.onChanged.addListener(handleStorageChange);

        // Poll for reminders updates (in case storage listener doesn't work)
        const interval = setInterval(loadReminders, 1000);

        return () => {
            browser.storage.onChanged.removeListener(handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const loadCurrentTab = async () => {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id && tab.title && tab.url) {
                setCurrentTab({
                    id: tab.id,
                    title: tab.title,
                    url: tab.url,
                });
            }
        } catch (error) {
            console.error('Error loading current tab:', error);
        }
    };

    const loadReminders = async () => {
        try {
            const response = await browser.runtime.sendMessage({ type: 'getReminders' });
            if (response.success) {
                // Filter out past reminders that aren't snoozed
                const now = Date.now();
                const activeReminders = response.reminders.filter((r: Reminder) => {
                    const triggerTime = r.snoozedUntil || r.triggerTime;
                    return triggerTime > now;
                });
                setReminders(activeReminders);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReminder = async (data: { triggerTime: number; title: string; url: string; tabId: number }) => {
        try {
            const reminder: Reminder = {
                id: `${Date.now()}-${Math.random()}`,
                tabId: data.tabId,
                url: data.url,
                title: data.title,
                triggerTime: data.triggerTime,
                createdAt: Date.now(),
            };

            const response = await browser.runtime.sendMessage({
                type: 'createReminder',
                reminder,
            });

            if (response && response.success) {
                await loadReminders();
            } else {
                const errorMsg = response?.error || 'Unknown error';
                console.error('Error creating reminder:', errorMsg);
                alert(`Error creating reminder: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error creating reminder:', error);
            alert('Failed to create reminder');
        }
    };

    const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
        try {
            const response = await browser.runtime.sendMessage({
                type: 'updateReminder',
                id,
                updates,
            });

            if (response.success) {
                await loadReminders();
            } else {
                alert(`Error updating reminder: ${response.error}`);
            }
        } catch (error) {
            console.error('Error updating reminder:', error);
            alert('Failed to update reminder');
        }
    };

    const handleDeleteReminder = async (id: string) => {
        try {
            const response = await browser.runtime.sendMessage({
                type: 'deleteReminder',
                id,
            });

            if (response.success) {
                await loadReminders();
            } else {
                alert(`Error deleting reminder: ${response.error}`);
            }
        } catch (error) {
            console.error('Error deleting reminder:', error);
            alert('Failed to delete reminder');
        }
    };

    if (loading) {
        return (
            <div className='p-4 w-96'>
                <p className='text-center'>Loading...</p>
            </div>
        );
    }

    const handleFormSubmit = async (data: { triggerTime: number; title: string; url: string; tabId: number }) => {
        await handleCreateReminder(data);
        setIsDialogOpen(false);
    };

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
                <Button size='icon' onClick={() => setIsDialogOpen(true)} className='h-8 w-8'>
                    <Plus className='h-4 w-4' />
                </Button>
            </div>

            <ReminderList reminders={reminders} onDelete={handleDeleteReminder} onEdit={handleUpdateReminder} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        </div>
    );
}

export default App;
