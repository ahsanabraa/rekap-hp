import { Badge } from '@/Components/ui/badge';
import { Check, Clock } from 'lucide-react';

function AttendanceStatusBadge({ attendance }) {
    if (!attendance) {
        return <Badge variant="neutral">Absensi belum diisi</Badge>;
    }

    const meta =
        attendance.status === 'terverifikasi'
            ? { label: 'Absensi terverifikasi', variant: 'success', icon: Check }
            : { label: 'Menunggu verifikasi absensi', variant: 'warning', icon: Clock };
    const Icon = meta.icon;

    return (
        <Badge variant={meta.variant}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {meta.label}
        </Badge>
    );
}

export default AttendanceStatusBadge;
