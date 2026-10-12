import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';

export default function Welcome({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
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
                <main className="flex min-h-screen items-center justify-center bg-bg-secondary px-4 py-8">
                    <Card className="w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="mt-4 text-xl font-semibold text-text">Selamat Datang</h1>
                            <p className="mt-2 text-sm text-text-secondary">Kamu sudah login sebagai <strong>{auth.user.name}</strong></p>
                        </div>
                        <div className="border-t p-6">
                            <Link href={route('dashboard')} className="btn-primary w-full justify-center">
                                Buka Dashboard
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </Card>
                </main>
            </>
        );
    }

    return (
        <>
            <Head title="RekapHP" />
            <main className="min-h-screen bg-bg-secondary px-4 py-8">
                <div className="mx-auto max-w-md">
                    <div className="mb-8 text-center">
                        <Link href="/" className="inline-flex items-center gap-2" aria-label="RekapHP Home">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-xl text-text">RekapHP</span>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader className="text-center pb-3">
                            <CardTitle className="text-xl">Masuk</CardTitle>
                            <CardDescription>Gunakan akun sekolah Anda untuk melanjutkan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={data.username}
                                        className="w-full"
                                        autoComplete="username"
                                        onChange={(event) => setData('username', event.target.value)}
                                        required
                                        disabled={processing}
                                        placeholder="Masukkan username"
                                    />
                                    {errors.username && <p className="error-text" role="alert">{errors.username}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full"
                                        autoComplete="current-password"
                                        onChange={(event) => setData('password', event.target.value)}
                                        required
                                        disabled={processing}
                                        placeholder="Masukkan password"
                                    />
                                    {errors.password && <p className="error-text" role="alert">{errors.password}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked)}
                                        disabled={processing}
                                    />
                                    <Label htmlFor="remember" className="text-sm font-normal text-text-secondary cursor-pointer">
                                        Ingat saya
                                    </Label>
                                </div>
                                <Button type="submit" className="w-full justify-center btn-primary" disabled={processing}>
                                    {processing ? 'Memproses...' : 'Masuk'}
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Button>
                                <p className="text-center text-xs text-text-muted">
                                    Lupa password? Minta reset ke wali kelas atau kesiswaan.
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-text-muted">
                            Pendataan HP sekolah yang lebih tertib.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}