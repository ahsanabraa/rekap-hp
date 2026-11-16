import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

import AttentionNotice from './Partials/AttentionNotice';
import PageHeader from './Partials/PageHeader';
import StudentStatusList from './Partials/StudentStatusList';

function EmptyClass() {
    return (
        <Card className="border-dashed">
            <div className="empty-state p-6 sm:p-10">
                <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                <p className="empty-state-title">Belum ada kelas</p>
                <p className="empty-state-desc">Tambah kelas dan siswa terlebih dahulu</p>
            </div>
        </Card>
    );
}

function KesiswaanStatus({ classes = [], flagWindowDays }) {
    if (classes.length === 0) return <EmptyClass />;

    return (
        <Card className="min-w-0 overflow-hidden">
            <div className="border-b px-4 py-3 sm:px-5">
                <h2 className="text-sm font-semibold text-text">Detail status per siswa</h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                    Read-only, hasil checklist ketua kelas hari ini
                </p>
            </div>
            <Tabs defaultValue={String(classes[0]?.id ?? '')}>
                <div className="border-b px-3 pt-3 sm:px-4">
                    <div className="scrollbar-thin overflow-x-auto">
                        <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
                            {classes.map((schoolClass) => (
                                <TabsTrigger
                                    key={schoolClass.id}
                                    value={String(schoolClass.id)}
                                    className="whitespace-nowrap rounded-t-lg border border-b-0 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-border data-[state=active]:bg-white data-[state=active]:text-text data-[state=active]:shadow-none"
                                >
                                    {schoolClass.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>
                {classes.map((schoolClass) => (
                    <TabsContent key={schoolClass.id} value={String(schoolClass.id)} className="mt-0 p-4 sm:p-5">
                        <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />
                        <StudentStatusList
                            students={schoolClass.students}
                            attendance={schoolClass.attendance}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </Card>
    );
}

function WaliKelasStatus({ schoolClass, flagWindowDays }) {
    if (!schoolClass) {
        return (
            <Card className="border-dashed">
                <div className="empty-state p-6 sm:p-10">
                    <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Kamu belum memiliki kelas</p>
                    <p className="empty-state-desc">Hubungi kesiswaan untuk mendapatkan akses ke kelas</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />
            <Card className="min-w-0 overflow-hidden">
                <div className="border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-text">Status per siswa</h2>
                    <p className="mt-0.5 text-xs text-text-secondary">{schoolClass.name}</p>
                </div>
                <div className="p-4 sm:p-5">
                    <StudentStatusList
                        students={schoolClass.students}
                        attendance={schoolClass.attendance}
                    />
                </div>
            </Card>
        </>
    );
}

export default function Status({ role, classes = [], schoolClass = null, date, flagWindowDays = 30 }) {
    return (
        <AuthenticatedLayout>
            <Head title="Status per siswa" />
            <PageHeader title="Status per siswa" date={date} />

            {role === 'kesiswaan' ? (
                <KesiswaanStatus classes={classes} flagWindowDays={flagWindowDays} />
            ) : (
                <WaliKelasStatus schoolClass={schoolClass} flagWindowDays={flagWindowDays} />
            )}
        </AuthenticatedLayout>
    );
}
