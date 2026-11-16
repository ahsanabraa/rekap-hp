import { Check, ClipboardCheck, ClipboardList, Crown, Info, PackageCheck, ShieldAlert } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

import DepositStatusBadge from './DepositStatusBadge';
import DepositInfo from './DepositInfo';
import DepositMetrics from './DepositMetrics';

function KesiswaanClassCard({ schoolClass, onVerify, onRelease, flagWindowDays }) {
    const deposit = schoolClass.deposit;
    const classLeader = schoolClass.students?.find((student) => student.is_class_leader);
    const classSecretary = schoolClass.students?.find((student) => student.is_class_secretary);
    const attendance = schoolClass.attendance;
    const absentCount = attendance?.verified_absent_count ?? attendance?.absent_count ?? 0;
    const difference =
        deposit?.verified_count === null || deposit?.verified_count === undefined
            ? null
            : deposit.verified_count - deposit.reported_count;

    return (
        <Card className={cn('min-w-0 overflow-hidden', schoolClass.needs_attention && 'border-danger/50')}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{schoolClass.name}</p>
                        <p className="mt-0.5 truncate text-xs text-text-secondary">
                            {schoolClass.homeroom?.name ?? 'Belum ada wali kelas'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-muted">
                            <Crown className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {classLeader?.user?.name ?? 'Ketua kelas belum ditunjuk'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-muted">
                            <ClipboardList className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {classSecretary?.user?.name ?? 'Sekretaris belum ditunjuk'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-muted">
                            <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {attendance
                                ? `${absentCount} tidak masuk · ${
                                      attendance.status === 'terverifikasi'
                                          ? 'absensi terverifikasi'
                                          : 'menunggu verifikasi absensi'
                                  }`
                                : 'Absensi belum diisi'}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        <DepositStatusBadge deposit={deposit} />
                        {schoolClass.needs_attention && (
                            <span
                                className="inline-flex items-center gap-1 rounded-full bg-danger-light px-2 py-0.5 text-[10px] font-semibold text-danger"
                                title={`${schoolClass.shortages_last_30_days}x jumlah kurang dalam ${flagWindowDays} hari`}
                            >
                                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                                Perhatian
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-3">
                    <DepositMetrics deposit={deposit} />
                </div>

                {difference !== null && difference !== 0 && (
                    <p
                        className={cn(
                            'mt-2 rounded-md px-2.5 py-1.5 text-xs font-medium',
                            difference < 0
                                ? 'bg-danger-light text-danger'
                                : 'bg-warning-light text-warning',
                        )}
                    >
                        {difference < 0
                            ? `Kurang ${Math.abs(difference)} HP dari laporan ketua kelas.`
                            : `Lebih ${difference} HP dari laporan ketua kelas.`}
                    </p>
                )}

                <DepositInfo deposit={deposit} />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {deposit?.status === 'menunggu_verifikasi' && (
                        <Button size="sm" onClick={() => onVerify(schoolClass)} className="gap-1.5">
                            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Verifikasi jumlah
                        </Button>
                    )}
                    {(deposit?.status === 'terverifikasi' || deposit?.status === 'selisih') && !deposit.released_at && (
                        <Button size="sm" variant="outline" onClick={() => onVerify(schoolClass)} className="gap-1.5">
                            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Ubah verifikasi
                        </Button>
                    )}
                    {deposit && deposit.verified_count !== null && !deposit.released_at && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onRelease(schoolClass)}
                            className="gap-1.5"
                        >
                            <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Tandai box diambil
                        </Button>
                    )}
                    {deposit?.released_at && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            Sudah diambil
                        </span>
                    )}
                    {!deposit && (
                        <span className="text-xs text-text-muted">Menunggu ketua kelas mengirim checklist.</span>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default KesiswaanClassCard;
