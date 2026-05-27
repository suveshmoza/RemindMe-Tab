import { memo, useState } from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import type { RecurrenceRule, RecurrencePattern, RecurrenceEndCondition } from '@/types/reminder';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { NativeSelect } from '../ui/native-select';

interface ReminderItemEditorProps {
    date: string;
    time: string;
    recurrence?: RecurrenceRule;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onSave: (recurrence?: RecurrenceRule) => void;
    onCancel: () => void;
}

export const ReminderItemEditor = memo(function ReminderItemEditor({
    date,
    time,
    recurrence,
    onDateChange,
    onTimeChange,
    onSave,
    onCancel,
}: ReminderItemEditorProps) {
    const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!recurrence);
    const [pattern, setPattern] = useState<RecurrencePattern>(recurrence?.pattern ?? 'daily');
    const [interval, setInterval] = useState(String(recurrence?.interval ?? 1));
    const [endCondition, setEndCondition] = useState<RecurrenceEndCondition>(
        recurrence?.endCondition ?? 'forever'
    );
    const [endAfter, setEndAfter] = useState(String(recurrence?.endAfterOccurrences ?? 5));
    const [endDate, setEndDate] = useState(
        recurrence?.endDate ? format(new Date(recurrence.endDate), 'yyyy-MM-dd') : ''
    );

    const needsInterval = pattern.startsWith('every-n-');

    const handleSave = () => {
        if (!recurrenceEnabled) {
            onSave(undefined);
            return;
        }

        const rule: RecurrenceRule = {
            pattern,
            endCondition,
            occurrenceCount: recurrence?.occurrenceCount ?? 0,
        };

        if (needsInterval) {
            const val = parseInt(interval);
            if (isNaN(val) || val <= 0) return;
            rule.interval = val;
        }

        if (endCondition === 'after-occurrences') {
            const val = parseInt(endAfter);
            if (isNaN(val) || val <= 0) return;
            rule.endAfterOccurrences = val;
        } else if (endCondition === 'until-date') {
            if (!endDate) return;
            rule.endDate = new Date(endDate).getTime();
        }

        onSave(rule);
    };

    return (
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
                        onChange={(e) => onDateChange(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
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
                        onChange={(e) => onTimeChange(e.target.value)}
                        className='h-9'
                    />
                </div>
            </div>

            {/* Recurrence editing */}
            <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                    <input
                        type='checkbox'
                        id='edit-recurrence-toggle'
                        checked={recurrenceEnabled}
                        onChange={(e) => setRecurrenceEnabled(e.target.checked)}
                        className='h-3.5 w-3.5 rounded border-border accent-primary'
                    />
                    <Label htmlFor='edit-recurrence-toggle' className='text-xs font-medium'>
                        Repeat
                    </Label>
                </div>

                {recurrenceEnabled && (
                    <div className='space-y-2 pl-4 border-l-2 border-primary/20'>
                        <NativeSelect
                            className='w-full h-8 text-xs'
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value as RecurrencePattern)}
                        >
                            <option value='daily'>Daily</option>
                            <option value='weekly'>Weekly</option>
                            <option value='every-n-days'>Every X days</option>
                            <option value='every-n-hours'>Every X hours</option>
                            <option value='every-n-minutes'>Every X minutes</option>
                        </NativeSelect>

                        {needsInterval && (
                            <Input
                                type='number'
                                min='1'
                                placeholder='Interval'
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className='h-8 text-xs'
                            />
                        )}

                        <NativeSelect
                            className='w-full h-8 text-xs'
                            value={endCondition}
                            onChange={(e) =>
                                setEndCondition(e.target.value as RecurrenceEndCondition)
                            }
                        >
                            <option value='forever'>Never (repeat forever)</option>
                            <option value='after-occurrences'>After N times</option>
                            <option value='until-date'>Until date</option>
                        </NativeSelect>

                        {endCondition === 'after-occurrences' && (
                            <Input
                                type='number'
                                min='1'
                                placeholder='Times'
                                value={endAfter}
                                onChange={(e) => setEndAfter(e.target.value)}
                                className='h-8 text-xs'
                            />
                        )}

                        {endCondition === 'until-date' && (
                            <Input
                                type='date'
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                className='h-8 text-xs'
                            />
                        )}
                    </div>
                )}
            </div>

            <div className='flex gap-2 justify-end pt-1'>
                <Button size='sm' variant='outline' onClick={onCancel}>
                    <X className='h-3.5 w-3.5 mr-1.5' />
                    Cancel
                </Button>
                <Button size='sm' onClick={handleSave}>
                    <Check className='h-3.5 w-3.5 mr-1.5' />
                    Save
                </Button>
            </div>
        </div>
    );
});
