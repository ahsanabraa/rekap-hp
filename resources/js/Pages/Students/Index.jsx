import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ students, classes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        nis: '',
        class_id: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('students.store'), { onSuccess: () => reset() });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Data Siswa</h2>}>
            <Head title="Data Siswa" />
            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[320px_1fr]">
                    <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-lg font-semibold text-gray-900">Tambah siswa</h3>
                        <div className="space-y-4">
                            <div><InputLabel value="Nama lengkap" /><TextInput className="mt-1 w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required /><p className="mt-1 text-xs text-red-600">{errors.name}</p></div>
                            <div><InputLabel value="Email" /><TextInput type="email" className="mt-1 w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required /><p className="mt-1 text-xs text-red-600">{errors.email}</p></div>
                            <div><InputLabel value="NIS" /><TextInput className="mt-1 w-full" value={data.nis} onChange={(e) => setData('nis', e.target.value)} required /><p className="mt-1 text-xs text-red-600">{errors.nis}</p></div>
                            <div><InputLabel value="Kelas" /><select className="mt-1 w-full rounded-md border-gray-300 shadow-sm" value={data.class_id} onChange={(e) => setData('class_id', e.target.value)} required><option value="">Pilih kelas</option>{classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select><p className="mt-1 text-xs text-red-600">{errors.class_id}</p></div>
                            <p className="text-xs text-gray-500">Password awal siswa: password</p>
                            <PrimaryButton disabled={processing}>Simpan siswa</PrimaryButton>
                        </div>
                    </form>
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b px-6 py-4"><h3 className="font-semibold text-gray-900">Daftar siswa</h3></div>
                        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-6 py-3">NIS</th><th className="px-6 py-3">Nama</th><th className="px-6 py-3">Kelas</th><th className="px-6 py-3">Email</th></tr></thead><tbody className="divide-y">{students.map((student) => <tr key={student.id}><td className="px-6 py-4 font-medium">{student.nis}</td><td className="px-6 py-4">{student.user.name}</td><td className="px-6 py-4">{student.school_class.name}</td><td className="px-6 py-4">{student.user.email}</td></tr>)}{students.length === 0 && <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">Belum ada siswa.</td></tr>}</tbody></table></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
