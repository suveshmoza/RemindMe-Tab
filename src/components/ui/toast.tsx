import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ToastProps {
    message: string;
    type?: 'error' | 'success' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'error', duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        error: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-600 text-white',
        info: 'bg-blue-600 text-white',
    };

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg transition-opacity',
                typeStyles[type],
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
        >
            <p className='text-sm font-medium'>{message}</p>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className='h-6 w-6 text-current hover:bg-black/20'
            >
                <X className='h-4 w-4' />
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
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </>
    );
}

