import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import { Users, Plus, RotateCcw, Loader2, Crown } from 'lucide-react';

export default function Index({ students, classes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nis: '',
        class_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('students.store'), { onSuccess: () => reset() });
    }

    function resetPassword(student) {
        if (confirm(`Reset password ${student.user.name} ke "password"?`)) {
            router.post(route('students.reset-password', student.id), {}, { preserveScroll: true });
        }
    }

    function toggleClassLeader(student) {
        if (
            student.is_class_leader &&
            !confirm(`Cabut status ketua kelas dari ${student.user.name}?`)
        ) {
            return;
        }

        router.post(
            route('students.class-leader', student.id),
            { is_class_leader: !student.is_class_leader },
            { preserveScroll: true },
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
                    <Card>
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
                                <Select
                                    value={data.class_id ? String(data.class_id) : ''}
                                    onValueChange={(value) => setData('class_id', value)}
                                    required
                                    disabled={processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((schoolClass) => (
                                            <SelectItem key={schoolClass.id} value={String(schoolClass.id)}>
                                                {schoolClass.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                    <Card>
                        <div className="p-5 border-b">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light">
                                        <Users className="h-5 w-5 text-success" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-lg font-medium text-text">Daftar Siswa</h2>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{students.length} siswa</span>
                            </div>
                        </div>
                        <div className="table-container">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Ketua Kelas</TableHead>
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
                                                        className="text-text-secondary hover:text-text"
                                                    >
                                                        <Crown className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                                        Jadikan
                                                    </Button>
                                                )}
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