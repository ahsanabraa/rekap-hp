import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import { Card } from '@/Components/ui/card';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-light text-primary">
                        Pengaturan
                    </span>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">Profil</h1>
                </>
            }
        >
            <Head title="Profil" />

            <div className="space-y-5 max-w-2xl">
                <Card>
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-medium text-text">Informasi Profil</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Update informasi akun Anda.</p>
                    </div>
                    <div className="p-5">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                </Card>

                <Card>
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-medium text-text">Ubah Password</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Pastikan akun Anda menggunakan password yang aman.</p>
                    </div>
                    <div className="p-5">
                        <UpdatePasswordForm />
                    </div>
                </Card>

                <Card className="border-danger-light">
                    <div className="p-5 border-b">
                        <h2 className="text-lg font-medium text-text">Hapus Akun</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
                    </div>
                    <div className="p-5">
                        <DeleteUserForm />
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}