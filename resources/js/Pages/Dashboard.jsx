import { useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    Calendar,
    Check,
    ClipboardCheck,
    ClipboardList,
    Clock,
    Crown,
    Info,
    Loader2,
    PackageCheck,
    Search,
    ShieldAlert,
    Smartphone,
    Users,
    X,
} from 'lucide-react';

const studentStatusOptions = [
    {
        value: 'dikumpulkan',
        label: 'Setor',
        fullLabel: 'Setor HP',
        icon: Check,
        variant: 'success',
        activeClass: 'border-success bg-success-light text-success',
    },
    {
        value: 'tidak_mengumpulkan',
        label: 'Tidak membawa',
        fullLabel: 'Tidak membawa HP',
        icon: X,
        variant: 'danger',
        activeClass: 'border-danger bg-danger-light text-danger',
    },
    {
        value: 'tidak_masuk',
        label: 'Tidak masuk',
        fullLabel: 'Tidak masuk',
        icon: Info,
        variant: 'neutral',
        activeClass: 'border-border-strong bg-bg-tertiary text-text',
    },
];

const studentStatusMeta = {
    dikumpulkan: { label: 'Setor', variant: 'success', icon: Check },
    tidak_mengumpulkan: { label: 'Tidak membawa', variant: 'danger', icon: X },
    tidak_masuk: { label: 'Tidak masuk', variant: 'neutral', icon: Info },
    sedang_dipinjam: { label: 'Dipinjam', variant: 'warning', icon: Clock },
};

const depositStatusMeta = {
    menunggu_verifikasi: { label: 'Menunggu verifikasi', variant: 'warning', icon: Clock },
    terverifikasi: { label: 'Terverifikasi', variant: 'success', icon: Check },
    selisih: { label: 'Ada selisih', variant: 'danger', icon: AlertTriangle },
    selesai: { label: 'Box sudah diambil', variant: 'neutral', icon: PackageCheck },
};

const formatDate = (date) => {
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return date;
    }
};

const formatDateTime = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

function PageHeader({ title, subtitle, date }) {
    return (
        <div className="mb-4 sm:mb-5">
            {(date || subtitle) && (
                <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{date ? formatDate(date) : subtitle}</span>
                </span>
            )}
            <h1 className="mt-1.5 break-words text-xl font-semibold tracking-tight text-text sm:mt-2 sm:text-2xl">
                {title}
            </h1>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
    const tones = {
        primary: 'bg-primary-light text-primary',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        danger: 'bg-danger-light text-danger',
        neutral: 'bg-bg-tertiary text-text-secondary',
    };

    return (
        <Card className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10',
                        tones[tone],
                    )}
                >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-text-muted sm:text-xs">{label}</p>
                    <p className="truncate text-lg font-semibold tabular-nums tracking-tight text-text sm:text-xl">
                        {value}
                    </p>
                    {hint && <p className="truncate text-[11px] text-text-secondary sm:text-xs">{hint}</p>}
                </div>
            </div>
        </Card>
    );
}

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

function StudentStatusBadge({ status }) {
    const meta = studentStatusMeta[status] ?? { label: 'Belum didata', variant: 'neutral', icon: Info };
    const Icon = meta.icon;

    return (
        <Badge variant={meta.variant}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {meta.label}
        </Badge>
    );
}

function AttentionNotice({ schoolClass, flagWindowDays }) {
    if (!schoolClass?.needs_attention) return null;

    return (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-danger-light bg-danger-light px-3 py-2.5 text-sm text-danger sm:mb-4 sm:px-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
                <p className="font-medium">Kelas ini perlu perhatian khusus.</p>
                <p className="mt-0.5 text-xs leading-relaxed">
                    Sudah {schoolClass.shortages_last_30_days}x tercatat jumlah HP kurang dari laporan dalam{' '}
                    {flagWindowDays} hari terakhir. Hitung ulang box dengan teliti.
                </p>
            </div>
        </div>
    );
}

