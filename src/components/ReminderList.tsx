import { Card, CardContent } from './ui/card';
import { ReminderItem } from './ReminderItem';
import type { Reminder } from '../types/reminder';

interface ReminderListProps {
    reminders: Reminder[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Reminder>) => void;
}

export function ReminderList({ reminders, onDelete, onEdit }: ReminderListProps) {
    if (reminders.length === 0) {
        return (
            <Card className='border-none shadow-none'>
                <CardContent className='pt-6'>
                    <img
                        src={chrome.runtime.getURL('GroovySittingDoodle.png')}
                        alt='RemindMe Tab'
                        className='mt-1 w-full h-full object-cover'
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
                    <ReminderItem key={reminder.id} reminder={reminder} onDelete={onDelete} onEdit={onEdit} />
                ))}
            </div>
        </>
    );
}
