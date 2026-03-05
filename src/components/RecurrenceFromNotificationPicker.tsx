import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

const QUICK_OPTIONS = [
    { label: '5 min', minutes: 5 },
    { label: '10 min', minutes: 10 },
    { label: '30 min', minutes: 30 },
    { label: '1 hour', minutes: 60 },
];

interface RecurrenceFromNotificationPickerProps {
    open: boolean;
    onPick: (intervalMinutes: number) => void;
    onCancel: () => void;
}

export function RecurrenceFromNotificationPicker({
    open,
    onPick,
    onCancel,
}: RecurrenceFromNotificationPickerProps) {
    const [customValue, setCustomValue] = useState('15');
    const [customUnit, setCustomUnit] = useState<'minutes' | 'hours'>('minutes');

    const handleCustomSubmit = useCallback(() => {
        const val = parseInt(customValue);
        if (isNaN(val) || val <= 0) return;
        const minutes = customUnit === 'hours' ? val * 60 : val;
        onPick(minutes);
    }, [customValue, customUnit, onPick]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Set Recurring Reminder</DialogTitle>
                    <DialogDescription>
                        Choose how often to repeat this reminder
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-2'>
                        {QUICK_OPTIONS.map((opt) => (
                            <Button
                                key={opt.minutes}
                                variant='outline'
                                className='w-full'
                                onClick={() => onPick(opt.minutes)}
                            >
                                Every {opt.label}
                            </Button>
                        ))}
                    </div>

                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Custom interval</Label>
                        <div className='flex gap-2'>
                            <Input
                                type='number'
                                min='1'
                                placeholder='Value'
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                className='flex-1'
                            />
                            <div className='flex-1'>
                                <NativeSelect
                                    className='w-full'
                                    value={customUnit}
                                    onChange={(e) => setCustomUnit(e.target.value as 'minutes' | 'hours')}
                                >
                                    <option value='minutes'>Minutes</option>
                                    <option value='hours'>Hours</option>
                                </NativeSelect>
                            </div>
                        </div>
                        <Button className='w-full' onClick={handleCustomSubmit}>
                            Set Custom Interval
                        </Button>
                    </div>

                    <Button variant='outline' className='w-full' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
