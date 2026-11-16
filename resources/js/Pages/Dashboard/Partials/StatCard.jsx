import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
    const tones = {
        primary: 'bg-primary-light text-primary',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        danger: 'bg-danger-light text-danger',
        neutral: 'bg-bg-tertiary text-text-secondary',
    };

    return (
        <Card className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10',
                        tones[tone],
                    )}
                >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-text-muted sm:text-xs">{label}</p>
                    <p className="truncate text-lg font-semibold tabular-nums tracking-tight text-text sm:text-xl">
                        {value}
                    </p>
                    {hint && <p className="truncate text-[11px] text-text-secondary sm:text-xs">{hint}</p>}
                </div>
            </div>
        </Card>
    );
}

export default StatCard;
