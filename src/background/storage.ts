import type { Reminder } from '../types/reminder';

const STORAGE_KEY = 'reminders';

export async function getReminders(): Promise<Reminder[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: reminders });
}

export async function addReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  reminders.push(reminder);
  await saveReminders(reminders);
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === id);
  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...updates };
    await saveReminders(reminders);
  }
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  await saveReminders(filtered);
}

export async function getReminder(id: string): Promise<Reminder | undefined> {
  const reminders = await getReminders();
  return reminders.find(r => r.id === id);
}

