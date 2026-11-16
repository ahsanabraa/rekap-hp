import { Head, usePage } from '@inertiajs/react';
import { Check, PackageCheck, Smartphone, Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';

import ChecklistForm from './Partials/ChecklistForm';
import PageHeader from './Partials/PageHeader';
import StatCard from './Partials/StatCard';
import useHashScroll from './Partials/useHashScroll';

export default function KetuaKelasDashboard({
    schoolClass,
    attendance,
    attendanceLocked,
    date,
    flagWindowDays = 30,
}) {
    const user = usePage().props.auth.user;

    useHashScroll();

    const deposit = schoolClass?.deposit;
    const studentsCount = schoolClass?.students_count ?? schoolClass?.students?.length ?? 0;
    const collected = deposit?.reported_count ?? 0;
    const progress = studentsCount > 0 ? Math.round((collected / studentsCount) * 100) : 0;

    if (!schoolClass) {
        return (
            <AuthenticatedLayout>
                <Head title="Dashboard" />
                <PageHeader title={`Halo, ${user.name}`} date={date} />
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum terdaftar di kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk melengkapi data kelasmu</p>
                    </div>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Setoran HP" />
            <PageHeader title={`Setoran ${schoolClass.name}`} date={date} />

            <div id="ringkasan" className="mb-4 grid scroll-mt-20 gap-3 sm:grid-cols-3">
                <StatCard icon={Users} label="Total siswa" value={studentsCount} tone="primary" />
                <StatCard
                    icon={Check}
                    label="Dilaporkan setor"
                    value={deposit ? collected : '-'}
                    hint={deposit ? `${progress}% dari jumlah siswa` : 'Belum ada checklist'}
                    tone="success"
                />
                <StatCard
                    icon={PackageCheck}
                    label="Hasil verifikasi"
                    value={deposit?.verified_count ?? '-'}
                    hint={deposit?.released_at ? 'Box sudah diambil' : 'Diverifikasi kesiswaan'}
                    tone={deposit?.verified_count === null || deposit?.verified_count === undefined ? 'neutral' : 'warning'}
                />
            </div>

            <div id="checklist-setoran" className="scroll-mt-20">
                <ChecklistForm
                    key={`${schoolClass.id}-${deposit?.id ?? 'new'}-${deposit?.status ?? 'new'}-${deposit?.reported_at ?? ''}`}
                    schoolClass={schoolClass}
                    attendance={attendance}
                    attendanceLocked={attendanceLocked}
                    flagWindowDays={flagWindowDays}
                />
            </div>
        </AuthenticatedLayout>
    );
}
