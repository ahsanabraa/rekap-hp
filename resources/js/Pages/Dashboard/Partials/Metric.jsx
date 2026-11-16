import { cn } from '@/lib/utils';

function Metric({ label, value, tone = 'neutral' }) {
    const tones = {
        neutral: 'text-text',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
    };

    return (
        <div className="rounded-lg bg-bg-secondary px-2 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted sm:text-[11px]">{label}</p>
            <p className={cn('mt-0.5 text-base font-semibold tabular-nums sm:text-lg', tones[tone])}>{value}</p>
        </div>
    );
}

export default Metric;
