import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { format, formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import type { Reminder } from '../types/reminder';

interface ReminderItemProps {
  reminder: Reminder;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Reminder>) => void;
}

export function ReminderItem({ reminder, onDelete, onEdit }: ReminderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(format(new Date(reminder.triggerTime), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(reminder.triggerTime), 'HH:mm'));

  const triggerTime = reminder.snoozedUntil || reminder.triggerTime;
  const isPast = triggerTime < Date.now();

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
    setDate(format(new Date(reminder.triggerTime), 'yyyy-MM-dd'));
    setTime(format(new Date(reminder.triggerTime), 'HH:mm'));
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{reminder.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{reminder.url}</p>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-8 text-xs"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <Label className="text-xs">Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSave}
                  className="h-7 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">
                {isPast ? 'Overdue: ' : 'Reminds in: '}
                {formatDistanceToNow(triggerTime, { addSuffix: !isPast })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(triggerTime), 'PPpp')}
              </p>
              {reminder.snoozedUntil && (
                <p className="text-xs text-blue-500">Snoozed</p>
              )}
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(reminder.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

