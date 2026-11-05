import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Picker } from '@/Components/ui/picker';
import { Badge } from '@/Components/ui/badge';
import { useFeedback } from '@/Components/FeedbackProvider';
import { cn } from '@/lib/utils';
import { Clock, Loader2, Plus, RotateCcw, Smartphone, Users } from 'lucide-react';

const formatLoanTime = (loan) => {
    const start = new Date(loan.starts_at);
    const end = new Date(loan.ends_at);

    return `${start.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    })} • ${start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString(
        'id-ID',
        { hour: '2-digit', minute: '2-digit' },
    )}`;
};

function LoanCard({ loan, onReturn }) {
    const studentName = loan.student?.user?.name;

    return (
        <div className="rounded-lg border border-border bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={loan.returned_at ? 'neutral' : 'warning'}>
                            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                            {loan.returned_at ? 'Sudah kembali' : 'Dipinjam'}
                        </Badge>
                        <p className="truncate text-sm font-medium text-text">
                            {studentName ?? `${loan.school_class.name} (1 box)`}
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                        {studentName ? `${loan.school_class.name} • NIS ${loan.student.nis}` : 'Seluruh kelas'}
                    </p>
                </div>
                {!loan.returned_at && (
                    <Button type="button" size="sm" variant="outline" onClick={() => onReturn(loan)}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Kembalikan
                    </Button>
                )}
            </div>

            <p className="mt-2 rounded-md bg-bg-secondary px-2.5 py-2 text-xs leading-relaxed text-text-secondary">
                {loan.usage_description}
            </p>

            <dl className="mt-2 grid gap-1 text-xs text-text-muted sm:grid-cols-2">
                <div>
                    <dt className="inline font-medium text-text-secondary">Waktu: </dt>
                    <dd className="inline">{formatLoanTime(loan)}</dd>
                </div>
                <div>
                    <dt className="inline font-medium text-text-secondary">Guru: </dt>
                    <dd className="inline">{loan.teacher_name}</dd>
                </div>
                <div>
                    <dt className="inline font-medium text-text-secondary">Dicatat: </dt>
                    <dd className="inline">{loan.recorder?.name ?? '-'}</dd>
                </div>
                {loan.returned_at && (
                    <div>
                        <dt className="inline font-medium text-text-secondary">Kembali: </dt>
                        <dd className="inline">
                            {new Date(loan.returned_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </dd>
                    </div>
                )}
            </dl>
        </div>
    );
}

function LoanList({ loans, onReturn, emptyTitle, emptyDescription }) {
    if (loans.length === 0) {
        return (
            <div className="empty-state py-8">
                <Smartphone className="empty-state-icon h-10 w-10" aria-hidden="true" />
                <p className="empty-state-title">{emptyTitle}</p>
                <p className="empty-state-desc">{emptyDescription}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} onReturn={onReturn} />
            ))}
        </div>
    );
}

