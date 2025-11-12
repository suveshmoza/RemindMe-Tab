import { format, formatDistanceToNow } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { Reminder } from '@/types/reminder';
import { getTriggerTime, isValidFutureTime } from '@/utils/reminder-helpers';
import { Progress } from '../ui/progress';
import { ReminderItemHeader } from './ReminderItemHeader';
import { ReminderItemEditor } from './ReminderItemEditor';

interface ReminderItemProps {
    reminder: Reminder;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Reminder>) => void;
    onError?: (message: string) => void;
}

export const ReminderItem = memo(function ReminderItem({ reminder, onEdit, onDelete, onError }: ReminderItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Memoize computed values
    const triggerTime = useMemo(() => getTriggerTime(reminder), [reminder]);
    const isPast = useMemo(() => triggerTime < currentTime, [triggerTime, currentTime]);
    const isSnoozed = useMemo(() => !!reminder.snoozedUntil, [reminder.snoozedUntil]);

    // Initialize date and time inputs from trigger time
    useEffect(() => {
        setDate(format(new Date(triggerTime), 'yyyy-MM-dd'));
        setTime(format(new Date(triggerTime), 'HH:mm'));
    }, [triggerTime]);

    // Calculate progress percentage (0-100)
    useEffect(() => {
        const calculateProgress = () => {
            const now = Date.now();
            setCurrentTime(now);

            const totalDuration = triggerTime - reminder.createdAt;
            const elapsed = now - reminder.createdAt;

            if (totalDuration <= 0) {
                setProgress(100);
                return;
            }

            const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            setProgress(percentage);
        };

        calculateProgress();
        const interval = setInterval(calculateProgress, 1000);

        return () => clearInterval(interval);
    }, [triggerTime, reminder.createdAt]);

    // Memoize event handlers
    const handleSave = useCallback(() => {
        const dateTime = new Date(`${date}T${time}`);
        const newTriggerTime = dateTime.getTime();

        if (!isValidFutureTime(newTriggerTime)) {
            const errorMessage = 'Please select a future date and time';
            if (onError) {
                onError(errorMessage);
            } else {
                // Fallback to alert if no error handler provided
                alert(errorMessage);
            }
            return;
        }

        onEdit(reminder.id, { triggerTime: newTriggerTime, snoozedUntil: undefined });
        setIsEditing(false);
    }, [date, time, reminder.id, onEdit, onError]);

    const handleCancel = useCallback(() => {
        setDate(format(new Date(triggerTime), 'yyyy-MM-dd'));
        setTime(format(new Date(triggerTime), 'HH:mm'));
        setIsEditing(false);
    }, [triggerTime]);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleDelete = useCallback(() => onDelete(reminder.id), [reminder.id, onDelete]);

    // Memoize formatted display values
    const timeDisplay = useMemo(
        () => formatDistanceToNow(triggerTime, { addSuffix: false }),
        [triggerTime]
    );
    const formattedDateTime = useMemo(() => format(new Date(triggerTime), 'PPpp'), [triggerTime]);

    return (
        <div className='border rounded-lg p-2 space-y-3 bg-card hover:border-primary/50 transition-colors'>
            {!isEditing && (
                <ReminderItemHeader
                    title={reminder.title}
                    url={reminder.url}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Progress Bar */}
            {!isEditing && (
                <div className='space-y-1'>
                    <Progress value={progress} className='h-1.5' />
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span>{isPast ? 'Overdue' : 'Reminding in'}</span>
                        <span className='font-medium text-foreground'>{timeDisplay}</span>
                    </div>
                </div>
            )}

            {/* Content: Editing or Display */}
            {isEditing ? (
                <>
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0 space-y-1'>
                            <h4 className='font-semibold text-sm truncate'>{reminder.title}</h4>
                            <p className='text-xs text-muted-foreground truncate'>{reminder.url}</p>
                        </div>
                    </div>
                    <ReminderItemEditor
                        date={date}
                        time={time}
                        onDateChange={setDate}
                        onTimeChange={setTime}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </>
            ) : (
                <div className='space-y-0.5'>
                    <div className='flex items-center justify-between text-xs'>
                        {isSnoozed && (
                            <span className='px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium'>
                                Snoozed
                            </span>
                        )}
                    </div>
                    <p className='text-xs text-muted-foreground'>{formattedDateTime}</p>
                </div>
            )}
        </div>
    );
});