function DepositMetrics({ deposit }) {
    const reported = deposit?.reported_count ?? 0;
    const verified = deposit?.verified_count;
    const difference = verified === null || verified === undefined ? null : verified - reported;

    return (
        <div className="grid grid-cols-3 gap-2">
            <Metric label="Dilaporkan" value={deposit ? reported : '-'} />
            <Metric
                label="Fisik"
                value={verified === null || verified === undefined ? '-' : verified}
                tone={difference === null ? 'neutral' : difference === 0 ? 'success' : 'danger'}
            />
            <Metric
                label="Selisih"
                value={
                    difference === null || difference === undefined
                        ? '-'
                        : difference === 0
                          ? '0'
                          : difference < 0
                            ? `-${Math.abs(difference)}`
                            : `+${difference}`
                }
                tone={difference === null || difference === undefined ? 'neutral' : difference === 0 ? 'success' : 'danger'}
            />
        </div>
    );
}

function DepositInfo({ deposit }) {
    if (!deposit) return null;

    return (
        <div className="mt-3 space-y-1.5 text-xs text-text-muted">
            {deposit.reported_by?.name && (
                <p>
                    Dilaporkan oleh <span className="font-medium text-text-secondary">{deposit.reported_by.name}</span>
                    {deposit.reported_at && ` · ${formatDateTime(deposit.reported_at)}`}
                </p>
            )}
            {deposit.verified_by?.name && (
                <p>
                    Diverifikasi oleh <span className="font-medium text-text-secondary">{deposit.verified_by.name}</span>
                    {deposit.verified_at && ` · ${formatDateTime(deposit.verified_at)}`}
                </p>
            )}
            {deposit.released_at && (
                <p className="font-medium text-success">Box diambil · {formatDateTime(deposit.released_at)}</p>
            )}
            {deposit.verification_notes && (
                <p className="rounded-md bg-bg-secondary px-2.5 py-2 leading-relaxed text-text-secondary">
                    Catatan kesiswaan: {deposit.verification_notes}
                </p>
            )}
        </div>
    );
}

