import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Picker } from '@/Components/ui/picker';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { BookOpen, Plus, Users, User, RotateCcw, Trash2, Loader2, Pencil } from 'lucide-react';
import { JURUSAN, TINGKAT } from '@/lib/jurusan';
import { cn } from '@/lib/utils';
import { useFeedback } from '@/Components/FeedbackProvider';

function ClassFields({ data, setData, errors, teachers, disabled }) {
    const homeroomOptions = [
        { value: '', label: 'Belum ditentukan' },
        ...teachers.map((teacher) => ({ value: String(teacher.id), label: teacher.name })),
    ];

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Tingkat</Label>
                <div role="radiogroup" aria-label="Tingkat" className="grid grid-cols-3 gap-2">
                    {TINGKAT.map((tingkat) => {
                        const active = data.grade === tingkat;

                        return (
                            <button
                                key={tingkat}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={disabled}
                                onClick={() => setData('grade', tingkat)}
                                className={cn(
                                    'h-10 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                    active
                                        ? 'border-primary bg-primary-light text-primary'
                                        : 'border-border bg-white text-text-secondary hover:bg-bg-secondary',
                                )}
                            >
                                {tingkat}
                            </button>
                        );
                    })}
                </div>
                {errors.grade && <p className="error-text" role="alert">{errors.grade}</p>}
            </div>

            <div className="grid grid-cols-[1fr_96px] gap-4">
                <div className="space-y-2">
                    <Label>Jurusan</Label>
                    <Picker
                        value={data.jurusan}
                        onValueChange={(value) => setData('jurusan', value)}
                        options={JURUSAN}
                        placeholder="Pilih jurusan"
                        disabled={disabled}
                        invalid={Boolean(errors.jurusan)}
                    />
                    {errors.jurusan && <p className="error-text" role="alert">{errors.jurusan}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Rombel</Label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={99}
                        value={data.rombel}
                        onChange={(event) => setData('rombel', event.target.value)}
                        disabled={disabled}
                        placeholder="1"
                        className={errors.rombel ? 'border-danger' : undefined}
                    />
                    {errors.rombel && <p className="error-text" role="alert">{errors.rombel}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Wali Kelas</Label>
                <Picker
                    value={data.homeroom_user_id}
                    onValueChange={(value) => setData('homeroom_user_id', value)}
                    options={homeroomOptions}
                    placeholder="Belum ditentukan"
                    disabled={disabled}
                    searchable
                />
                {errors.homeroom_user_id && (
                    <p className="error-text" role="alert">{errors.homeroom_user_id}</p>
                )}
            </div>

            <div className="rounded-lg bg-bg-secondary px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                Nama kelas:{' '}
                <span className="font-semibold text-text">
                    {data.grade || '—'} {data.jurusan || '—'} {data.rombel || '—'}
                </span>
            </div>
        </div>
    );
}

export default function Index({ classes, teachers }) {
    const feedback = useFeedback();
    const [editing, setEditing] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        grade: '10',
        jurusan: JURUSAN[0],
        rombel: '1',
        homeroom_user_id: '',
    });

    const editForm = useForm({
        grade: '10',
        jurusan: JURUSAN[0],
        rombel: '1',
        homeroom_user_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('classes.store'), { preserveScroll: true, onSuccess: () => reset() });
    }

    function startEdit(schoolClass) {
        editForm.setData({
            grade: schoolClass.grade,
            jurusan: schoolClass.jurusan,
            rombel: String(schoolClass.rombel),
            homeroom_user_id: schoolClass.homeroom_user_id
                ? String(schoolClass.homeroom_user_id)
                : '',
        });
        editForm.clearErrors();
        setEditing(schoolClass);
    }

    function submitEdit(event) {
        event.preventDefault();
        editForm.patch(route('classes.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    async function resetPassword(teacher) {
        const confirmed = await feedback.confirm({
            title: 'Reset password wali kelas?',
            description: `Password ${teacher.name} akan direset menjadi "password". Sampaikan password baru ke yang bersangkutan.`,
            confirmLabel: 'Reset password',
            tone: 'warning',
        });

        if (!confirmed) {
            return;
        }

        router.post(route('teachers.reset-password', teacher.id), {}, {
            preserveScroll: true,
            onError: () => feedback.error('Password gagal direset. Coba lagi.'),
        });
    }

    async function destroyClass(schoolClass) {
        if (schoolClass.students_count > 0) {
            feedback.warning(
                `${schoolClass.name} masih memiliki ${schoolClass.students_count} siswa. Pindahkan atau hapus siswanya terlebih dahulu.`,
                { title: 'Kelas tidak bisa dihapus' },
            );
            return;
        }

        const confirmed = await feedback.confirm({
            title: `Hapus ${schoolClass.name}?`,
            description: 'Tindakan ini tidak dapat dibatalkan.',
            confirmLabel: 'Hapus kelas',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        router.delete(route('classes.destroy', schoolClass.id), {
            preserveScroll: true,
            onError: () => feedback.error('Kelas gagal dihapus. Coba lagi.'),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Data Kelas" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text">Data Kelas</h1>
                    <p className="mt-1 text-sm text-text-secondary">Kelola kelas dan wali kelas sekolah</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card className="min-w-0">
                        <div className="p-5 border-b">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                                    <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-medium text-text">Tambah Kelas</h2>
                            </div>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-5">
                            <ClassFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                teachers={teachers}
                                disabled={processing}
                            />
                            <Button type="submit" className="w-full justify-center" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                        Simpan Kelas
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
                                        <BookOpen className="h-5 w-5 text-success" aria-hidden="true" />
                                    </div>
                                    <h2 className="truncate text-lg font-medium text-text">Daftar Kelas</h2>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{classes.length} kelas</span>
                            </div>
                        </div>
                        <div className="table-container">
                            <Table className="min-w-[720px]">
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
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                                                    {schoolClass.students_count} siswa
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEdit(schoolClass)}
                                                        className="text-text-secondary hover:text-text"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => destroyClass(schoolClass)}
                                                        className="text-danger hover:text-[hsl(0_84%_55%)]"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {classes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <div className="empty-state py-8">
                                                    <BookOpen className="empty-state-icon h-10 w-10" aria-hidden="true" />
                                                    <p className="empty-state-title">Belum ada kelas</p>
                                                    <p className="empty-state-desc">Tambahkan kelas pertama lewat form di samping</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <Card className="min-w-0 lg:col-span-2">
                        <div className="p-5 border-b">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-light">
                                        <User className="h-5 w-5 text-warning" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-medium text-text">Daftar Wali Kelas</h2>
                                        <p className="mt-0.5 text-sm text-text-secondary">Reset password wali kelas yang lupa ke password awal.</p>
                                    </div>
                                </div>
                                <span className="shrink-0 text-sm text-text-muted">{teachers.length} guru</span>
                            </div>
                        </div>
                        <div className="table-container">
                            <Table className="min-w-[520px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>NPK</TableHead>
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
                                                    className="text-primary hover:text-primary-hover"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                                                    Reset PW
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {teachers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <div className="empty-state py-8">
                                                    <User className="empty-state-icon h-10 w-10" aria-hidden="true" />
                                                    <p className="empty-state-title">Belum ada wali kelas</p>
                                                    <p className="empty-state-desc">Akun wali kelas dibuat oleh kesiswaan</p>
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

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Kelas</DialogTitle>
                        <DialogDescription>
                            Ubah tingkat, jurusan, rombel, atau wali kelas.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-5">
                        <ClassFields
                            data={editForm.data}
                            setData={editForm.setData}
                            errors={editForm.errors}
                            teachers={teachers}
                            disabled={editForm.processing}
                        />
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(null)}
                                disabled={editForm.processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
