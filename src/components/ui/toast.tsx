import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ToastProps {
    id: string;
    message: string;
    type?: 'error' | 'success' | 'info';
    duration?: number;
    onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'error', duration = 3000, onClose }: ToastProps) {
    const [open, setOpen] = useState(true);

    const close = useCallback(() => {
        setOpen(false);
        window.setTimeout(() => onClose(id), 200);
    }, [id, onClose]);

    useEffect(() => {
        const timer = window.setTimeout(close, duration);
        return () => window.clearTimeout(timer);
    }, [duration, close]);

    const tone = useMemo(() => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle2,
                    label: 'Success',
                    border: 'border-emerald-500/25',
                    bg: 'bg-emerald-500/10',
                    fg: 'text-emerald-950 dark:text-emerald-50',
                    subtle: 'text-emerald-800/80 dark:text-emerald-200/80',
                    iconColor: 'text-emerald-700 dark:text-emerald-200',
                };
            case 'info':
                return {
                    icon: Info,
                    label: 'Info',
                    border: 'border-primary/25',
                    bg: 'bg-primary/10',
                    fg: 'text-foreground',
                    subtle: 'text-muted-foreground',
                    iconColor: 'text-primary',
                };
            case 'error':
            default:
                return {
                    icon: AlertCircle,
                    label: 'Error',
                    border: 'border-destructive/30',
                    bg: 'bg-destructive/10',
                    fg: 'text-foreground',
                    subtle: 'text-muted-foreground',
                    iconColor: 'text-destructive',
                };
        }
    }, [type]);

    const Icon = tone.icon;

    return (
        <div
            className={cn(
                'group flex w-[min(360px,calc(100vw-2rem))] items-start gap-2 rounded-2xl border-2 px-3 py-2 shadow-lg shadow-primary/10 backdrop-blur-sm transition-all duration-200',
                tone.border,
                tone.bg,
                open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
            )}
        >
            <div className="mt-0.5 flex size-7 items-center justify-center rounded-xl">
                <Icon className={cn('size-4', tone.iconColor)} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className={cn('text-[11px] font-bold tracking-wide uppercase', tone.subtle)}>
                        {tone.label}
                    </p>
                </div>
                <p
                    className={cn(
                        'mt-0.5 text-[12px] leading-snug font-medium wrap-break-word',
                        tone.fg
                    )}
                >
                    {message}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className={cn(
                    'ml-auto -mr-1 h-8 w-8 rounded-xl text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10',
                    'opacity-70 group-hover:opacity-100 transition-opacity'
                )}
                aria-label="Dismiss notification"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type?: 'error' | 'success' | 'info' }>;
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={onRemove}
                />
            ))}
        </div>
    );
}