export default function Index({ date, classes, activeLoans = [], historyLoans = [] }) {
    const feedback = useFeedback();
    const { data, setData, post, processing, errors, reset } = useForm({
        target: 'student',
        class_id: '',
        student_id: '',
        usage_description: '',
        usage_date: date,
        start_time: '',
        end_time: '',
        teacher_name: '',
    });

    const selectedClass = classes.find((schoolClass) => String(schoolClass.id) === String(data.class_id));
    const studentOptions = [...(selectedClass?.students ?? [])]
        .sort((a, b) => String(a.nis).localeCompare(String(b.nis), undefined, { numeric: true }))
        .map((student) => ({
            value: String(student.id),
            label: `${student.user.name} (${student.nis})`,
        }));

    function submit(event) {
        event.preventDefault();
        post(route('loans.store'), {
            preserveScroll: true,
            onSuccess: () => reset('student_id', 'usage_description', 'start_time', 'end_time', 'teacher_name'),
        });
    }

    async function markReturned(loan) {
        const name = loan.student?.user?.name ?? `${loan.school_class.name} (1 box)`;
        const confirmed = await feedback.confirm({
            title: 'Tandai HP sudah dikembalikan?',
            description: `HP ${name} akan kembali dicatat sebagai dikumpulkan.`,
            confirmLabel: 'Tandai kembali',
            tone: 'warning',
        });

        if (!confirmed) return;

        router.patch(route('loans.return', loan.id), {}, {
            preserveScroll: true,
            onError: () => feedback.error('Gagal menandai HP kembali. Coba lagi.'),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Peminjaman HP" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text">Peminjaman HP</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Tandai HP yang sedang dipinjam beserta keterangan dan guru penandatangan.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card className="min-w-0">
                        <div className="border-b p-5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                                    <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-medium text-text">Tandai HP dipinjam</h2>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-4 p-5">
                            <div className="space-y-2">
                                <Label>Cakupan peminjaman</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('target', 'student')}
                                        aria-pressed={data.target === 'student'}
                                        className={cn(
                                            'rounded-md border px-2 py-2 text-xs font-medium',
                                            data.target === 'student'
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary',
                                        )}
                                    >
                                        Per siswa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('target', 'class');
                                            setData('student_id', '');
                                        }}
                                        aria-pressed={data.target === 'class'}
                                        className={cn(
                                            'rounded-md border px-2 py-2 text-xs font-medium',
                                            data.target === 'class'
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary',
                                        )}
                                    >
                                        Satu kelas (1 box)
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <Picker
                                    value={data.class_id ? String(data.class_id) : ''}
                                    onValueChange={(value) => {
                                        setData('class_id', value);
                                        setData('student_id', '');
                                    }}
                                    options={classes.map((schoolClass) => ({
                                        value: String(schoolClass.id),
                                        label: schoolClass.name,
                                    }))}
                                    placeholder="Pilih kelas"
                                    searchable
                                    invalid={Boolean(errors.class_id)}
                                />
                                {errors.class_id && (
                                    <p className="error-text" role="alert">
                                        {errors.class_id}
                                    </p>
                                )}
                            </div>

                            {data.target === 'student' && (
                                <div className="space-y-2">
                                    <Label>Nama siswa</Label>
                                    <Picker
                                        value={data.student_id ? String(data.student_id) : ''}
                                        onValueChange={(value) => setData('student_id', value)}
                                        options={studentOptions}
                                        placeholder={data.class_id ? 'Pilih siswa' : 'Pilih kelas dulu'}
                                        searchable
                                        disabled={!data.class_id}
                                        invalid={Boolean(errors.student_id)}
                                    />
                                    {errors.student_id && (
                                        <p className="error-text" role="alert">
                                            {errors.student_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Keterangan penggunaan</Label>
                                <Textarea
                                    value={data.usage_description}
                                    onChange={(event) => setData('usage_description', event.target.value)}
                                    placeholder="Contoh: praktik mapel Informatika"
                                    rows={3}
                                    required
                                />
                                {errors.usage_description && (
                                    <p className="error-text" role="alert">
                                        {errors.usage_description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Tanggal penggunaan</Label>
                                <Input type="date" value={data.usage_date} readOnly />
                                <p className="text-xs text-text-muted">
                                    Hanya untuk hari ini. Peminjaman lintas hari diajukan ulang besok pagi.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Jam mulai</Label>
                                    <Input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(event) => setData('start_time', event.target.value)}
                                        required
                                    />
                                    {errors.start_time && (
                                        <p className="error-text" role="alert">
                                            {errors.start_time}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam selesai</Label>
                                    <Input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(event) => setData('end_time', event.target.value)}
                                        required
                                    />
                                    {errors.end_time && (
                                        <p className="error-text" role="alert">
                                            {errors.end_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nama guru yang menandatangani</Label>
                                <Input
                                    value={data.teacher_name}
                                    onChange={(event) => setData('teacher_name', event.target.value)}
                                    placeholder="Nama guru"
                                    required
                                />
                                {errors.teacher_name && (
                                    <p className="error-text" role="alert">
                                        {errors.teacher_name}
                                    </p>
                                )}
                            </div>

                            <p className="rounded-lg bg-bg-secondary px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                                {data.target === 'class'
                                    ? 'Hanya siswa yang HP-nya sudah disetor hari ini yang akan ditandai dipinjam.'
                                    : 'HP harus sudah tercatat disetor hari ini sebelum bisa ditandai dipinjam.'}
                            </p>

                            <Button type="submit" className="w-full justify-center" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Smartphone className="h-4 w-4" aria-hidden="true" />
                                        Tandai dipinjam
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    <div className="space-y-6">
                        <Card className="min-w-0">
                            <div className="flex items-center justify-between gap-3 border-b p-5">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-light">
                                        <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                                    </div>
                                    <h2 className="truncate text-lg font-medium text-text">Sedang dipinjam</h2>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{activeLoans.length} HP</span>
                            </div>
                            <div className="p-5">
                                <LoanList
                                    loans={activeLoans}
                                    onReturn={markReturned}
                                    emptyTitle="Tidak ada HP dipinjam"
                                    emptyDescription="Semua HP sudah kembali ke box."
                                />
                            </div>
                        </Card>

                        <Card className="min-w-0">
                            <div className="flex items-center justify-between gap-3 border-b p-5">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                                        <Users className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                    </div>
                                    <h2 className="truncate text-lg font-medium text-text">Riwayat</h2>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{historyLoans.length} catatan</span>
                            </div>
                            <div className="p-5">
                                <LoanList
                                    loans={historyLoans}
                                    onReturn={markReturned}
                                    emptyTitle="Belum ada riwayat"
                                    emptyDescription="Peminjaman yang sudah dikembalikan akan tampil di sini."
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
