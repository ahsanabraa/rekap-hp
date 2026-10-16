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
                    <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                        Pengaturan
                    </span>
                    <h1 className="mt-2 text-xl font-semibold tracking-tight text-text sm:mt-3 sm:text-2xl">Profil</h1>
                </>
            }
        >
            <Head title="Profil" />

            <div className="w-full max-w-2xl space-y-4 sm:space-y-5">
                <Card className="min-w-0 overflow-hidden">
                    <div className="border-b p-4 sm:p-5">
                        <h2 className="text-base font-medium text-text sm:text-lg">Informasi Profil</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Update informasi akun Anda.</p>
                    </div>
                    <div className="p-4 sm:p-5">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                    <div className="border-b p-4 sm:p-5">
                        <h2 className="text-base font-medium text-text sm:text-lg">Ubah Password</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Pastikan akun Anda menggunakan password yang aman.</p>
                    </div>
                    <div className="p-4 sm:p-5">
                        <UpdatePasswordForm />
                    </div>
                </Card>

                <Card className="min-w-0 overflow-hidden border-danger-light">
                    <div className="border-b p-4 sm:p-5">
                        <h2 className="text-base font-medium text-text sm:text-lg">Hapus Akun</h2>
                        <p className="mt-0.5 text-sm text-text-secondary">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
                    </div>
                    <div className="p-4 sm:p-5">
                        <DeleteUserForm />
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}