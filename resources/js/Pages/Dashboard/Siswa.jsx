import { Head, usePage } from '@inertiajs/react';
import { Calendar, Info, Smartphone } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Card } from '@/Components/ui/card';

import DepositMetrics from './Partials/DepositMetrics';
import DepositStatusBadge from './Partials/DepositStatusBadge';
import Metric from './Partials/Metric';
import PageHeader from './Partials/PageHeader';
import { formatDate, formatTime, studentStatusMeta } from './Partials/constants';
import useHashScroll from './Partials/useHashScroll';

export default function SiswaDashboard({
    schoolClass,
    deposit,
    ownStatus,
    date,
    history = [],
    historySummary = null,
    activeLoan = null,
}) {
    const user = usePage().props.auth.user;

    useHashScroll();

    const meta = ownStatus ? studentStatusMeta[ownStatus] : null;
    const Icon = meta?.icon ?? Info;
    const summary = historySummary ?? {
        deposit_days: 0,
        dikumpulkan: 0,
        tidak_mengumpulkan: 0,
        tidak_masuk: 0,
        sedang_dipinjam: 0,
    };
    const loanOverdue = activeLoan?.ends_at && new Date(activeLoan.ends_at) < new Date();

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <PageHeader title={`Halo, ${user.name}`} subtitle="Status pengumpulan HP hari ini" date={date} />

            <div className="grid gap-3 sm:grid-cols-2">
                <Card id="status-hp" className="min-w-0 scroll-mt-20 overflow-hidden">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                                <Smartphone className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text">Status HP kamu</p>
                                <p className="truncate text-xs text-text-secondary">{schoolClass?.name ?? 'Belum ada kelas'}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant={meta?.variant ?? 'neutral'} className="px-3 py-1 text-sm">
                                <Icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                                {meta?.label ?? 'Belum didata'}
                            </Badge>
                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                            {ownStatus === 'dikumpulkan'
                                ? 'HP kamu sudah tercatat dikumpulkan oleh ketua kelas.'
                                : ownStatus === 'tidak_mengumpulkan'
                                  ? 'Kamu tercatat tidak membawa HP hari ini.'
                                  : ownStatus === 'tidak_masuk'
                                    ? 'Kamu tercatat tidak masuk hari ini.'
                                    : ownStatus === 'sedang_dipinjam'
                                      ? 'HP kamu sedang dipinjam. Kembalikan ke box setelah selesai digunakan.'
                                      : 'Ketua kelas belum mencatat status HP kamu. Hubungi ketua kelas jika sudah menyerahkan HP.'}
                        </p>

                        {activeLoan && (
                            <div className="mt-3 rounded-lg bg-warning-light px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                                <p className="font-medium text-text">Dipinjam: {activeLoan.usage_description}</p>
                                <p className="mt-1">
                                    {formatTime(activeLoan.starts_at)}–{formatTime(activeLoan.ends_at)}
                                    {activeLoan.teacher_name && ` · ${activeLoan.teacher_name}`}
                                </p>
                                {loanOverdue && (
                                    <p className="mt-1 font-medium text-danger">Sudah lewat jam pengembalian.</p>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                <Card id="setoran-kelas" className="min-w-0 scroll-mt-20 overflow-hidden">
                    <div className="p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text">Setoran kelas</p>
                                <p className="mt-0.5 truncate text-xs text-text-secondary">
                                    {schoolClass?.name ?? 'Belum ada kelas'}
                                </p>
                            </div>
                            <DepositStatusBadge deposit={deposit} />
                        </div>

                        <div className="mt-4">
                            <DepositMetrics deposit={deposit} />
                        </div>

                        <p className="mt-3 rounded-lg bg-bg-secondary px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                            Pengambilan HP sementara ini menggunakan memo manual yang ditandatangani guru mapel atau wali
                            kelas, lalu dikonfirmasi kesiswaan. Fitur pengajuan lewat web belum digunakan.
                        </p>
                    </div>
                </Card>
            </div>

            <Card id="riwayat-saya" className="mt-3 min-w-0 scroll-mt-20 overflow-hidden">
                <div className="border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-text">Riwayat 30 hari</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">
                        {summary.dikumpulkan} dari {summary.deposit_days} hari kelas mengirim setoran
                    </p>
                </div>
                <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Metric label="Setor" value={summary.dikumpulkan} tone="success" />
                        <Metric label="Tidak membawa" value={summary.tidak_mengumpulkan} tone="danger" />
                        <Metric label="Tidak masuk" value={summary.tidak_masuk} tone="neutral" />
                        <Metric label="Dipinjam" value={summary.sedang_dipinjam} tone="warning" />
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-state py-8">
                            <Calendar className="empty-state-icon h-10 w-10" aria-hidden="true" />
                            <p className="empty-state-title">Belum ada riwayat</p>
                            <p className="empty-state-desc">Riwayat setoran muncul setelah kelas mengirim checklist.</p>
                        </div>
                    ) : (
                        <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
                            {history.map((entry) => {
                                const entryMeta = studentStatusMeta[entry.status] ?? {
                                    label: entry.status,
                                    variant: 'neutral',
                                    icon: Info,
                                };
                                const EntryIcon = entryMeta.icon;

                                return (
                                    <div
                                        key={`${entry.date}-${entry.status}`}
                                        className="flex items-start justify-between gap-3 rounded-lg bg-bg-secondary px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-text">{formatDate(entry.date)}</p>
                                            {entry.notes && (
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={entryMeta.variant} className="shrink-0">
                                            <EntryIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                                            {entryMeta.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
