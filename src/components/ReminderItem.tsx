import { Check, Edit2, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Reminder } from '../utils/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';

// Lazy load date-fns functions since they're only used for formatting
type DateFnsModule = {
    format: typeof import('date-fns').format;
    formatDistanceToNow: typeof import('date-fns').formatDistanceToNow;
};

let dateFnsCache: DateFnsModule | null = null;
const loadDateFns = async (): Promise<DateFnsModule> => {
    if (dateFnsCache) return dateFnsCache;
    const module = await import('date-fns');
    dateFnsCache = {
        format: module.format,
        formatDistanceToNow: module.formatDistanceToNow,
    };
    return dateFnsCache;
};

interface ReminderItemProps {
    reminder: Reminder;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Reminder>) => void;
}

export function ReminderItem({ reminder, onEdit, onDelete }: ReminderItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [dateFns, setDateFns] = useState<DateFnsModule | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Use snoozed time if available, otherwise use original trigger time
    const triggerTime = reminder.snoozedUntil || reminder.triggerTime;
    const isPast = triggerTime < currentTime;
    const isSnoozed = !!reminder.snoozedUntil;

    // Load date-fns on mount
    useEffect(() => {
        loadDateFns().then(setDateFns);
    }, []);

    // Initialize date and time inputs from trigger time once dateFns is loaded
    useEffect(() => {
        if (dateFns) {
            setDate(dateFns.format(new Date(triggerTime), 'yyyy-MM-dd'));
            setTime(dateFns.format(new Date(triggerTime), 'HH:mm'));
        }
    }, [dateFns, triggerTime]);

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

    const handleSave = () => {
        const dateTime = new Date(`${date}T${time}`);
        const newTriggerTime = dateTime.getTime();

        if (newTriggerTime <= Date.now()) {
            alert('Please select a future date and time');
            return;
        }

        onEdit(reminder.id, { triggerTime: newTriggerTime, snoozedUntil: undefined });
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (dateFns) {
            setDate(dateFns.format(new Date(triggerTime), 'yyyy-MM-dd'));
            setTime(dateFns.format(new Date(triggerTime), 'HH:mm'));
        }
        setIsEditing(false);
    };

    const handleEdit = () => setIsEditing(true);
    const handleDelete = () => onDelete(reminder.id);

    // Format time display and date time, with fallback if dateFns not loaded yet
    const timeDisplay = dateFns ? dateFns.formatDistanceToNow(triggerTime, { addSuffix: false }) : 'Loading...';
    const formattedDateTime = dateFns ? dateFns.format(new Date(triggerTime), 'PPpp') : 'Loading...';

    return (
        <div className='border rounded-lg p-2 space-y-3 bg-card hover:border-primary/50 transition-colors'>
            {/* Header: Title and Actions */}
            <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0 space-y-1'>
                    <h4 className='font-semibold text-sm truncate'>{reminder.title}</h4>
                    <p className='text-xs text-muted-foreground truncate'>{reminder.url}</p>
                </div>

                {!isEditing && (
                    <div className='flex gap-1 shrink-0'>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={handleEdit}
                            className='h-8 w-8 p-0'
                            aria-label='Edit reminder'
                        >
                            <Edit2 className='h-4 w-4' />
                        </Button>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={handleDelete}
                            className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                            aria-label='Delete reminder'
                        >
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </div>
                )}
            </div>

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
                <div className='space-y-3 pt-2'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='space-y-1.5'>
                            <Label htmlFor='date-input' className='text-xs font-medium'>
                                Date
                            </Label>
                            <Input
                                id='date-input'
                                type='date'
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={dateFns ? dateFns.format(new Date(), 'yyyy-MM-dd') : undefined}
                                className='h-9'
                            />
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor='time-input' className='text-xs font-medium'>
                                Time
                            </Label>
                            <Input
                                id='time-input'
                                type='time'
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className='h-9'
                            />
                        </div>
                    </div>

                    <div className='flex gap-2 justify-end pt-1'>
                        <Button size='sm' variant='outline' onClick={handleCancel}>
                            <X className='h-3.5 w-3.5 mr-1.5' />
                            Cancel
                        </Button>
                        <Button size='sm' onClick={handleSave}>
                            <Check className='h-3.5 w-3.5 mr-1.5' />
                            Save
                        </Button>
                    </div>
                </div>
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
}
