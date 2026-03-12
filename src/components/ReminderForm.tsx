import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TimeMode, DurationUnit } from '@/types/reminder-form';
import type { ReminderFormData } from '@/types/reminder-form-data';
import type { RecurrencePattern, RecurrenceEndCondition, RecurrenceRule } from '@/types/reminder';
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

    const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
    const [recurrenceInterval, setRecurrenceInterval] = useState('1');
    const [recurrenceEndCondition, setRecurrenceEndCondition] =
        useState<RecurrenceEndCondition>('forever');
    const [endAfterOccurrences, setEndAfterOccurrences] = useState('5');
    const [endDate, setEndDate] = useState('');

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

    const needsInterval = recurrencePattern.startsWith('every-n-');

    const buildRecurrenceRule = useCallback((): RecurrenceRule | undefined => {
        if (!recurrenceEnabled) return undefined;

        const rule: RecurrenceRule = {
            pattern: recurrencePattern,
            endCondition: recurrenceEndCondition,
            occurrenceCount: 0,
        };

        if (needsInterval) {
            const val = parseInt(recurrenceInterval);
            if (isNaN(val) || val <= 0) return undefined;
            rule.interval = val;
        }

        if (recurrenceEndCondition === 'after-occurrences') {
            const val = parseInt(endAfterOccurrences);
            if (isNaN(val) || val <= 0) return undefined;
            rule.endAfterOccurrences = val;
        } else if (recurrenceEndCondition === 'until-date') {
            if (!endDate) return undefined;
            const d = new Date(endDate).getTime();
            if (!isValidFutureTime(d)) return undefined;
            rule.endDate = d;
        }

        return rule;
    }, [
        recurrenceEnabled,
        recurrencePattern,
        recurrenceEndCondition,
        recurrenceInterval,
        endAfterOccurrences,
        endDate,
        needsInterval,
    ]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!currentTab) return;

            const triggerTime = calculateTriggerTime();
            if (triggerTime === null) return;

            const recurrence = buildRecurrenceRule();
            if (recurrenceEnabled && !recurrence) return;

            onSubmit({
                triggerTime,
                title: currentTab.title,
                url: currentTab.url,
                tabId: currentTab.id,
                ...(recurrence ? { recurrence } : {}),
            });

            setDuration('');
            setMode('duration');
            setRecurrenceEnabled(false);
        },
        [currentTab, calculateTriggerTime, onSubmit, buildRecurrenceRule, recurrenceEnabled]
    );

    const isFormValid = useMemo(() => {
        if (!currentTab) return false;
        if (calculateTriggerTime() === null) return false;
        if (recurrenceEnabled && !buildRecurrenceRule()) return false;
        return true;
    }, [currentTab, calculateTriggerTime, recurrenceEnabled, buildRecurrenceRule]);

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                    When should we remind you?
                </Label>
                <div className="flex p-0.5 bg-muted rounded-xl border border-border/50">
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'duration' ? 'default' : 'ghost'}
                        onClick={() => setMode('duration')}
                        className={`flex-1 h-8 rounded-lg transition-all duration-300 ${mode === 'duration' ? 'shadow-sm' : 'hover:bg-background/50'}`}
                    >
                        Duration
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'specific' ? 'default' : 'ghost'}
                        onClick={() => setMode('specific')}
                        className={`flex-1 h-8 rounded-lg transition-all duration-300 ${mode === 'specific' ? 'shadow-sm' : 'hover:bg-background/50'}`}
                    >
                        Specific time
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-sm p-2.5 shadow-sm">
                {mode === 'duration' ? (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Remind me in...</Label>
                        <div className="flex gap-1">
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 15"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                                className="flex-1 h-9 text-base font-medium rounded-xl"
                            />
                            <div className="w-28">
                                <NativeSelect
                                    className="w-full h-9 rounded-xl border-2 border-input/50 bg-transparent px-3 text-sm font-medium"
                                    value={durationUnit}
                                    onChange={(e) =>
                                        setDurationUnit(e.target.value as DurationUnit)
                                    }
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </NativeSelect>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-1">
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={format(new Date(), 'yyyy-MM-dd')}
                                className="h-9 text-sm font-medium rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Time</Label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="h-9 text-sm font-medium rounded-xl"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Recurrence Toggle */}
            <div className="bg-card border border-border/50 rounded-sm p-2.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                    <Label
                        htmlFor="recurrence-toggle"
                        className="text-xs font-medium cursor-pointer"
                    >
                        Repeat this reminder?
                    </Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="recurrence-toggle"
                            checked={recurrenceEnabled}
                            onChange={(e) => setRecurrenceEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {recurrenceEnabled && (
                    <div className="pt-2.5 border-t border-border/50 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                How often?
                            </Label>
                            <NativeSelect
                                className="w-full h-9 rounded-xl border-2 border-input/50 bg-transparent px-3 text-sm font-medium"
                                value={recurrencePattern}
                                onChange={(e) =>
                                    setRecurrencePattern(e.target.value as RecurrencePattern)
                                }
                            >
                                <option value="daily">Every day</option>
                                <option value="weekly">Every week</option>
                                <option value="every-n-days">Custom days</option>
                                <option value="every-n-hours">Custom hours</option>
                                <option value="every-n-minutes">Custom minutes</option>
                            </NativeSelect>
                        </div>

                        {needsInterval && (
                            <div className="space-y-1 animate-in fade-in duration-300">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Every
                                </Label>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 3"
                                        value={recurrenceInterval}
                                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                                        required
                                        className="flex-1 h-9 text-sm font-medium rounded-xl"
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {recurrencePattern.replace('every-n-', '')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                When does it end?
                            </Label>
                            <NativeSelect
                                className="w-full h-9 rounded-xl border-2 border-input/50 bg-transparent px-3 text-sm font-medium"
                                value={recurrenceEndCondition}
                                onChange={(e) =>
                                    setRecurrenceEndCondition(
                                        e.target.value as RecurrenceEndCondition
                                    )
                                }
                            >
                                <option value="forever">Never (repeat forever)</option>
                                <option value="after-occurrences">After specific times</option>
                                <option value="until-date">On specific date</option>
                            </NativeSelect>
                        </div>

                        {recurrenceEndCondition === 'after-occurrences' && (
                            <div className="space-y-1 animate-in fade-in duration-300">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Stop after
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 5"
                                        value={endAfterOccurrences}
                                        onChange={(e) => setEndAfterOccurrences(e.target.value)}
                                        required
                                        className="w-20 h-9 text-sm font-medium rounded-xl"
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        times
                                    </span>
                                </div>
                            </div>
                        )}

                        {recurrenceEndCondition === 'until-date' && (
                            <div className="space-y-1 animate-in fade-in duration-300">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Stop on
                                </Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {currentTab && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-primary/10 rounded-sm border border-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <div className="text-[11px] font-medium text-primary truncate">
                        Saving: {currentTab.title}
                    </div>
                </div>
            )}

            {!currentTab && (
                <div className="text-[11px] text-destructive p-2 bg-destructive/10 rounded-sm border border-destructive/20">
                    Please open a tab first
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-10 text-sm font-bold shadow-sm shadow-primary/20"
                disabled={!isFormValid}
            >
                Create Reminder
            </Button>
        </form>
    );
}
