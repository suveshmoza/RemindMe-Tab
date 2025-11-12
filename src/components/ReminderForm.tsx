import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { NativeSelect } from './ui/native-select';

type TimeMode = 'duration' | 'specific';

interface ReminderFormProps {
    onSubmit: (data: { triggerTime: number; title: string; url: string; tabId: number }) => void;
    currentTab?: { id: number; title: string; url: string };
}

type DurationUnit = 'minutes' | 'hours' | 'days';

export function ReminderForm({ onSubmit, currentTab }: ReminderFormProps) {
    const [mode, setMode] = useState<TimeMode>('duration');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        // Set default date to today and time to current time + 1 hour
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        setDate(format(oneHourLater, 'yyyy-MM-dd'));
        setTime(format(oneHourLater, 'HH:mm'));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentTab) {
            alert('Please open a tab first');
            return;
        }

        let triggerTime: number;
        const now = Date.now();

        if (mode === 'duration') {
            const durationValue = parseInt(duration);
            if (isNaN(durationValue) || durationValue <= 0) {
                alert('Please enter a valid duration');
                return;
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

            triggerTime = now + milliseconds;
        } else {
            if (!date || !time) {
                alert('Please select both date and time');
                return;
            }

            const dateTime = new Date(`${date}T${time}`);
            triggerTime = dateTime.getTime();

            if (triggerTime <= now) {
                alert('Please select a future date and time');
                return;
            }
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
    };

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

            <Button type='submit' className='w-full'>
                Create Reminder
            </Button>
        </form>
    );
}
