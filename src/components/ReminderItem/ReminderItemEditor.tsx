import { memo } from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ReminderItemEditorProps {
    date: string;
    time: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const ReminderItemEditor = memo(function ReminderItemEditor({
    date,
    time,
    onDateChange,
    onTimeChange,
    onSave,
    onCancel,
}: ReminderItemEditorProps) {
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

            <div className='flex gap-2 justify-end pt-1'>
                <Button size='sm' variant='outline' onClick={onCancel}>
                    <X className='h-3.5 w-3.5 mr-1.5' />
                    Cancel
                </Button>
                <Button size='sm' onClick={onSave}>
                    <Check className='h-3.5 w-3.5 mr-1.5' />
                    Save
                </Button>
            </div>
        </div>
    );
});

