import { Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { statusTone } from './constants';

function StatusIcon({ label, icon: Icon = Info, tone = 'neutral', className }) {
    return (
        <span
            role="img"
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                statusTone[tone] ?? statusTone.neutral,
                className,
            )}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
    );
}

export default StatusIcon;
