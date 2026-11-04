import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Picker } from '@/Components/ui/picker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Users, Plus, RotateCcw, Loader2, Crown, ClipboardList } from 'lucide-react';
import { useFeedback } from '@/Components/FeedbackProvider';

export default function Index({ students, classes }) {
    const feedback = useFeedback();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nis: '',
        class_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('students.store'), { onSuccess: () => reset() });
    }

    async function resetPassword(student) {
        const confirmed = await feedback.confirm({
            title: 'Reset password siswa?',
            description: `Password ${student.user.name} akan direset menjadi "password". Lakukan hanya jika siswa benar-benar lupa password.`,
            confirmLabel: 'Reset password',
            tone: 'warning',
        });

        if (!confirmed) {
            return;
        }

        router.post(route('students.reset-password', student.id), {}, {
            preserveScroll: true,
            onError: () => feedback.error('Password gagal direset. Coba lagi.'),
        });
    }

    async function toggleClassLeader(student) {
        if (student.is_class_leader) {
            const confirmed = await feedback.confirm({
                title: 'Cabut status ketua kelas?',
                description: `${student.user.name} tidak lagi tercatat sebagai ketua kelas.`,
                confirmLabel: 'Cabut status',
                tone: 'danger',
            });

            if (!confirmed) {
                return;
            }
        }

        router.post(
            route('students.class-leader', student.id),
            { is_class_leader: !student.is_class_leader },
            {
                preserveScroll: true,
                onError: (errors) =>
                    feedback.error(errors.is_class_leader ?? 'Status ketua kelas gagal diperbarui.'),
            },
        );
    }

    async function toggleClassSecretary(student) {
        if (student.is_class_secretary) {
            const confirmed = await feedback.confirm({
                title: 'Cabut status sekretaris kelas?',
                description: `${student.user.name} tidak lagi tercatat sebagai sekretaris kelas.`,
                confirmLabel: 'Cabut status',
                tone: 'danger',
            });

            if (!confirmed) {
                return;
            }
        }

        router.post(
            route('students.class-secretary', student.id),
            { is_class_secretary: !student.is_class_secretary },
            {
                preserveScroll: true,
                onError: (errors) =>
                    feedback.error(errors.is_class_secretary ?? 'Status sekretaris kelas gagal diperbarui.'),
            },
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Data Siswa" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text">Data Siswa</h1>
                    <p className="mt-1 text-sm text-text-secondary">Kelola data siswa dan akun login mereka</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card className="min-w-0">
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                                    <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-medium text-text">Tambah Siswa</h2>
                            </div>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-5">
                            <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    disabled={processing}
                                    placeholder="Nama lengkap siswa"
                                />
                                {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>NIS</Label>
                                <Input
                                    value={data.nis}
                                    onChange={(e) => setData('nis', e.target.value)}
                                    required
                                    disabled={processing}
                                    placeholder="Contoh: 0001"
                                />
                                {errors.nis && <p className="error-text" role="alert">{errors.nis}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <Picker
                                    value={data.class_id ? String(data.class_id) : ''}
                                    onValueChange={(value) => setData('class_id', value)}
                                    options={classes.map((schoolClass) => ({
                                        value: String(schoolClass.id),
                                        label: schoolClass.name,
                                    }))}
                                    placeholder="Pilih kelas"
                                    disabled={processing}
                                    searchable
                                    invalid={Boolean(errors.class_id)}
                                />
                                {errors.class_id && <p className="error-text" role="alert">{errors.class_id}</p>}
                            </div>
                            <p className="rounded-lg bg-bg-secondary px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                                Username otomatis = NIS. Password awal: <code className="rounded bg-bg-tertiary px-1.5 text-text">password</code>
                            </p>
                            <Button type="submit" className="w-full justify-center" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                        Simpan Siswa
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    <Card className="min-w-0">
                        <div className="p-5 border-b">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-light">
                                        <Users className="h-5 w-5 text-success" aria-hidden="true" />
                                    </div>
                                    <h2 className="truncate text-lg font-medium text-text">Daftar Siswa</h2>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{students.length} siswa</span>
                            </div>
                        </div>
                        <div className="table-container">
                            <Table className="min-w-[720px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Peran Kelas</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.nis}</TableCell>
                                            <TableCell>{student.user.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{student.school_class.name}</Badge>
                                            </TableCell>
                                            <TableCell><code className="bg-bg-tertiary px-2 py-0.5 rounded text-xs">{student.user.username}</code></TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-start gap-1.5">
                                                    {student.is_class_leader ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Badge variant="success">
                                                                <Crown className="mr-1 h-3 w-3" aria-hidden="true" />
                                                                Ketua
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleClassLeader(student)}
                                                                className="h-7 px-1.5 text-xs text-text-muted hover:text-danger"
                                                            >
                                                                Cabut
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleClassLeader(student)}
                                                            disabled={student.is_class_secretary}
                                                            title={
                                                                student.is_class_secretary
                                                                    ? 'Siswa ini sudah menjadi sekretaris kelas'
                                                                    : undefined
                                                            }
                                                            className="text-text-secondary hover:text-text"
                                                        >
                                                            <Crown className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                                            Jadikan Ketua
                                                        </Button>
                                                    )}

                                                    {student.is_class_secretary ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Badge variant="primary">
                                                                <ClipboardList className="mr-1 h-3 w-3" aria-hidden="true" />
                                                                Sekretaris
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleClassSecretary(student)}
                                                                className="h-7 px-1.5 text-xs text-text-muted hover:text-danger"
                                                            >
                                                                Cabut
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleClassSecretary(student)}
                                                            disabled={student.is_class_leader}
                                                            title={
                                                                student.is_class_leader
                                                                    ? 'Siswa ini sudah menjadi ketua kelas'
                                                                    : undefined
                                                            }
                                                            className="text-text-secondary hover:text-text"
                                                        >
                                                            <ClipboardList className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                                            Jadikan Sekretaris
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => resetPassword(student)}
                                                     className="text-primary hover:text-primary-hover"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                    Reset PW
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <div className="empty-state py-8">
                                                    <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                                                    <p className="empty-state-title">Belum ada siswa</p>
                                                    <p className="empty-state-desc">Tambahkan siswa pertama lewat form di samping</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}