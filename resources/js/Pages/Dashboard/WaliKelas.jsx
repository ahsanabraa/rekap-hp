import { Head, Link, usePage } from '@inertiajs/react';
import { Check, ClipboardList, Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';

import AttentionNotice from './Partials/AttentionNotice';
import DepositInfo from './Partials/DepositInfo';
import DepositMetrics from './Partials/DepositMetrics';
import DepositStatusBadge from './Partials/DepositStatusBadge';
import PageHeader from './Partials/PageHeader';
import StatCard from './Partials/StatCard';
import WaliKelasAttendanceCard from './Partials/WaliKelasAttendanceCard';
import useHashScroll from './Partials/useHashScroll';

export default function WaliKelasDashboard({ schoolClass, date, flagWindowDays = 30 }) {
    const user = usePage().props.auth.user;

    useHashScroll();

    if (!schoolClass) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <PageHeader title={`Halo, ${user.name}`} date={date} />
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <Users className="empty-state-icon h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum memiliki kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk mendapatkan akses ke kelas</p>
                    </div>
                </Card>
            </AuthenticatedLayout>
        );
    }

    const deposit = schoolClass.deposit;
    const students = schoolClass.students ?? [];
    const collected = deposit?.reported_count ?? 0;
    const notCollected = Math.max(0, (schoolClass.students_count ?? students.length) - collected);
    const progress =
        (schoolClass.students_count ?? students.length) > 0
            ? Math.round((collected / (schoolClass.students_count ?? students.length)) * 100)
            : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="flex flex-wrap items-start justify-between gap-2">
                <PageHeader title={schoolClass.name} date={date} />
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href="/status">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        Status per siswa
                    </Link>
                </Button>
            </div>

            <div id="ringkasan" className="mb-4 grid scroll-mt-20 gap-3 sm:grid-cols-3">
                <StatCard icon={Users} label="Total siswa" value={schoolClass.students_count ?? students.length} tone="primary" />
                <StatCard icon={Check} label="Setor" value={deposit ? collected : '-'} hint={`${progress}% dari jumlah siswa`} tone="success" />
                <StatCard
                    icon={ClipboardList}
                    label="Status setoran"
                    value={
                        deposit?.verified_count === null || deposit?.verified_count === undefined
                            ? deposit
                                ? 'Menunggu'
                                : 'Belum setor'
                            : `${deposit.verified_count} fisik`
                    }
                    hint={deposit?.released_at ? 'Box sudah diambil' : undefined}
                    tone={deposit ? 'warning' : 'neutral'}
                />
            </div>

            <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />

            <div id="absensi" className="scroll-mt-20">
                <WaliKelasAttendanceCard
                    schoolClass={schoolClass}
                    attendance={schoolClass.attendance}
                    attendanceLocked={schoolClass.attendance_locked}
                    students={students}
                />
            </div>

            <Card id="ringkasan-setoran" className="mb-4 min-w-0 scroll-mt-20 overflow-hidden">
                <div className="border-b px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold text-text">Ringkasan setoran hari ini</h2>
                            <p className="mt-0.5 text-xs text-text-secondary">Read-only, dikelola ketua kelas dan kesiswaan</p>
                        </div>
                        <DepositStatusBadge deposit={deposit} />
                    </div>
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                    <DepositMetrics deposit={deposit} />
                    <DepositInfo deposit={deposit} />
                    <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
                            <span>Progres pengumpulan</span>
                            <span className="tabular-nums">
                                {collected}/{schoolClass.students_count ?? students.length}
                            </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <p className="mt-1.5 text-xs text-text-muted">
                            {deposit
                                ? `${notCollected} siswa belum tercatat setor pada laporan ketua kelas.`
                                : 'Ketua kelas belum mengirim checklist hari ini.'}
                        </p>
                    </div>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
