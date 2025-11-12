import { memo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface ReminderItemHeaderProps {
    title: string;
    url: string;
    onEdit: () => void;
    onDelete: () => void;
}

export const ReminderItemHeader = memo(function ReminderItemHeader({
    title,
    url,
    onEdit,
    onDelete,
}: ReminderItemHeaderProps) {
    return (
        <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0 space-y-1'>
                <h4 className='font-semibold text-sm truncate'>{title}</h4>
                <p className='text-xs text-muted-foreground truncate'>{url}</p>
            </div>

            <div className='flex gap-1 shrink-0'>
                <Button
                    size='sm'
                    variant='ghost'
                    onClick={onEdit}
                    className='h-8 w-8 p-0'
                    aria-label='Edit reminder'
                >
                    <Edit2 className='h-4 w-4' />
                </Button>
                <Button
                    size='sm'
                    variant='ghost'
                    onClick={onDelete}
                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                    aria-label='Delete reminder'
                >
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>
        </div>
    );
});

