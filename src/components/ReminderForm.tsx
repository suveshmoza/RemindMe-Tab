import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TimeMode, DurationUnit } from '@/types/reminder-form';
import type { ReminderFormData } from '@/types/reminder-form-data';
import type { TabInfo } from '@/types/tab';
import { DEFAULT_REMINDER_DELAY_MS } from '@/constants';
import { isValidFutureTime } from '@/utils/reminder-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';

interface ReminderFormProps {
    onSubmit: (data: ReminderFormData) => void;
    currentTab?: TabInfo;
}

export function ReminderForm({ onSubmit, currentTab }: ReminderFormProps) {
    const [mode, setMode] = useState<TimeMode>('duration');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        // Set default date to today and time to current time + default delay
        const now = new Date();
        const defaultTime = new Date(now.getTime() + DEFAULT_REMINDER_DELAY_MS);
        setDate(format(defaultTime, 'yyyy-MM-dd'));
        setTime(format(defaultTime, 'HH:mm'));
    }, []);

    const calculateTriggerTime = useCallback((): number | null => {
        const now = Date.now();

        if (mode === 'duration') {
            const durationValue = parseInt(duration);
            if (isNaN(durationValue) || durationValue <= 0) {
                return null;
            }

            let milliseconds = durationValue;
            switch (durationUnit) {
                case 'minutes':
                    milliseconds = durationValue * 60 * 1000;
                    break;
                case 'hours':
                    milliseconds = durationValue * 60 * 60 * 1000;
                    break;
                case 'days':
                    milliseconds = durationValue * 24 * 60 * 60 * 1000;
                    break;
            }

            return now + milliseconds;
        } else {
            if (!date || !time) {
                return null;
            }

            const dateTime = new Date(`${date}T${time}`);
            const triggerTime = dateTime.getTime();

            if (!isValidFutureTime(triggerTime)) {
                return null;
            }

            return triggerTime;
        }
    }, [mode, duration, durationUnit, date, time]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!currentTab) {
                return;
            }

            const triggerTime = calculateTriggerTime();
            if (triggerTime === null) {
                return;
            }

            onSubmit({
                triggerTime,
                title: currentTab.title,
                url: currentTab.url,
                tabId: currentTab.id,
            });

            // Reset form
            setDuration('');
            setMode('duration');
        },
        [currentTab, calculateTriggerTime, onSubmit]
    );

    const isFormValid = useMemo(() => {
        if (!currentTab) return false;
        return calculateTriggerTime() !== null;
    }, [currentTab, calculateTriggerTime]);

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
                <Label>Reminder Type</Label>
                <div className='flex gap-2'>
                    <Button
                        type='button'
                        variant={mode === 'duration' ? 'default' : 'outline'}
                        onClick={() => setMode('duration')}
                        className='flex-1'
                    >
                        Duration
                    </Button>
                    <Button
                        type='button'
                        variant={mode === 'specific' ? 'default' : 'outline'}
                        onClick={() => setMode('specific')}
                        className='flex-1'
                    >
                        Specific Time
                    </Button>
                </div>
            </div>

            {mode === 'duration' ? (
                <div className='space-y-2'>
                    <Label>After how long?</Label>
                    <div className='flex gap-1 px-1'>
                        <Input
                            type='number'
                            min='1'
                            placeholder='Enter duration'
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                            className='flex-1 w-full'
                        />
                        <div className='flex-1 w-full'>
                            <NativeSelect
                                className='w-full'
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                            >
                                <option value='minutes'>Minutes</option>
                                <option value='hours'>Hours</option>
                                <option value='days'>Days</option>
                            </NativeSelect>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='space-y-2'>
                    <div>
                        <Label>Date</Label>
                        <Input
                            type='date'
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
                        />
                    </div>
                    <div>
                        <Label>Time</Label>
                        <Input type='time' value={time} onChange={(e) => setTime(e.target.value)} required />
                    </div>
                </div>
            )}

            {currentTab && <div className='text-sm text-muted-foreground'>Tab: {currentTab.title}</div>}

            {!currentTab && (
                <div className='text-sm text-destructive'>Please open a tab first</div>
            )}

            <Button type='submit' className='w-full' disabled={!isFormValid}>
                Create Reminder
            </Button>
        </form>
    );
}
