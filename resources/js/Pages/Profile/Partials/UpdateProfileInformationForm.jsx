import { useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                    disabled={processing}
                />
                {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex h-10 items-center rounded-md border border-border bg-bg-secondary px-3 text-sm text-text-muted">
                    @{user.username}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    autoComplete="email"
                    disabled={processing}
                />
                {errors.email && <p className="error-text" role="alert">{errors.email}</p>}
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
                <div className="rounded-lg border border-warning-light bg-warning-light p-4">
                    <p className="text-sm text-warning">
                        Alamat email Anda belum diverifikasi.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="underline hover:text-[hsl(38_92%_45%)]"
                        >
                            {' '}Kirim ulang verifikasi.
                        </Link>
                    </p>
                    {status === 'verification-link-sent' && (
                        <div className="mt-2 text-sm font-medium text-success">
                            Link verifikasi baru telah dikirim ke email Anda.
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
                {recentlySuccessful && <span className="text-sm text-success">Tersimpan.</span>}
            </div>
        </form>
    );
}