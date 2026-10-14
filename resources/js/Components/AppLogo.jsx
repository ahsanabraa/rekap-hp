import { cn } from '@/lib/utils';

function LogoMark({ className }) {
    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
            <rect x="10.5" y="5.5" width="11" height="21" rx="3" stroke="hsl(var(--color-text))" strokeWidth="1.8" />
            <line x1="14" y1="8.5" x2="18" y2="8.5" stroke="hsl(var(--color-text))" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
            <path
                d="M13.2 15.4l2.6 2.6 4.2-4.8"
                stroke="hsl(var(--color-primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <line x1="14.2" y1="19.6" x2="17.8" y2="19.6" stroke="hsl(var(--color-text))" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
            <line x1="14.2" y1="22" x2="16.5" y2="22" stroke="hsl(var(--color-text))" strokeWidth="1.4" strokeLinecap="round" opacity="0.2" />
        </svg>
    );
}

export function AppLogoMark({ className }) {
    return <LogoMark className={className} />;
}

export default function AppLogo({ size = 'md', showTagline = false, className }) {
    const markSize = {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-11 w-11',
    }[size];

    const titleSize = {
        sm: 'text-[16px]',
        md: 'text-[17px]',
        lg: 'text-[20px]',
    }[size];

    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <LogoMark className={cn(markSize, 'shrink-0')} />
            <span className="flex min-w-0 flex-col justify-center leading-none">
                <span className={cn('font-bold tracking-[-0.02em] text-text', titleSize)}>
                    Rekap<span className="text-primary">HP</span>
                </span>
                {showTagline ? (
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                        Pendataan HP
                    </span>
                ) : null}
            </span>
        </span>
    );
}
