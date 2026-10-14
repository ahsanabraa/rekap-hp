import { useMemo, useState, memo } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    Check,
    Clock,
    X,
    Info,
    Send,
    Smartphone,
    Users,
    BookOpen,
    ChevronDown,
    RotateCcw,
    Loader2,
    Calendar,
    Search,
} from 'lucide-react';

const statusOptions = [
    { value: 'dikumpulkan', label: 'Dikumpulkan', icon: Check, variant: 'success' },
    { value: 'sedang_dipinjam', label: 'Dipinjam', icon: Clock, variant: 'warning' },
    { value: 'tidak_mengumpulkan', label: 'Tidak Kumpul', icon: X, variant: 'danger' },
    { value: 'tidak_masuk', label: 'Tidak Masuk', icon: Info, variant: 'neutral' },
];

// Mapping statis (jangan pakai template string `border-${v}-light` — tidak ke-generate Tailwind)
const statusStyles = {
    success: {
        button: 'border-success-light bg-success-light text-success',
        icon: 'text-success',
    },
    warning: {
        button: 'border-warning-light bg-warning-light text-warning',
        icon: 'text-warning',
    },
    danger: {
        button: 'border-danger-light bg-danger-light text-danger',
        icon: 'text-danger',
    },
    neutral: {
        button: 'border-border bg-bg-tertiary text-text-secondary',
        icon: 'text-text-secondary',
    },
};

const requestStatus = { pending: 'Menunggu', acc: 'Disetujui', dec: 'Ditolak' };
const formatDate = (date) => {
    try {
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return date;
    }
};
const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function PageHeader({ title, subtitle, date }) {
    return (
        <div className="mb-5">
            {(date || subtitle) && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {date ? formatDate(date) : subtitle}
                </span>
            )}
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">{title}</h1>
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
        <Card>
            <div className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="truncate text-xl font-semibold tabular-nums tracking-tight text-text">{value}</p>
                    {hint && <p className="truncate text-xs text-text-secondary">{hint}</p>}
                </div>
            </div>
        </Card>
    );
}

function KesiswaanDashboard({ classes = [], date }) {
    const summary = useMemo(() => {
        const totalStudents = classes.reduce((sum, c) => sum + (c.students_count ?? 0), 0);
        const totalCollected = classes.reduce((sum, c) => sum + (c.collected_students_count ?? 0), 0);
        const doneClasses = classes.filter(
            (c) => (c.students_count ?? 0) > 0 && c.collected_students_count >= c.students_count
        ).length;
        const pct = totalStudents ? Math.round((totalCollected / totalStudents) * 100) : 0;
        return { totalStudents, totalCollected, doneClasses, pct };
    }, [classes]);

    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader title="Monitoring Kelas" date={date} />

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <StatCard icon={Users} label="Total siswa" value={summary.totalStudents} hint={`${summary.totalCollected} sudah mengumpulkan`} tone="primary" />
                <StatCard icon={Check} label="Tingkat pengumpulan" value={`${summary.pct}%`} hint="Semua kelas hari ini" tone="success" />
                <StatCard icon={BookOpen} label="Kelas lengkap" value={`${summary.doneClasses}/${classes.length}`} hint="100% terkumpul" tone={summary.doneClasses === classes.length && classes.length > 0 ? 'success' : 'warning'} />
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((schoolClass) => {
                    const progress = schoolClass.students_count
                        ? Math.round((schoolClass.collected_students_count / schoolClass.students_count) * 100)
                        : 0;
                    const collected = schoolClass.collected_students_count;
                    const total = schoolClass.students_count;
                    const done = total > 0 && collected >= total;

                    return (
                        <Card key={schoolClass.id}>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-text">{schoolClass.name}</p>
                                        <p className="mt-0.5 truncate text-xs text-text-secondary">{schoolClass.homeroom?.name ?? 'Belum ada wali kelas'}</p>
                                    </div>
                                    <Badge variant={done ? 'success' : progress >= 70 ? 'primary' : 'warning'}>
                                        {done ? 'Lengkap' : `${progress}%`}
                                    </Badge>
                                </div>
                                <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-text">
                                    {collected}<span className="text-sm font-normal text-text-muted">/{total}</span>
                                </p>
                                <Progress value={progress} className="mt-2 h-1.5" />
                            </div>
                        </Card>
                    );
                })}
                {classes.length === 0 && (
                    <Card className="border-dashed sm:col-span-2 lg:col-span-3">
                        <div className="p-8 text-center">
                            <BookOpen className="mx-auto h-10 w-10 text-text-muted opacity-50" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium text-text">Belum ada kelas</p>
                            <p className="mt-1 text-sm text-text-secondary">Tambah kelas untuk memulai monitoring</p>
                        </div>
                    </Card>
                )}
            </div>

            {classes.length > 0 && (
                <Card>
                    <div className="border-b px-4 py-3 sm:px-5">
                        <h2 className="text-sm font-semibold text-text">Detail per kelas</h2>
                        <p className="mt-0.5 text-xs text-text-secondary">Status terkini tiap siswa, read-only</p>
                    </div>
                    <Tabs defaultValue={String(classes[0]?.id ?? '')}>
                        <div className="border-b px-3 pt-3 sm:px-4">
                            <div className="overflow-x-auto scrollbar-thin">
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
                                <CollectionList schoolClass={schoolClass} interactive={false} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </Card>
            )}
        </div>
    );
}

