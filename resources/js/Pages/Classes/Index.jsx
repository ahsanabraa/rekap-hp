import { Head, router, useForm } from '@inertiajs/react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';
import { BookOpen, Plus, Users, User, RotateCcw, Trash2 } from 'lucide-react';

export default function Index({ classes, teachers }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        grade: '',
        group_name: '',
        homeroom_user_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('classes.store'), { onSuccess: () => reset() });
    }

    function resetPassword(teacher) {
        if (confirm(`Reset password ${teacher.name} ke "password"?`)) {
            router.post(route('teachers.reset-password', teacher.id), {}, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Data Kelas" />
            <div className="space-y-6">
                <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-light text-primary">
                        Kesiswaan
                    </span>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">Data Kelas</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card>
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-text">Tambah Kelas</h2>
                            </div>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Kelas</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    disabled={processing}
                                    placeholder="Contoh: Kelas 10 IPA 1"
                                />
                                {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tingkat</Label>
                                    <Input
                                        value={data.grade}
                                        onChange={(e) => setData('grade', e.target.value)}
                                        placeholder="10"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.grade && <p className="error-text" role="alert">{errors.grade}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Rombel</Label>
                                    <Input
                                        value={data.group_name}
                                        onChange={(e) => setData('group_name', e.target.value)}
                                        placeholder="IPA 1"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.group_name && <p className="error-text" role="alert">{errors.group_name}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Wali Kelas</Label>
                                <Select value={data.homeroom_user_id} onChange={(e) => setData('homeroom_user_id', e.target.value)} disabled={processing}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Belum ditentukan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Belum ditentukan</SelectItem>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.homeroom_user_id && <p className="error-text" role="alert">{errors.homeroom_user_id}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Kelas'}
                            </Button>
                        </form>
                    </Card>

                    <Card>
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-text">Daftar Kelas</h2>
                            </div>
                        </div>
                        <div className="table-container">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Wali Kelas</TableHead>
                                        <TableHead>Jumlah Siswa</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classes.map((schoolClass) => (
                                        <TableRow key={schoolClass.id}>
                                            <TableCell className="font-medium">{schoolClass.name}</TableCell>
                                            <TableCell>{schoolClass.homeroom?.name ?? 'Belum ditentukan'}</TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{schoolClass.students_count} siswa</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-danger hover:text-danger/80">
                                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                            Hapus
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus kelas?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Semua data siswa di kelas ini akan terhapus permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => router.delete(route('classes.destroy', schoolClass.id))}
                                                                className="bg-danger hover:bg-danger/90"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {classes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-10 text-center text-text-muted">
                                                Belum ada kelas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <Card className="lg:col-span-2">
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                                <h2 className="text-lg font-medium text-text">Daftar Wali Kelas</h2>
                            </div>
                            <p className="mt-0.5 text-sm text-text-secondary">Reset password wali kelas yang lupa ke password awal.</p>
                        </div>
                        <div className="table-container">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="font-medium">{teacher.name}</TableCell>
                                            <TableCell><code className="bg-bg-tertiary px-2 py-0.5 rounded text-xs">{teacher.username}</code></TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => resetPassword(teacher)}
                                                    className="text-primary hover:text-primary/80"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                    Reset PW
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {teachers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="py-10 text-center text-text-muted">
                                                Belum ada wali kelas.
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