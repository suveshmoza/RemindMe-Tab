import { memo } from 'react';
import { browser } from 'wxt/browser';
import type { Reminder } from '@/types/reminder';
import { ReminderItem } from '@/components/ReminderItem/ReminderItem';
import { Card, CardContent } from '@/components/ui/card';

interface ReminderListProps {
    reminders: Reminder[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Reminder>) => void;
    onError?: (message: string) => void;
}

export const ReminderList = memo(function ReminderList({
    reminders,
    onDelete,
    onEdit,
    onError,
}: ReminderListProps) {
    if (reminders.length === 0) {
        return (
            <Card className='bg-background/50 border-none shadow-none hover:shadow-none'>
                <CardContent className='pt-6 flex flex-col items-center justify-center'>
                    <img
                        src={browser.runtime.getURL('/doodle.jpg')}
                        alt='RemindMe Tab'
                        className='w-48 h-48 object-contain opacity-80 mix-blend-multiply dark:mix-blend-screen'
                        loading='lazy'
                    />
                    <p className='text-center text-muted-foreground text-lg font-medium'>
                        No active reminders
                    </p>
                    <p className='text-center text-muted-foreground/70 text-sm'>
                        Click the + button to add one
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <h2 className='font-bold text-xl'>Active Reminders</h2>
            <p className='text-muted-foreground text-sm'>Manage your tab reminders</p>

            <div className='space-y-2 mt-2'>
                {reminders.map((reminder) => (
                    <ReminderItem
                        key={reminder.id}
                        reminder={reminder}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onError={onError}
                    />
                ))}
            </div>
        </>
    );
});
