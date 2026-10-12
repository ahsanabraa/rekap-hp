import { Head, router, useForm } from '@inertiajs/react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import { Users, Plus, RotateCcw } from 'lucide-react';

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

    return (
        <>
            <Head title="Data Siswa" />
            <div className="space-y-6">
                <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-light text-primary">
                        Kesiswaan
                    </span>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">Data Siswa</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card>
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-text">Tambah Siswa</h2>
                            </div>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
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
                                <Select value={data.class_id} onChange={(e) => setData('class_id', e.target.value)} required disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((schoolClass) => (
                                            <SelectItem key={schoolClass.id} value={schoolClass.id}>
                                                {schoolClass.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class_id && <p className="error-text" role="alert">{errors.class_id}</p>}
                            </div>
                            <p className="text-xs text-text-muted">
                                Username otomatis = NIS. Password awal: <code className="bg-bg-tertiary px-1.5 rounded text-text">password</code>
                            </p>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Siswa'}
                            </Button>
                        </form>
                    </Card>

                    <Card>
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-text">Daftar Siswa</h2>
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
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => resetPassword(student)}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                    Reset PW
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center text-text-muted">
                                                Belum ada siswa.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}