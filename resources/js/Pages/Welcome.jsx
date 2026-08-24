import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiArrowRight, FiCheckCircle, FiSmartphone } from 'react-icons/fi';

export default function Welcome({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(event) {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    }

    if (auth.user) {
        return (
            <>
                <Head title="RekapHP" />
                <main className="flex min-h-screen items-center justify-center bg-sky-50 px-6">
                    <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-sm">
                        <FiSmartphone className="mx-auto text-4xl text-sky-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-900">Selamat datang di RekapHP</h1>
                        <p className="mt-2 text-sm text-slate-500">Kamu sudah login sebagai {auth.user.name}.</p>
                        <Link href={route('dashboard')} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600">Buka dashboard <FiArrowRight /></Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Head title="RekapHP" />
            <main className="min-h-screen bg-sky-50 px-5 py-8 text-slate-900 sm:px-8">
                <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1fr_380px]">
                    <section className="px-2 lg:px-6">
                        <div className="flex items-center gap-3 text-xl font-bold tracking-tight"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-2xl text-white"><FiSmartphone /></span>RekapHP</div>
                        <h1 className="mt-10 max-w-xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">Pendataan HP sekolah yang lebih tertib.</h1>
                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Satu tempat untuk mencatat pengumpulan HP setiap kelas.</p>
                        <div className="mt-7 flex items-center gap-3 text-sm font-medium text-slate-600"><FiCheckCircle className="text-sky-500" /> Mudah dicatat oleh wali kelas</div>
                        <div className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-600"><FiCheckCircle className="text-sky-500" /> Data tersimpan rapi</div>
                    </section>
                    <section id="login" className="rounded-2xl border border-sky-100 bg-white p-7 shadow-sm sm:p-8">
                        <div className="mb-7"><h2 className="text-2xl font-bold text-slate-900">Masuk</h2><p className="mt-1 text-sm text-slate-500">Gunakan akun sekolah kamu.</p></div>
                        <form onSubmit={submit} className="space-y-5">
                            <div><InputLabel htmlFor="email" value="Email" /><TextInput id="email" type="email" name="email" value={data.email} className="mt-1 block w-full" autoComplete="username" isFocused onChange={(event) => setData('email', event.target.value)} required /><InputError message={errors.email} className="mt-2" /></div>
                            <div><InputLabel htmlFor="password" value="Password" /><TextInput id="password" type="password" name="password" value={data.password} className="mt-1 block w-full" autoComplete="current-password" onChange={(event) => setData('password', event.target.value)} required /><InputError message={errors.password} className="mt-2" /></div>
                            <label className="flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="rounded border-slate-300 text-sky-500 focus:ring-sky-400" /> Ingat saya</label>
                            <PrimaryButton className="w-full justify-center bg-sky-500 hover:bg-sky-600 focus:ring-sky-400" disabled={processing}>Masuk <FiArrowRight className="ms-2" /></PrimaryButton>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}
