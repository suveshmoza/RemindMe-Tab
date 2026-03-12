import { format, formatDistanceToNow } from 'date-fns';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { Reminder } from '@/types/reminder';
import { getTriggerTime, isValidFutureTime } from '@/utils/reminder-helpers';
import { formatRecurrenceLabel } from '@/utils/recurrence';
import { Edit2, Trash2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ReminderItemHeader } from './ReminderItemHeader';
import { ReminderItemEditor } from './ReminderItemEditor';

interface ReminderItemProps {
    reminder: Reminder;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Reminder>) => void;
    onError?: (message: string) => void;
}

export const ReminderItem = memo(function ReminderItem({
    reminder,
    onEdit,
    onDelete,
    onError,
}: ReminderItemProps) {
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
    const handleSave = useCallback(
        (recurrence?: import('@/types/reminder').RecurrenceRule) => {
            const dateTime = new Date(`${date}T${time}`);
            const newTriggerTime = dateTime.getTime();

            if (!isValidFutureTime(newTriggerTime)) {
                const errorMessage = 'Please select a future date and time';
                if (onError) {
                    onError(errorMessage);
                } else {
                    alert(errorMessage);
                }
                return;
            }

            onEdit(reminder.id, {
                triggerTime: newTriggerTime,
                snoozedUntil: undefined,
                recurrence: recurrence ?? undefined,
            });
            setIsEditing(false);
        },
        [date, time, reminder.id, onEdit, onError]
    );

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

    return (
        <div className="border-2 border-border/50 rounded-2xl p-3 bg-card shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300">
            {!isEditing && <ReminderItemHeader title={reminder.title} url={reminder.url} />}

            {/* Progress Bar */}
            {!isEditing && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className={isPast ? 'text-destructive font-medium' : ''}>
                            {isPast ? 'Overdue' : 'Due in'}
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                            {timeDisplay}
                        </span>
                    </div>
                    <Progress value={progress} className="mt-1.5 h-1.5 bg-primary/15" />
                </div>
            )}

            {/* Content: Editing or Display */}
            {isEditing ? (
                <>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-semibold text-sm truncate">{reminder.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{reminder.url}</p>
                        </div>
                    </div>
                    <ReminderItemEditor
                        date={date}
                        time={time}
                        recurrence={reminder.recurrence}
                        onDateChange={setDate}
                        onTimeChange={setTime}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </>
            ) : (
                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] flex-wrap min-w-0">
                        {isSnoozed && (
                            <span className="px-2 py-0.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-200 text-[11px] font-medium">
                                Snoozed
                            </span>
                        )}
                        {reminder.recurrence && (
                            <span className="px-2 py-0.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-[11px] font-medium">
                                Repeats {formatRecurrenceLabel(reminder.recurrence)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleEdit}
                            className="h-7 w-7 rounded-xl"
                            aria-label="Edit reminder"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleDelete}
                            className="h-7 w-7 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete reminder"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
});
