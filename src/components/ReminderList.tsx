import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ReminderItem } from './ReminderItem';
import type { Reminder } from '../types/reminder';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Reminder>) => void;
}

export function ReminderList({ reminders, onDelete, onEdit }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No active reminders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Reminders</CardTitle>
        <CardDescription>Manage your tab reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

