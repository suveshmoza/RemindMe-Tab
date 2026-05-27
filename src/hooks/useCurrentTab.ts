import type { TabInfo } from '@/types/tab';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

export function useCurrentTab() {
    const [currentTab, setCurrentTab] = useState<TabInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadCurrentTab = async () => {
            try {
                setError(null);
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                const tab = tabs[0];

                if (tab && tab.id && tab.title && tab.url) {
                    setCurrentTab({
                        id: tab.id,
                        title: tab.title,
                        url: tab.url,
                    });
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to load current tab');
                setError(error);
                console.error('Error loading current tab:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentTab();
    }, []);

    return { currentTab, loading, error };
}
