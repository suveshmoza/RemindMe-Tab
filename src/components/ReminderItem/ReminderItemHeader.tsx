import { memo, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

interface ReminderItemHeaderProps {
    title: string;
    url: string;
}

export const ReminderItemHeader = memo(function ReminderItemHeader({
    title,
    url,
}: ReminderItemHeaderProps) {
    const { hostname } = useMemo(() => {
        try {
            const parsed = new URL(url);
            const h = parsed.hostname.replace(/^www\./, '');
            const d = `${h}${parsed.pathname === '/' ? '' : parsed.pathname}`;
            return { hostname: h, displayUrl: d };
        } catch {
            return { hostname: '', displayUrl: url };
        }
    }, [url]);

    return (
        <div className='flex items-center justify-between gap-2'>
            <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2 min-w-0'>
                    <div
                        className='mt-0.5 size-2 rounded-full bg-primary/70 shrink-0'
                        aria-hidden='true'
                    />
                    <h4 className='font-semibold text-[13px] leading-snug truncate'>{title}</h4>
                </div>
                {hostname && (
                    <div className='mt-1'>
                        <span className='inline-flex items-center rounded-lg border border-border/50 bg-background/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                            {hostname}
                        </span>
                    </div>
                )}
            </div>

            <a
                href={url}
                target='_blank'
                rel='noreferrer'
                className='shrink-0 max-w-[160px] inline-flex items-center gap-1 rounded-xl border border-border/50 bg-background/40 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-background/60 transition-colors'
                title={url}
            >
                <span className='truncate'>Visit</span>
                <ExternalLink className='size-3 opacity-70 shrink-0' aria-hidden='true' />
            </a>
        </div>
    );
});
