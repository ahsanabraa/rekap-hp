import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ClipboardList, Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { useFeedback } from '@/Components/FeedbackProvider';

import KesiswaanClassCard from './Partials/KesiswaanClassCard';
import PageHeader from './Partials/PageHeader';
import VerifyDepositDialog from './Partials/VerifyDepositDialog';

export default function Monitoring({ classes = [], date, flagWindowDays = 30 }) {
    const [verifyTarget, setVerifyTarget] = useState(null);
    const feedback = useFeedback();

    async function releaseBox(schoolClass) {
        if (!schoolClass.deposit) return;

        const confirmed = await feedback.confirm({
            title: `Tandai box ${schoolClass.name} sudah diambil?`,
            description:
                'Box dianggap sudah dikembalikan ke ketua kelas. Status setoran akan ditandai selesai dan tidak bisa diubah lagi.',
            confirmLabel: 'Tandai diambil',
            tone: 'warning',
        });

        if (!confirmed) return;

        router.patch(
            route('class-deposits.release', schoolClass.deposit.id),
            {},
            {
                preserveScroll: true,
                onError: (errors) =>
                    feedback.error(errors.verified_count ?? 'Box gagal ditandai diambil. Coba lagi.'),
            },
        );
    }

    const pendingClasses = classes.filter(
        (schoolClass) => schoolClass.deposit?.status === 'menunggu_verifikasi',
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring kelas" />
            <PageHeader title="Monitoring kelas" date={date} />

            {pendingClasses > 0 && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-sm text-warning">
                    <ClipboardList className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                        {pendingClasses} kelas sudah mengirim checklist dan menunggu verifikasi jumlah fisik HP.
                    </p>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {classes.map((schoolClass) => (
                    <KesiswaanClassCard
                        key={schoolClass.id}
                        schoolClass={schoolClass}
                        onVerify={setVerifyTarget}
                        onRelease={releaseBox}
                        flagWindowDays={flagWindowDays}
                    />
                ))}
                {classes.length === 0 && (
                    <Card className="border-dashed sm:col-span-2 xl:col-span-3">
                        <div className="p-8 text-center">
                            <Users className="mx-auto h-10 w-10 text-text-muted opacity-50" aria-hidden="true" />
                            <p className="mt-3 text-sm font-medium text-text">Belum ada kelas</p>
                            <p className="mt-1 text-sm text-text-secondary">
                                Tambah kelas dan siswa terlebih dahulu
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            <VerifyDepositDialog target={verifyTarget} onClose={() => setVerifyTarget(null)} />
        </AuthenticatedLayout>
    );
}
