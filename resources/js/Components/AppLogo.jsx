import { cn } from '@/lib/utils';

export function AppLogoMark({ className }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'relative inline-flex select-none items-center justify-center overflow-hidden rounded-[10px] bg-primary font-bold leading-none tracking-[-0.03em] text-white',
                className
            )}
        >
            <span className="relative -translate-y-[0.06em]">R</span>
            <span className="absolute bottom-[0.35em] left-1/2 h-[0.14em] w-[0.7em] -translate-x-1/2 rounded-full bg-white/50" />
        </span>
    );
}

export default function AppLogo({ size = 'md', showTagline = false, className }) {
    const sizes = {
        sm: {
            mark: 'h-8 w-8 text-[15px]',
            title: 'text-[16px]',
            tagline: 'text-[9px] tracking-[0.12em]',
        },
        md: {
            mark: 'h-9 w-9 text-[17px]',
            title: 'text-[17px]',
            tagline: 'text-[10px] tracking-[0.14em]',
        },
        lg: {
            mark: 'h-11 w-11 text-[20px]',
            title: 'text-[20px]',
            tagline: 'text-[10px] tracking-[0.14em]',
        },
    }[size];

    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <AppLogoMark className={cn(sizes.mark, 'shrink-0')} />
            <span className="flex min-w-0 flex-col justify-center leading-none">
                <span className={cn('font-bold tracking-[-0.02em] text-text', sizes.title)}>
                    Rekap<span className="text-primary">HP</span>
                </span>
                {showTagline ? (
                    <span
                        className={cn(
                            'mt-1 font-semibold uppercase text-text-muted',
                            sizes.tagline
                        )}
                    >
                        Pendataan HP
                    </span>
                ) : null}
            </span>
        </span>
    );
}
