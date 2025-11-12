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

export const ReminderList = memo(function ReminderList({ reminders, onDelete, onEdit, onError }: ReminderListProps) {
    if (reminders.length === 0) {
        return (
            <Card className='border-none shadow-none'>
                <CardContent className='pt-6'>
                    <img
                        src={browser.runtime.getURL('/doodle.webp')}
                        alt='RemindMe Tab'
                        className='mt-1 w-full h-full object-cover'
                        loading='lazy'
                    />
                    <p className='text-center text-muted-foreground text-2xl'>No active reminders</p>
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
