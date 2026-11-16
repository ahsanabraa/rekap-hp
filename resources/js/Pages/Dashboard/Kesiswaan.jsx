import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    GraduationCap,
    PackageCheck,
    ShieldAlert,
    Smartphone,
    Users,
} from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

import PageHeader from './Partials/PageHeader';
import StatCard from './Partials/StatCard';

const quickLinks = [
    {
        name: 'Monitoring kelas',
        description: 'Verifikasi setoran dan tandai box yang sudah diambil.',
        href: '/monitoring',
        icon: ClipboardList,
        tone: 'primary',
    },
    {
        name: 'Status per siswa',
        description: 'Lihat status HP tiap siswa dari checklist ketua kelas.',
        href: '/status',
        icon: Users,
        tone: 'success',
    },
    {
        name: 'Peminjaman',
        description: 'Catat peminjaman HP dan pengembaliannya.',
        href: '/loans',
        icon: Smartphone,
        tone: 'warning',
    },
    {
        name: 'Kelas',
        description: 'Kelola daftar kelas dan wali kelas.',
        href: '/classes',
        icon: BookOpen,
        tone: 'neutral',
    },
    {
        name: 'Siswa',
        description: 'Kelola data siswa dan peran di kelas.',
        href: '/students',
        icon: GraduationCap,
        tone: 'neutral',
    },
];

const toneClasses = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    neutral: 'bg-bg-tertiary text-text-secondary',
};

export default function KesiswaanDashboard({ date, summary = {}, flagThreshold = 3, flagWindowDays = 30 }) {
    const pendingClasses = Math.max(
        0,
        (summary.submitted_classes ?? 0) - (summary.verified_classes ?? 0),
    );

    return (
        <AuthenticatedLayout>
            <Head title="Ringkasan" />
            <PageHeader title="Ringkasan" date={date} />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total siswa"
                    value={summary.total_students ?? 0}
                    hint={`${summary.absent_total ?? 0} tidak masuk · ${summary.attendance_verified_classes ?? 0}/${summary.total_classes ?? 0} absensi terverifikasi`}
                    tone="primary"
                />
                <StatCard
                    icon={ClipboardList}
                    label="Sudah setor"
                    value={`${summary.submitted_classes ?? 0}/${summary.total_classes ?? 0}`}
                    hint={pendingClasses > 0 ? `${pendingClasses} menunggu verifikasi` : 'Semua sudah diverifikasi'}
                    tone={pendingClasses > 0 ? 'warning' : 'success'}
                />
                <StatCard
                    icon={PackageCheck}
                    label="Terverifikasi"
                    value={`${summary.verified_classes ?? 0}/${summary.total_classes ?? 0}`}
                    hint={`${summary.reported_total ?? 0} HP dilaporkan`}
                    tone="success"
                />
                <StatCard
                    icon={ShieldAlert}
                    label="Perlu perhatian"
                    value={summary.flagged_classes ?? 0}
                    hint={`${summary.shortage_classes ?? 0} kelas selisih hari ini · batas ${flagThreshold}x/${flagWindowDays} hari`}
                    tone={(summary.flagged_classes ?? 0) > 0 ? 'danger' : 'neutral'}
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                        <Link key={link.href} href={link.href} className="group block min-w-0">
                            <Card className="h-full min-w-0 overflow-hidden transition-colors group-hover:border-border-strong">
                                <div className="flex items-start gap-3 p-4">
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                                            toneClasses[link.tone],
                                        )}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-text">{link.name}</p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                                            {link.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </AuthenticatedLayout>
    );
}
