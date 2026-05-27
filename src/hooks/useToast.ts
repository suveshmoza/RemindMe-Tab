import { useCallback, useState } from 'react';

interface Toast {
    id: string;
    message: string;
    type?: 'error' | 'success' | 'info';
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'error') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const showSuccess = useCallback(
        (message: string) => showToast(message, 'success'),
        [showToast]
    );
    const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return {
        toasts,
        showToast,
        showError,
        showSuccess,
        showInfo,
        removeToast,
    };
}
