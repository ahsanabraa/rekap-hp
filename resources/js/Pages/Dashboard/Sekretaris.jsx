import { Head, usePage } from '@inertiajs/react';
import { Check, Info, Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';

import AttendanceForm from './Partials/AttendanceForm';
import ChecklistForm from './Partials/ChecklistForm';
import PageHeader from './Partials/PageHeader';
import StatCard from './Partials/StatCard';
import useHashScroll from './Partials/useHashScroll';

export default function SekretarisDashboard({
    schoolClass,
    attendance,
    attendanceLocked,
    date,
    checklistFallback = false,
    flagWindowDays = 30,
}) {
    const user = usePage().props.auth.user;

    useHashScroll();

    if (!schoolClass) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <PageHeader title={`Halo, ${user.name}`} date={date} />
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum terdaftar di kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk melengkapi data kelasmu</p>
                    </div>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Absensi Kelas" />
            <PageHeader title={`Absensi ${schoolClass.name}`} date={date} />

            <div id="ringkasan" className="mb-4 grid scroll-mt-20 gap-3 sm:grid-cols-3">
                <StatCard
                    icon={Users}
                    label="Total siswa"
                    value={schoolClass.students_count ?? schoolClass.students?.length ?? 0}
                    tone="primary"
                />
                <StatCard
                    icon={Check}
                    label="Tercatat masuk"
                    value={
                        attendance
                            ? (schoolClass.students_count ?? schoolClass.students?.length ?? 0) -
                              (attendance.verified_absent_count ?? attendance.absent_count ?? 0)
                            : '-'
                    }
                    tone="success"
                />
                <StatCard
                    icon={Info}
                    label="Tidak masuk"
                    value={attendance ? (attendance.verified_absent_count ?? attendance.absent_count ?? 0) : '-'}
                    tone={attendance ? 'warning' : 'neutral'}
                />
            </div>

            <div id="absensi" className="scroll-mt-20">
                <AttendanceForm
                    schoolClass={schoolClass}
                    attendance={attendance}
                    attendanceLocked={attendanceLocked}
                />
            </div>

            {checklistFallback && (
                <div id="checklist-setoran" className="mt-4 scroll-mt-20">
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-sm text-warning">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Kamu mengisi checklist setoran karena ketua dan wakil ketua tercatat tidak masuk.
                    </div>
                    <ChecklistForm
                        key={`${schoolClass.id}-${schoolClass.deposit?.id ?? 'new'}-${schoolClass.deposit?.status ?? 'new'}-${schoolClass.deposit?.reported_at ?? ''}`}
                        schoolClass={schoolClass}
                        attendance={attendance}
                        flagWindowDays={flagWindowDays}
                    />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