function StudentStatusList({ students = [] }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.user?.name?.toLowerCase().includes(keyword) ||
                String(student.nis).toLowerCase().includes(keyword),
        );
    }, [students, query]);

    const counts = useMemo(() => {
        const result = {
            dikumpulkan: 0,
            tidak_mengumpulkan: 0,
            tidak_masuk: 0,
            belum: 0,
        };

        students.forEach((student) => {
            const status = student.collection_records?.[0]?.status ?? 'belum';
            if (Object.hasOwn(result, status)) {
                result[status] += 1;
            } else {
                result.belum += 1;
            }
        });

        return result;
    }, [students]);

    if (students.length === 0) {
        return (
            <div className="empty-state py-8">
                <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                <p className="empty-state-title">Belum ada siswa</p>
                <p className="empty-state-desc">Kelas ini belum memiliki siswa</p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-0 flex-1 sm:max-w-sm">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                        aria-hidden="true"
                    />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari nama atau NIS..."
                        className="h-10 pl-9 text-sm"
                        aria-label="Cari siswa"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-success-light px-2.5 py-1 font-medium text-success">
                        {counts.dikumpulkan} setor
                    </span>
                    <span className="rounded-full bg-danger-light px-2.5 py-1 font-medium text-danger">
                        {counts.tidak_mengumpulkan} tidak membawa
                    </span>
                    <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                        {counts.tidak_masuk} tidak masuk
                    </span>
                    {counts.belum > 0 && (
                        <span className="rounded-full bg-warning-light px-2.5 py-1 font-medium text-warning">
                            {counts.belum} belum
                        </span>
                    )}
                </div>
            </div>

            <p className="mb-2 text-xs tabular-nums text-text-muted" role="status">
                Menampilkan {filtered.length} dari {students.length} siswa
            </p>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
                    <p className="text-sm font-medium text-text">Tidak ada hasil</p>
                    <p className="mt-1 text-xs text-text-secondary">Coba kata kunci lain</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((student) => (
                        <div
                            key={student.id}
                            className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-white p-2.5 sm:p-3"
                        >
                            <div
                                className="avatar avatar-md flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary sm:h-9 sm:w-9 sm:text-sm"
                                aria-hidden="true"
                            >
                                {student.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="truncate text-sm font-medium text-text">{student.user.name}</p>
                                    {student.is_class_leader && (
                                        <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                                            <Crown className="mr-0.5 h-2.5 w-2.5" aria-hidden="true" />
                                            Ketua
                                        </Badge>
                                    )}
                                </div>
                                <p className="truncate text-xs tabular-nums text-text-muted">NIS {student.nis}</p>
                            </div>
                            <StudentStatusBadge status={student.collection_records?.[0]?.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function KesiswaanClassCard({ schoolClass, onVerify, onRelease, flagWindowDays }) {
    const deposit = schoolClass.deposit;
    const classLeader = schoolClass.students?.find((student) => student.is_class_leader);
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

function VerifyDepositDialog({ target, onClose }) {
    const deposit = target?.deposit;
    const [verifiedCount, setVerifiedCount] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const open = Boolean(target && deposit);
    const reported = deposit?.reported_count ?? 0;
    const parsedVerified = verifiedCount === '' ? null : Number(verifiedCount);
    const difference = parsedVerified === null ? null : parsedVerified - reported;

    useEffect(() => {
        if (!target || !deposit) return;

        setVerifiedCount(String(deposit.verified_count ?? deposit.reported_count));
        setNotes(deposit.verification_notes ?? '');
    }, [target, deposit]);

    function handleOpenChange(nextOpen) {
        if (!nextOpen) {
            setVerifiedCount('');
            setNotes('');
            onClose();
        }
    }

    function submit(event) {
        event.preventDefault();
        if (!deposit) return;

        setProcessing(true);
        router.patch(
            route('class-deposits.verify', deposit.id),
            {
                verified_count: Number(verifiedCount),
                verification_notes: notes.trim() || null,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => handleOpenChange(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi setoran {target?.name}</DialogTitle>
                    <DialogDescription>
                        Masukkan jumlah fisik HP yang benar-benar ada di dalam box. Bandingkan dengan checklist ketua kelas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                        Dilaporkan ketua kelas:{' '}
                        <span className="font-semibold text-text">{reported} HP</span>
                        {deposit?.reported_by?.name && <span> oleh {deposit.reported_by.name}</span>}
                    </div>

                    {target?.needs_attention && (
                        <div className="flex items-start gap-2 rounded-lg bg-danger-light px-3 py-2.5 text-sm text-danger">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                Kelas ini sudah {target.shortages_last_30_days}x tercatat selisih dalam 30 hari
                                terakhir. Hitung ulang box dengan teliti.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="verified-count">Jumlah fisik HP</Label>
                        <Input
                            id="verified-count"
                            type="number"
                            min="0"
                            max={target?.students_count ?? undefined}
                            value={verifiedCount}
                            onChange={(event) => setVerifiedCount(event.target.value)}
                            required
                            disabled={processing}
                        />
                    </div>

                    {difference !== null && difference !== 0 && (
                        <div
                            className={cn(
                                'flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm',
                                difference < 0
                                    ? 'bg-danger-light text-danger'
                                    : 'bg-warning-light text-warning',
                            )}
                        >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                {difference < 0
                                    ? `Jumlah fisik kurang ${Math.abs(difference)} HP dari checklist.`
                                    : `Jumlah fisik lebih ${difference} HP dari checklist.`}{' '}
                                Kelas akan ditandai selisih.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="verification-notes">Catatan (opsional)</Label>
                        <Textarea
                            id="verification-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Contoh: 2 HP belum diserahkan, sudah dikonfirmasi ke ketua kelas."
                            disabled={processing}
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || verifiedCount === ''}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan verifikasi'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function KesiswaanDashboard({ classes = [], date, summary = {}, flagThreshold = 3, flagWindowDays = 30 }) {
    const [verifyTarget, setVerifyTarget] = useState(null);

    function releaseBox(schoolClass) {
        if (!schoolClass.deposit) return;

        if (window.confirm(`Tandai box ${schoolClass.name} sudah diambil oleh ketua kelas?`)) {
            router.patch(
                route('class-deposits.release', schoolClass.deposit.id),
                {},
                { preserveScroll: true },
            );
        }
    }

    const pendingClasses = classes.filter((schoolClass) => schoolClass.deposit?.status === 'menunggu_verifikasi').length;

    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader title="Monitoring Setoran HP" date={date} />

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total siswa"
                    value={summary.total_students ?? 0}
                    hint={`${summary.submitted_classes ?? 0}/${summary.total_classes ?? 0} kelas sudah setor`}
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

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {classes.map((schoolClass) => (
                    <KesiswaanClassCard
                        key={schoolClass.id}
                        schoolClass={schoolClass}
                        onVerify={setVerifyTarget}
                        onRelease={releaseBox}
                        flagWindowDays={flagWindowDays}
                    />
                ))}
                {classes.length === 0 && (
                    <Card className="border-dashed sm:col-span-2 xl:col-span-3">
                        <div className="p-8 text-center">
                            <Users className="mx-auto h-10 w-10 text-text-muted opacity-50" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium text-text">Belum ada kelas</p>
                            <p className="mt-1 text-sm text-text-secondary">Tambah kelas dan siswa terlebih dahulu</p>
                        </div>
                    </Card>
                )}
            </div>

            {classes.length > 0 && (
                <Card className="min-w-0 overflow-hidden">
                    <div className="border-b px-4 py-3 sm:px-5">
                        <h2 className="text-sm font-semibold text-text">Detail status per siswa</h2>
                        <p className="mt-0.5 text-xs text-text-secondary">Read-only, hasil checklist ketua kelas hari ini</p>
                    </div>
                    <Tabs defaultValue={String(classes[0]?.id ?? '')}>
                        <div className="border-b px-3 pt-3 sm:px-4">
                            <div className="scrollbar-thin overflow-x-auto">
                                <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
                                    {classes.map((schoolClass) => (
                                        <TabsTrigger
                                            key={schoolClass.id}
                                            value={String(schoolClass.id)}
                                            className="whitespace-nowrap rounded-t-lg border border-b-0 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-border data-[state=active]:bg-white data-[state=active]:text-text data-[state=active]:shadow-none"
                                        >
                                            {schoolClass.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>
                        {classes.map((schoolClass) => (
                            <TabsContent key={schoolClass.id} value={String(schoolClass.id)} className="mt-0 p-4 sm:p-5">
                                <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />
                                <StudentStatusList students={schoolClass.students} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </Card>
            )}

            <VerifyDepositDialog target={verifyTarget} onClose={() => setVerifyTarget(null)} />
        </div>
    );
}

function buildInitialStatuses(students) {
    const allowed = new Set(studentStatusOptions.map((option) => option.value));

    return Object.fromEntries(
        students.map((student) => {
            const status = student.collection_records?.[0]?.status;

            return [student.id, allowed.has(status) ? status : 'belum'];
        }),
    );
}

function ChecklistForm({ schoolClass, flagWindowDays }) {
    const students = useMemo(
        () =>
            [...(schoolClass?.students ?? [])].sort((a, b) =>
                String(a.nis).localeCompare(String(b.nis), undefined, { numeric: true }),
            ),
        [schoolClass],
    );
    const deposit = schoolClass?.deposit;
    const isPending = deposit?.status === 'menunggu_verifikasi';
    const isLocked = Boolean(deposit && !isPending);
    const [editing, setEditing] = useState(!deposit);
    const [statuses, setStatuses] = useState(() => buildInitialStatuses(students));
    const [query, setQuery] = useState('');
    const [processing, setProcessing] = useState(false);
    const errors = usePage().props.errors ?? {};

    const counts = useMemo(() => {
        const result = { dikumpulkan: 0, tidak_mengumpulkan: 0, tidak_masuk: 0, belum: 0 };

        students.forEach((student) => {
            const status = statuses[student.id] ?? 'belum';
            if (Object.hasOwn(result, status)) {
                result[status] += 1;
            } else {
                result.belum += 1;
            }
        });

        return result;
    }, [students, statuses]);

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.user?.name?.toLowerCase().includes(keyword) ||
                String(student.nis).toLowerCase().includes(keyword),
        );
    }, [students, query]);

    function toggleStatus(studentId, status) {
        setStatuses((current) => ({
            ...current,
            [studentId]: current[studentId] === status ? 'belum' : status,
        }));
    }

    function submit(event) {
        event.preventDefault();
        if (counts.belum > 0 || processing) return;

        setProcessing(true);
        router.post(
            route('class-deposits.store'),
            {
                entries: students.map((student) => ({
                    student_id: student.id,
                    status: statuses[student.id] ?? 'belum',
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    }

    if (students.length === 0) {
        return (
            <Card className="border-dashed">
                <div className="empty-state p-6 sm:p-10">
                    <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Belum ada siswa</p>
                    <p className="empty-state-desc">Hubungi kesiswaan untuk menambahkan siswa ke kelas ini</p>
                </div>
            </Card>
        );
    }

    const showForm = !isLocked && editing;

    return (
        <div className="space-y-4">
            <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />

            <Card className="min-w-0 overflow-hidden">
                <div className="border-b bg-white px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                                <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                                Checklist Setoran Pagi
                            </h2>
                            <p className="mt-1 text-xs text-text-secondary">
                                Tap nama siswa saat HP diserahkan. Tandai yang tidak membawa HP atau tidak masuk.
                            </p>
                        </div>
                        <DepositStatusBadge deposit={deposit} />
                    </div>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                    <DepositMetrics deposit={deposit} />
                    <DepositInfo deposit={deposit} />

                    {isLocked && (
                        <div className="flex items-start gap-2 rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            Checklist sudah diverifikasi kesiswaan dan tidak dapat diubah lagi.
                        </div>
                    )}

                    {isPending && !editing && (
                        <div className="flex flex-col gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-sm text-warning sm:flex-row sm:items-center sm:justify-between">
                            <span>Checklist sudah dikirim dan sedang menunggu verifikasi kesiswaan.</span>
                            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                                Ubah checklist
                            </Button>
                        </div>
                    )}

                    {showForm && (
                        <>
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                                    aria-hidden="true"
                                />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari nama atau NIS..."
                                    className="h-10 pl-9 text-sm"
                                    aria-label="Cari siswa"
                                />
                            </div>

                            <p className="text-xs tabular-nums text-text-muted" role="status">
                                Menampilkan {filtered.length} dari {students.length} siswa
                            </p>

                            <div className="space-y-2">
                                {filtered.map((student) => {
                                    const activeStatus = statuses[student.id] ?? 'belum';

                                    return (
                                        <div
                                            key={student.id}
                                            className="rounded-lg border border-border bg-white p-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary sm:h-9 sm:w-9 sm:text-sm"
                                                    aria-hidden="true"
                                                >
                                                    {student.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <p className="truncate text-sm font-medium text-text">
                                                            {student.user.name}
                                                        </p>
                                                        {student.is_class_leader && (
                                                            <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                                                                <Crown className="mr-0.5 h-2.5 w-2.5" aria-hidden="true" />
                                                                Ketua
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs tabular-nums text-text-muted">
                                                        NIS {student.nis}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-0 sm:w-[290px] sm:shrink-0">
                                                {studentStatusOptions.map((option) => {
                                                    const Icon = option.icon;
                                                    const active = activeStatus === option.value;

                                                    return (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => toggleStatus(student.id, option.value)}
                                                            aria-pressed={active}
                                                            className={cn(
                                                                'flex items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                                                                active
                                                                    ? option.activeClass
                                                                    : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary hover:text-text',
                                                            )}
                                                        >
                                                            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                            <span className="truncate">{option.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filtered.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
                                    <p className="text-sm font-medium text-text">Tidak ada hasil</p>
                                    <p className="mt-1 text-xs text-text-secondary">Coba kata kunci lain</p>
                                </div>
                            )}

                            {errors.entries && (
                                <p className="error-text" role="alert">
                                    {errors.entries}
                                </p>
                            )}
                        </>
                    )}

                    {!showForm && (
                        <StudentStatusList students={students} />
                    )}
                </div>

                {showForm && (
                    <div className="border-t bg-white px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-success-light px-2.5 py-1 font-medium text-success">
                                {counts.dikumpulkan} setor
                            </span>
                            <span className="rounded-full bg-danger-light px-2.5 py-1 font-medium text-danger">
                                {counts.tidak_mengumpulkan} tidak membawa
                            </span>
                            <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                                {counts.tidak_masuk} tidak masuk
                            </span>
                            {counts.belum > 0 && (
                                <span className="rounded-full bg-warning-light px-2.5 py-1 font-medium text-warning">
                                    {counts.belum} belum ditandai
                                </span>
                            )}
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-text-muted">
                                {counts.belum > 0
                                    ? 'Tandai semua siswa terlebih dahulu sebelum mengirim.'
                                    : 'Jumlah setor akan menjadi laporan ke kesiswaan.'}
                            </p>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={processing || counts.belum > 0}
                                className="w-full justify-center gap-2 sm:w-auto"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                                        Kirim checklist
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

function KetuaKelasDashboard({ user, schoolClass, date, flagWindowDays = 30 }) {
    const deposit = schoolClass?.deposit;
    const studentsCount = schoolClass?.students_count ?? schoolClass?.students?.length ?? 0;
    const collected = deposit?.reported_count ?? 0;
    const progress = studentsCount > 0 ? Math.round((collected / studentsCount) * 100) : 0;

    if (!schoolClass) {
        return (
            <div>
                <Head title="Dashboard" />
                <PageHeader title={`Halo, ${user.name}`} date={date} />
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum terdaftar di kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk melengkapi data kelasmu</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <Head title="Setoran HP" />
            <PageHeader title={`Setoran ${schoolClass.name}`} date={date} />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
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

            <ChecklistForm
                key={`${schoolClass.id}-${deposit?.id ?? 'new'}-${deposit?.status ?? 'new'}-${deposit?.reported_at ?? ''}`}
                schoolClass={schoolClass}
                flagWindowDays={flagWindowDays}
            />
        </div>
    );
}

function WaliKelasDashboard({ user, schoolClass, date, flagWindowDays = 30 }) {
    if (!schoolClass) {
        return (
            <div>
                <Head title="Dashboard" />
                <PageHeader title={`Halo, ${user.name}`} date={date} />
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <Users className="empty-state-icon h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum memiliki kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk mendapatkan akses ke kelas</p>
                    </div>
                </Card>
            </div>
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
        <div>
            <Head title="Dashboard" />
            <PageHeader title={schoolClass.name} date={date} />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
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

            <Card className="mb-4 min-w-0 overflow-hidden">
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

            <Card className="min-w-0 overflow-hidden">
                <div className="border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-text">Status per siswa</h2>
                </div>
                <div className="p-4 sm:p-5">
                    <StudentStatusList students={students} />
                </div>
            </Card>
        </div>
    );
}

function SiswaDashboard({ user, schoolClass, deposit, ownStatus, date }) {
    const meta = ownStatus ? studentStatusMeta[ownStatus] : null;
    const Icon = meta?.icon ?? Info;

    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader title={`Halo, ${user.name}`} subtitle="Status pengumpulan HP hari ini" date={date} />

            <div className="grid gap-3 sm:grid-cols-2">
                <Card className="min-w-0 overflow-hidden">
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
                                    : 'Ketua kelas belum mencatat status HP kamu. Hubungi ketua kelas jika sudah menyerahkan HP.'}
                        </p>
                    </div>
                </Card>

                <Card className="min-w-0 overflow-hidden">
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
        </div>
    );
}

export default function Dashboard({
    role,
    classes,
    schoolClass,
    date,
    summary,
    ownStatus,
    deposit,
    flagThreshold = 3,
    flagWindowDays = 30,
}) {
    const user = usePage().props.auth.user;

    let content;

    if (role === 'kesiswaan') {
        content = (
            <KesiswaanDashboard
                classes={classes}
                date={date}
                summary={summary}
                flagThreshold={flagThreshold}
                flagWindowDays={flagWindowDays}
            />
        );
    } else if (role === 'wali_kelas') {
        content = (
            <WaliKelasDashboard
                user={user}
                schoolClass={schoolClass}
                date={date}
                flagWindowDays={flagWindowDays}
            />
        );
    } else if (role === 'ketua_kelas') {
        content = (
            <KetuaKelasDashboard
                user={user}
                schoolClass={schoolClass}
                date={date}
                flagWindowDays={flagWindowDays}
            />
        );
    } else {
        content = (
            <SiswaDashboard
                user={user}
                schoolClass={schoolClass}
                deposit={schoolClass?.deposit ?? deposit ?? null}
                ownStatus={ownStatus}
                date={date}
            />
        );
    }

    return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}