const StudentRow = memo(function StudentRow({ student, interactive, onStatusChange, onResetPassword }) {
    const currentStatus = student.collection_records?.[0]?.status;
    const activeOption = statusOptions.find((s) => s.value === currentStatus);
    const ActiveIcon = activeOption?.icon;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 transition-colors duration-150 hover:bg-bg-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="avatar avatar-md shrink-0" aria-hidden="true">
                    {student.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{student.user.name}</p>
                    <p className="text-xs tabular-nums text-text-muted">{student.nis}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
                {interactive ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'min-w-[132px] justify-between gap-1.5 font-medium',
                                    activeOption
                                        ? statusStyles[activeOption.variant].button
                                        : 'border-border bg-white text-text-secondary'
                                )}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    {activeOption && ActiveIcon ? (
                                        <>
                                            <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                            {activeOption.label}
                                        </>
                                    ) : (
                                        'Pilih status'
                                    )}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {statusOptions.map(({ value, label, icon: Icon, variant }) => (
                                <DropdownMenuItem
                                    key={value}
                                    className={cn('flex items-center gap-2', currentStatus === value && 'bg-bg-secondary font-medium')}
                                    onClick={() => onStatusChange(student.id, value)}
                                >
                                    <Icon className={cn('h-4 w-4', statusStyles[variant].icon)} aria-hidden="true" />
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    activeOption && ActiveIcon ? (
                        <Badge variant={activeOption.variant}>
                            <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {activeOption.label}
                        </Badge>
                    ) : (
                        <Badge variant="neutral">Belum didata</Badge>
                    )
                )}
                {interactive && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResetPassword(student)}
                        className="h-9 w-9 text-text-muted hover:text-text"
                        aria-label={`Reset password ${student.user.name}`}
                        title="Reset password ke default"
                    >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
});

function CollectionList({ schoolClass, interactive = true }) {
    const students = schoolClass?.students ?? [];
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    function updateStatus(studentId, status) {
        router.post(route('collection-records.status', studentId), { status }, { preserveScroll: true });
    }

    function resetPassword(student) {
        if (window.confirm(`Reset password ${student.user.name} ke "password"?`)) {
            router.post(route('students.reset-password', student.id), {}, { preserveScroll: true });
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return students.filter((s) => {
            const status = s.collection_records?.[0]?.status ?? 'none';
            if (filter !== 'all' && status !== filter) return false;
            if (!q) return true;
            return s.user.name.toLowerCase().includes(q) || String(s.nis).toLowerCase().includes(q);
        });
    }, [students, query, filter]);

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
        <div>
            <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari nama atau NIS…"
                        className="pl-9"
                        aria-label="Cari siswa"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status">
                    {[{ v: 'all', l: 'Semua' }, ...statusOptions.map((s) => ({ v: s.value, l: s.label }))].map((o) => (
                        <button
                            key={o.v}
                            type="button"
                            onClick={() => setFilter(o.v)}
                            aria-pressed={filter === o.v}
                            className={cn(
                                'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                                filter === o.v
                                    ? 'border-transparent bg-text text-white'
                                    : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary hover:text-text'
                            )}
                        >
                            {o.l}
                        </button>
                    ))}
                </div>
            </div>
            <p className="mb-2 text-xs tabular-nums text-text-muted" role="status">
                Menampilkan {filtered.length} dari {students.length} siswa
            </p>
            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
                    <p className="text-sm font-medium text-text">Tidak ada hasil</p>
                    <p className="mt-1 text-xs text-text-secondary">Coba kata kunci atau filter lain</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((student) => (
                        <StudentRow
                            key={student.id}
                            student={student}
                            interactive={interactive}
                            onStatusChange={updateStatus}
                            onResetPassword={resetPassword}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LoanRequestsForTeacher({ loanRequests = [] }) {
    function review(id, status) {
        router.patch(route('loan-requests.review', id), { status }, { preserveScroll: true });
    }

    function returnPhone(id) {
        if (window.confirm('Tandai HP sudah dikembalikan?')) {
            router.patch(route('loan-requests.return', id), {}, { preserveScroll: true });
        }
    }

    if (loanRequests.length === 0) {
        return (
            <Card className="mt-4">
                <div className="border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-text">Pengajuan pengambilan HP</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">Persetujuan dan pengembalian</p>
                </div>
                <div className="p-8 empty-state">
                    <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Belum ada pengajuan hari ini</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mt-4">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                <div>
                    <h2 className="text-sm font-semibold text-text">Pengajuan pengambilan HP</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">Persetujuan dan pengembalian</p>
                </div>
                <Badge variant="neutral">{loanRequests.length} pengajuan</Badge>
            </div>
            <div className="divide-y divide-border">
                {loanRequests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-text">{request.student_name}</p>
                                <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'acc' ? 'success' : 'danger'}>
                                    {requestStatus[request.status]}
                                </Badge>
                                {request.is_late && <Badge variant="danger">Terlambat</Badge>}
                            </div>
                            <p className="mt-2 text-sm text-text-secondary line-clamp-2">{request.reason}</p>
                            <p className="mt-1 text-xs text-text-muted">
                                {formatDate(request.starts_at)} · {formatTime(request.starts_at)} - {formatTime(request.ends_at)}
                            </p>
                            {request.returned_at && (
                                <p className="mt-1 text-xs font-medium text-success">
                                    Dikembalikan pukul {formatTime(request.returned_at)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {request.can_review && (
                                <>
                                    <Button size="sm" variant="success" onClick={() => review(request.id, 'acc')}>
                                        <Check className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                        Setujui
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => review(request.id, 'dec')}>
                                        <X className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                        Tolak
                                    </Button>
                                </>
                            )}
                            {request.can_return && (
                                <Button size="sm" variant="secondary" onClick={() => returnPhone(request.id)}>
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                    Kembalikan
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function WaliKelasDashboard({ schoolClass, date, loanRequests }) {
    const stats = useMemo(() => {
        const students = schoolClass?.students ?? [];
        const count = (s) => students.filter((st) => (st.collection_records?.[0]?.status ?? 'none') === s).length;
        const collected = count('dikumpulkan');
        const borrowed = count('sedang_dipinjam');
        const missing = students.length - collected - borrowed;
        const pending = (loanRequests ?? []).filter((r) => r.status === 'pending').length;
        return { total: students.length, collected, borrowed, missing, pending };
    }, [schoolClass, loanRequests]);

    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader title={schoolClass?.name ?? 'Belum Ada Kelas'} date={date} />

            {schoolClass ? (
                <>
                    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard icon={Users} label="Total siswa" value={stats.total} tone="primary" />
                        <StatCard icon={Check} label="Dikumpulkan" value={stats.collected} tone="success" />
                        <StatCard icon={Clock} label="Dipinjam / belum" value={`${stats.borrowed + stats.missing}`} hint={stats.pending ? `${stats.pending} menunggu persetujuan` : undefined} tone="warning" />
                        <StatCard icon={Send} label="Menunggu ACC" value={stats.pending} tone={stats.pending > 0 ? 'danger' : 'neutral'} />
                    </div>
                    <Card className="mb-4">
                        <div className="border-b px-4 py-3 sm:px-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-text">Daftar pengumpulan HP</h2>
                                    <p className="mt-0.5 text-xs text-text-secondary">Ubah status untuk memperbarui keterangan siswa</p>
                                </div>
                                <span className="text-xs tabular-nums text-text-muted">
                                    {schoolClass.collected_students_count} / {schoolClass.students_count} dikumpulkan
                                </span>
                            </div>
                            <Progress
                                value={schoolClass.students_count ? Math.round((schoolClass.collected_students_count / schoolClass.students_count) * 100) : 0}
                                className="mt-3 h-1.5"
                            />
                        </div>
                        <div className="p-4 sm:p-5">
                            <CollectionList schoolClass={schoolClass} />
                        </div>
                    </Card>
                    <LoanRequestsForTeacher loanRequests={loanRequests} />
                </>
            ) : (
                <Card className="border-dashed">
                    <div className="p-10 empty-state">
                        <BookOpen className="empty-state-icon h-12 w-12" aria-hidden="true" />
                        <p className="empty-state-title">Kamu belum memiliki kelas</p>
                        <p className="empty-state-desc">Hubungi kesiswaan untuk mendapatkan akses ke kelas</p>
                    </div>
                </Card>
            )}
        </div>
    );
}

function StudentLoanRequests({ loanRequests = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
        starts_at: '',
        ends_at: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('loan-requests.store'), { onSuccess: () => reset() });
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card>
                <div className="p-5 border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                            <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <h2 className="text-lg font-medium text-text">Ajukan Pengambilan HP</h2>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">Isi form berikut untuk mengajukan peminjaman HP</p>
                </div>
                <form onSubmit={submit} className="p-5 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Alasan <span className="text-danger">*</span></Label>
                        <Textarea
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            className="min-h-[110px] resize-none"
                            required
                            disabled={processing}
                            placeholder="Contoh: Butuh menghubungi orang tua, tugas sekolah, dll."
                            aria-describedby="reason-hint"
                        />
                        <p id="reason-hint" className="text-xs text-text-muted">Jelaskan alasan peminjaman dengan jelas</p>
                        {errors.reason && <p className="error-text" role="alert">{errors.reason}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Jam Mulai <span className="text-danger">*</span></Label>
                            <Input
                                type="time"
                                value={data.starts_at}
                                onChange={(event) => setData('starts_at', event.target.value)}
                                required
                                disabled={processing}
                                aria-describedby="starts-hint"
                            />
                            <p id="starts-hint" className="text-xs text-text-muted">Waktu mulai pinjam</p>
                            {errors.starts_at && <p className="error-text" role="alert">{errors.starts_at}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Jam Selesai <span className="text-danger">*</span></Label>
                            <Input
                                type="time"
                                value={data.ends_at}
                                onChange={(event) => setData('ends_at', event.target.value)}
                                required
                                disabled={processing}
                                aria-describedby="ends-hint"
                            />
                            <p id="ends-hint" className="text-xs text-text-muted">Waktu selesai pinjam</p>
                            {errors.ends_at && <p className="error-text" role="alert">{errors.ends_at}</p>}
                        </div>
                    </div>
                    <Button type="submit" className="w-full justify-center gap-2 py-3" disabled={processing}>
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" aria-hidden="true" />
                                Kirim Pengajuan
                            </>
                        )}
                    </Button>
                </form>
            </Card>

            <Card>
                <div className="p-5 border-b">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light">
                                <Smartphone className="h-5 w-5 text-warning" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg font-medium text-text">Riwayat Pengajuan</h2>
                        </div>
                        <span className="shrink-0 text-sm text-text-muted">{loanRequests.length} pengajuan</span>
                    </div>
                </div>
                {loanRequests.length === 0 ? (
                    <div className="p-10 empty-state">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-light mb-3">
                            <Smartphone className="h-7 w-7 text-warning" aria-hidden="true" />
                        </div>
                        <p className="empty-state-title text-base">Belum ada riwayat pengajuan</p>
                        <p className="empty-state-desc mt-2">Kirim pengajuan pertama Anda menggunakan form di sebelah kiri</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {loanRequests.map((request) => (
                            <div key={request.id} className="p-5 transition-colors hover:bg-bg-secondary">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge
                                            variant={
                                                request.status === 'pending' ? 'warning'
                                                : request.status === 'acc' ? 'success'
                                                : 'danger'
                                            }
                                        >
                                            {requestStatus[request.status]}
                                        </Badge>
                                        {request.is_late && (
                                            <Badge variant="danger">
                                                Terlambat
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary line-clamp-2">{request.reason}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                            {formatDate(request.starts_at)}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                            {formatTime(request.starts_at)} - {formatTime(request.ends_at)}
                                        </span>
                                        {request.returned_at && (
                                            <span className="inline-flex items-center gap-1.5 font-medium text-success">
                                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                Dikembalikan {formatTime(request.returned_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function SiswaDashboard({ user, loanRequests }) {
    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader title={`Halo, ${user.name}`} subtitle="Ajukan dan pantau pengambilan HP Anda" />
            <StudentLoanRequests loanRequests={loanRequests} />
        </div>
    );
}

export default function Dashboard({ role, classes, schoolClass, date, loanRequests }) {
    const user = usePage().props.auth.user;
    let content;
    if (role === 'kesiswaan') content = <KesiswaanDashboard classes={classes} date={date} />;
    else if (role === 'wali_kelas') content = <WaliKelasDashboard schoolClass={schoolClass} date={date} loanRequests={loanRequests} />;
    else content = <SiswaDashboard user={user} loanRequests={loanRequests} />;
    return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}