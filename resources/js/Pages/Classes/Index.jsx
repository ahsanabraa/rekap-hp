import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, router, useForm } from '@inertiajs/react';

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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Data Kelas</h2>}>
            <Head title="Data Kelas" />
            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[320px_1fr]">
                    <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-lg font-semibold text-gray-900">Tambah kelas</h3>
                        <div className="space-y-4">
                            <div><InputLabel value="Nama kelas" /><TextInput className="mt-1 w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required /><p className="mt-1 text-xs text-red-600">{errors.name}</p></div>
                            <div><InputLabel value="Tingkat" /><TextInput className="mt-1 w-full" value={data.grade} onChange={(e) => setData('grade', e.target.value)} placeholder="Contoh: 10" required /><p className="mt-1 text-xs text-red-600">{errors.grade}</p></div>
                            <div><InputLabel value="Rombel" /><TextInput className="mt-1 w-full" value={data.group_name} onChange={(e) => setData('group_name', e.target.value)} placeholder="Contoh: IPA 1" required /><p className="mt-1 text-xs text-red-600">{errors.group_name}</p></div>
                            <div><InputLabel value="Wali kelas" /><select className="mt-1 w-full rounded-md border-gray-300 shadow-sm" value={data.homeroom_user_id} onChange={(e) => setData('homeroom_user_id', e.target.value)}><option value="">Belum ditentukan</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select><p className="mt-1 text-xs text-red-600">{errors.homeroom_user_id}</p></div>
                            <PrimaryButton disabled={processing}>Simpan kelas</PrimaryButton>
                        </div>
                    </form>
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b px-6 py-4"><h3 className="font-semibold text-gray-900">Daftar kelas</h3></div>
                        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-6 py-3">Kelas</th><th className="px-6 py-3">Wali kelas</th><th className="px-6 py-3">Siswa</th><th className="px-6 py-3"></th></tr></thead><tbody className="divide-y">{classes.map((schoolClass) => <tr key={schoolClass.id}><td className="px-6 py-4 font-medium">{schoolClass.name}</td><td className="px-6 py-4">{schoolClass.homeroom?.name ?? 'Belum ditentukan'}</td><td className="px-6 py-4">{schoolClass.students_count}</td><td className="px-6 py-4 text-right"><button className="text-red-600 hover:underline" onClick={() => { if (confirm('Hapus kelas ini?')) router.delete(route('classes.destroy', schoolClass.id)); }}>Hapus</button></td></tr>)}{classes.length === 0 && <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Belum ada kelas.</td></tr>}</tbody></table></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
