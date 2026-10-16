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
    KeyRound,
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
        <div className="mb-4 sm:mb-5">
            {(date || subtitle) && (
                <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{date ? formatDate(date) : subtitle}</span>
                </span>
            )}
            <h1 className="mt-1.5 break-words text-xl font-semibold tracking-tight text-text sm:mt-2 sm:text-2xl">{title}</h1>
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
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${tones[tone]}`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] text-text-muted sm:text-xs">{label}</p>
                    <p className="truncate text-lg font-semibold tabular-nums tracking-tight text-text sm:text-xl">{value}</p>
                    {hint && <p className="truncate text-[11px] text-text-secondary sm:text-xs">{hint}</p>}
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
        <div className="min-w-0 rounded-lg border border-border bg-white p-2.5 transition-colors duration-150 hover:bg-bg-secondary sm:flex sm:items-center sm:gap-4 sm:p-3 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="avatar avatar-md h-8 w-8 shrink-0 text-xs sm:h-9 sm:w-9 sm:text-sm" aria-hidden="true">
                    {student.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{student.user.name}</p>
                    <p className="truncate text-xs tabular-nums text-text-muted">NIS {student.nis}</p>
                </div>
                {interactive ? (
                    <span className="shrink-0 sm:hidden">
                        {activeOption && ActiveIcon ? (
                            <Badge variant={activeOption.variant} className="px-2 py-0.5 text-[11px]">
                                <ActiveIcon className="h-3 w-3" aria-hidden="true" />
                                {activeOption.label}
                            </Badge>
                        ) : (
                            <Badge variant="neutral" className="px-2 py-0.5 text-[11px]">Belum didata</Badge>
                        )}
                    </span>
                ) : (
                    <span className="shrink-0">
                        {activeOption && ActiveIcon ? (
                            <Badge variant={activeOption.variant}>
                                <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {activeOption.label}
                            </Badge>
                        ) : (
                            <Badge variant="neutral">Belum didata</Badge>
                        )}
                    </span>
                )}
            </div>
            {interactive && (
                <div className="mt-2.5 flex items-center gap-2 sm:mt-0 sm:w-[280px] sm:shrink-0 lg:w-[300px]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'h-9 min-w-0 flex-1 justify-between gap-1.5 px-2.5 text-xs font-medium sm:text-sm',
                                    activeOption
                                        ? statusStyles[activeOption.variant].button
                                        : 'border-border bg-white text-text-secondary'
                                )}
                            >
                                <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                                    {activeOption && ActiveIcon ? (
                                        <>
                                            <ActiveIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            <span className="truncate">{activeOption.label}</span>
                                        </>
                                    ) : (
                                        'Pilih status'
                                    )}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={4} className="w-[180px]">
                            {statusOptions.map(({ value, label, icon: Icon, variant }) => (
                                <DropdownMenuItem
                                    key={value}
                                    className={cn('flex cursor-pointer items-center gap-2', currentStatus === value && 'bg-bg-secondary font-medium')}
                                    onSelect={() => onStatusChange(student.id, value)}
                                >
                                    <Icon className={cn('h-4 w-4 shrink-0', statusStyles[variant].icon)} aria-hidden="true" />
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onResetPassword(student)}
                        className="h-9 shrink-0 gap-1.5 border-dashed px-2.5 text-xs font-medium text-text-secondary hover:border-border-strong hover:text-text"
                        aria-label={`Reset password ${student.user.name} ke default`}
                        title={`Reset password ${student.user.name} ke "password"`}
                    >
                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="hidden min-[380px]:inline">Reset PW</span>
                        <span className="sr-only">Reset password</span>
                    </Button>
                </div>
            )}
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
        if (window.confirm(`Reset password milik ${student.user.name} (NIS ${student.nis}) ke "password"?`)) {
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
        <div className="min-w-0">
            <div className="mb-3 flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari nama atau NIS…"
                        className="h-10 pl-9 text-sm"
                        aria-label="Cari siswa"
                    />
                </div>
                <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Filter status">
                    {[{ v: 'all', l: 'Semua' }, ...statusOptions.map((s) => ({ v: s.value, l: s.label }))].map((o) => (
                        <button
                            key={o.v}
                            type="button"
                            onClick={() => setFilter(o.v)}
                            aria-pressed={filter === o.v}
                            className={cn(
                                'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:px-3 sm:text-xs',
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
            <Card className="mt-4 min-w-0 overflow-hidden">
                <div className="border-b px-3 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-text">Pengajuan pengambilan HP</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">Persetujuan dan pengembalian</p>
                </div>
                <div className="empty-state p-6 sm:p-8">
                    <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Belum ada pengajuan hari ini</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mt-4 min-w-0 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-text">Pengajuan pengambilan HP</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">Persetujuan dan pengembalian</p>
                </div>
                <Badge variant="neutral" className="shrink-0">{loanRequests.length} pengajuan</Badge>
            </div>
            <div className="divide-y divide-border">
                {loanRequests.map((request) => (
                    <div key={request.id} className="flex min-w-0 flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <p className="min-w-0 truncate text-sm font-medium text-text">{request.student_name}</p>
                                <Badge variant={request.status === 'pending' ? 'warning' : request.status === 'acc' ? 'success' : 'danger'}>
                                    {requestStatus[request.status]}
                                </Badge>
                                {request.is_late && <Badge variant="danger">Terlambat</Badge>}
                            </div>
                            <p className="mt-1.5 break-words text-sm text-text-secondary line-clamp-2">{request.reason}</p>
                            <p className="mt-1 text-xs text-text-muted">
                                {formatDate(request.starts_at)} · {formatTime(request.starts_at)} - {formatTime(request.ends_at)}
                            </p>
                            {request.returned_at && (
                                <p className="mt-1 text-xs font-medium text-success">
                                    Dikembalikan pukul {formatTime(request.returned_at)}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
                            {request.can_review && (
                                <>
                                    <Button type="button" size="sm" variant="success" className="w-full justify-center min-[400px]:w-auto sm:w-auto" onClick={() => review(request.id, 'acc')}>
                                        <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                        Setujui
                                    </Button>
                                    <Button type="button" size="sm" variant="danger" className="w-full justify-center min-[400px]:w-auto sm:w-auto" onClick={() => review(request.id, 'dec')}>
                                        <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                        Tolak
                                    </Button>
                                </>
                            )}
                            {request.can_return && (
                                <Button type="button" size="sm" variant="secondary" className="w-full justify-center min-[400px]:col-span-2 sm:col-span-1 sm:w-auto" onClick={() => returnPhone(request.id)}>
                                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
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
        <div className="min-w-0">
            <Head title="Dashboard" />
            <PageHeader title={schoolClass?.name ?? 'Belum Ada Kelas'} date={date} />

            {schoolClass ? (
                <>
                    <div className="mb-3 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:mb-4 sm:gap-3 lg:grid-cols-4">
                        <StatCard icon={Users} label="Total siswa" value={stats.total} tone="primary" />
                        <StatCard icon={Check} label="Dikumpulkan" value={stats.collected} tone="success" />
                        <StatCard icon={Clock} label="Dipinjam / belum" value={`${stats.borrowed + stats.missing}`} hint={stats.pending ? `${stats.pending} menunggu persetujuan` : undefined} tone="warning" />
                        <StatCard icon={Send} label="Menunggu ACC" value={stats.pending} tone={stats.pending > 0 ? 'danger' : 'neutral'} />
                    </div>
                    <Card className="mb-4 min-w-0 overflow-hidden">
                        <div className="border-b px-3 py-3 sm:px-5">
                            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-semibold text-text">Daftar pengumpulan HP</h2>
                                    <p className="mt-0.5 text-xs text-text-secondary">Ubah status untuk memperbarui keterangan siswa</p>
                                </div>
                                <span className="shrink-0 text-xs tabular-nums text-text-muted">
                                    {schoolClass.collected_students_count} / {schoolClass.students_count} dikumpulkan
                                </span>
                            </div>
                            <Progress
                                value={schoolClass.students_count ? Math.round((schoolClass.collected_students_count / schoolClass.students_count) * 100) : 0}
                                className="mt-3 h-1.5"
                            />
                        </div>
                        <div className="p-3 sm:p-4 lg:p-5">
                            <CollectionList schoolClass={schoolClass} />
                        </div>
                    </Card>
                    <LoanRequestsForTeacher loanRequests={loanRequests} />
                </>
            ) : (
                <Card className="border-dashed">
                    <div className="empty-state p-6 sm:p-10">
                        <BookOpen className="empty-state-icon h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
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
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[360px_1fr]">
            <Card className="min-w-0 overflow-hidden">
                <div className="border-b p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light">
                            <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <h2 className="truncate text-base font-medium text-text sm:text-lg">Ajukan Pengambilan HP</h2>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">Isi form berikut untuk mengajukan peminjaman HP</p>
                </div>
                <form onSubmit={submit} className="space-y-5 p-4 sm:p-5">
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
                    <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
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

            <Card className="min-w-0 overflow-hidden">
                <div className="border-b p-4 sm:p-5">
                    <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-light">
                                <Smartphone className="h-5 w-5 text-warning" aria-hidden="true" />
                            </div>
                            <h2 className="truncate text-base font-medium text-text sm:text-lg">Riwayat Pengajuan</h2>
                        </div>
                        <span className="shrink-0 text-xs text-text-muted sm:text-sm">{loanRequests.length} pengajuan</span>
                    </div>
                </div>
                {loanRequests.length === 0 ? (
                    <div className="empty-state p-6 sm:p-10">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-warning-light">
                            <Smartphone className="h-7 w-7 text-warning" aria-hidden="true" />
                        </div>
                        <p className="empty-state-title text-base">Belum ada riwayat pengajuan</p>
                        <p className="empty-state-desc mt-2">Kirim pengajuan pertama Anda menggunakan form di sebelah kiri</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {loanRequests.map((request) => (
                            <div key={request.id} className="min-w-0 p-4 transition-colors hover:bg-bg-secondary sm:p-5">
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                                    <p className="break-words text-sm text-text-secondary line-clamp-2">{request.reason}</p>
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