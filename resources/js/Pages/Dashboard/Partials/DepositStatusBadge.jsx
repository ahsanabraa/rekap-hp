import { Badge } from '@/Components/ui/badge';
import { Info } from 'lucide-react';

import { depositStatusMeta } from './constants';

function DepositStatusBadge({ deposit }) {
    if (!deposit) {
        return <Badge variant="neutral">Belum setor</Badge>;
    }

    const meta = depositStatusMeta[deposit.status] ?? {
        label: deposit.status,
        variant: 'neutral',
        icon: Info,
    };
    const Icon = meta.icon;

    return (
        <Badge variant={meta.variant}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {meta.label}
        </Badge>
    );
}

export default DepositStatusBadge;
