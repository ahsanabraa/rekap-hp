import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verifikasi Email" />
            <main className="flex min-h-screen items-center justify-center bg-bg-secondary px-4 py-8">
                <Card className="w-full max-w-md">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="mt-4 text-xl font-semibold text-text">Verifikasi Email</h1>
                        <p className="mt-2 text-sm text-text-secondary">
                            Kami telah mengirim link verifikasi ke email Anda. Silakan cek inbox Anda.
                        </p>
                    </div>
                    <div className="border-t p-6 space-y-3">
                        {status === 'verification-link-sent' && (
                            <div className="rounded-lg border border-success-light bg-success-light p-3 text-center">
                                <p className="text-sm font-medium text-success">
                                    Link verifikasi baru telah dikirim ke email Anda.
                                </p>
                            </div>
                        )}
                        <form onSubmit={submit} className="space-y-3">
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Ulang Verifikasi'}
                            </Button>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full text-center text-sm text-text-secondary underline hover:text-text"
                            >
                                Keluar
                            </Link>
                        </form>
                    </div>
                </Card>
            </main>
        </>
    );
}