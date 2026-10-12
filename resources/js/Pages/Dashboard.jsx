import { Head, router, useForm, usePage } from '@inertiajs/react';
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
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function PageHeader({ role, title, subtitle }) {
    const roleLabels = { kesiswaan: 'Kesiswaan', wali_kelas: 'Wali Kelas', siswa: 'Siswa' };
    const roleColors = { kesiswaan: 'bg-primary-light text-primary', wali_kelas: 'bg-success-light text-success', siswa: 'bg-warning-light text-warning' };
    
    return (
        <div className="mb-6">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}>
                {roleLabels[role]}
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
    );
}

function KesiswaanDashboard({ classes = [], date }) {
    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader role="kesiswaan" title="Monitoring Kelas" subtitle={`Ringkasan ${date}`} />
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                {classes.map((schoolClass) => {
                    const progress = schoolClass.students_count
                        ? Math.round((schoolClass.collected_students_count / schoolClass.students_count) * 100)
                        : 0;
                    const collected = schoolClass.collected_students_count;
                    const total = schoolClass.students_count;
                    
                    return (
                        <Card key={schoolClass.id} className="hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium text-text truncate">{schoolClass.name}</p>
                                        <p className="mt-0.5 text-sm text-text-secondary">{schoolClass.homeroom?.name ?? 'Belum ada wali kelas'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-2xl font-semibold text-text">{collected}/{total}</span>
                                        <span className="text-xs text-text-muted">{progress}%</span>
                                    </div>
                                </div>
                                <Progress value={progress} className="mt-4 h-1.5" />
                            </div>
                        </Card>
                    );
                })}
                {classes.length === 0 && (
                    <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4 border-dashed">
                        <div className="p-8 text-center">
                            <BookOpen className="mx-auto h-10 w-10 text-text-muted opacity-50" aria-hidden="true" />
                            <p className="mt-3 font-medium text-text">Belum ada kelas</p>
                            <p className="mt-1 text-sm text-text-secondary">Tambah kelas untuk memulai monitoring</p>
                        </div>
                    </Card>
                )}
            </div>

            {classes.length > 0 && (
                <Card>
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-medium text-text">Detail Kelas</h2>
                    </div>
                    <Tabs defaultValue={String(classes[0]?.id ?? '')}>
                        <div className="border-b px-3 pt-3 sm:px-5">
                            <TabsList className="h-auto w-full justify-start gap-1.5 bg-transparent p-0">
                                {classes.map((schoolClass) => (
                                    <TabsTrigger
                                        key={schoolClass.id}
                                        value={String(schoolClass.id)}
                                        className="rounded-t-lg border border-b-0 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-border data-[state=active]:bg-white data-[state=active]:text-text data-[state=active]:shadow-none"
                                    >
                                        {schoolClass.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        {classes.map((schoolClass) => (
                            <TabsContent key={schoolClass.id} value={String(schoolClass.id)} className="mt-0 p-5">
                                <CollectionList schoolClass={schoolClass} interactive={false} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </Card>
            )}
        </div>
    );
}

function CollectionList({ schoolClass, interactive = true }) {
    const students = schoolClass?.students ?? [];

    function updateStatus(studentId, status) {
        router.post(route('collection-records.status', studentId), { status }, { preserveScroll: true });
    }

    function resetPassword(student) {
        if (window.confirm(`Reset password ${student.user.name} ke "password"?`)) {
            router.post(route('students.reset-password', student.id), {}, { preserveScroll: true });
        }
    }

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
        <div className="space-y-3">
            {students.map((student) => {
                const currentStatus = student.collection_records?.[0]?.status;
                const activeOption = statusOptions.find((s) => s.value === currentStatus);
                const ActiveIcon = activeOption?.icon;
                return (
                    <div
                        key={student.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 transition-colors hover:bg-bg-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="avatar avatar-md shrink-0">
                                {student.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium text-text">{student.user.name}</p>
                                <p className="text-sm text-text-muted">{student.nis}</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {interactive ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                'gap-1.5',
                                                activeOption
                                                    ? statusStyles[activeOption.variant].button
                                                    : 'border-border bg-white text-text-secondary'
                                            )}
                                        >
                                            {activeOption && ActiveIcon ? (
                                                <>
                                                    <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {activeOption.label}
                                                </>
                                            ) : (
                                                'Pilih status'
                                            )}
                                            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {statusOptions.map(({ value, label, icon: Icon, variant }) => (
                                            <DropdownMenuItem
                                                key={value}
                                                className={cn('flex items-center gap-2', currentStatus === value && 'bg-bg-secondary font-medium')}
                                                onClick={() => updateStatus(student.id, value)}
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resetPassword(student)}
                                className="text-primary hover:text-primary/80"
                                aria-label={`Reset password ${student.user.name}`}
                            >
                                <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                                Reset PW
                            </Button>
                        </div>
                    </div>
                );
            })}
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
            <Card className="mt-6">
                <div className="p-5 border-b">
                    <h2 className="text-lg font-medium text-text">Pengajuan Pengambilan HP</h2>
                </div>
                <div className="p-8 empty-state">
                    <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Belum ada pengajuan hari ini</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mt-6">
            <div className="p-5 border-b">
                <h2 className="text-lg font-medium text-text">Pengajuan Pengambilan HP</h2>
            </div>
            <div className="divide-y divide-border">
                {loanRequests.map((request) => (
                    <div key={request.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-text">{request.student_name}</p>
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
    return (
        <div>
            <Head title="Dashboard" />
            <PageHeader role="wali_kelas" title={schoolClass?.name ?? 'Belum Ada Kelas'} subtitle={`Pendataan ${date}`} />
            
            {schoolClass ? (
                <>
                    <Card className="mb-6">
                        <div className="p-5 border-b">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-medium text-text">Daftar Pengumpulan HP</h2>
                                    <p className="mt-0.5 text-sm text-text-secondary">Klik status untuk mengubah keterangan siswa</p>
                                </div>
                                <span className="text-sm text-text-muted">
                                    {schoolClass.collected_students_count} / {schoolClass.students_count} dikumpulkan
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
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
            <PageHeader role="siswa" title={`Halo, ${user.name}`} subtitle="Ajukan dan pantau pengambilan HP Anda" />
            <StudentLoanRequests loanRequests={loanRequests} />
        </div>
    );
}

export default function Dashboard({ role, classes, schoolClass, date, loanRequests }) {
    const user = usePage().props.auth.user;
    if (role === 'kesiswaan') return <KesiswaanDashboard classes={classes} date={date} />;
    if (role === 'wali_kelas') return <WaliKelasDashboard schoolClass={schoolClass} date={date} loanRequests={loanRequests} />;
    return <SiswaDashboard user={user} loanRequests={loanRequests} />;
}