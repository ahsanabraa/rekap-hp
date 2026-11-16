import { cn } from '@/lib/utils';

import { statusTone } from './constants';

function StatusLegend({ items = [], className }) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-bg-secondary px-2.5 py-2',
                className,
            )}
        >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Keterangan</span>
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <span
                        key={item.key}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary sm:text-xs"
                    >
                        <span
                            className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                                statusTone[item.tone] ?? statusTone.neutral,
                            )}
                        >
                            <Icon className="h-3 w-3" aria-hidden="true" />
                        </span>
                        {item.label}
                    </span>
                );
            })}
        </div>
    );
}

export default StatusLegend;
