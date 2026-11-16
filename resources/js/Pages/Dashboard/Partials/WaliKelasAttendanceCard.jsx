import { useMemo, useState } from 'react';
import { ClipboardCheck, ClipboardList } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';

import AttendanceStatusBadge from './AttendanceStatusBadge';
import AttendanceDialog from './AttendanceDialog';
import AttendanceStudentList from './AttendanceStudentList';
import Metric from './Metric';
import { attendanceMaps, formatDateTime } from './constants';

function WaliKelasAttendanceCard({ schoolClass, attendance, attendanceLocked = false, students = [] }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const maps = useMemo(() => attendanceMaps(students, attendance), [students, attendance]);
    const absentCount = attendance?.verified_absent_count ?? attendance?.absent_count ?? 0;
    const isVerified = attendance?.status === 'terverifikasi';

    return (
        <>
            <Card className="mb-4 min-w-0 overflow-hidden">
                <div className="border-b px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                                <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                                Absensi hari ini
                            </h2>
                            <p className="mt-0.5 text-xs text-text-secondary">
                                {attendance
                                    ? 'Laporan sekretaris kelas. Koreksi bila perlu, lalu verifikasi.'
                                    : 'Sekretaris belum mengirim absensi. Kamu bisa input manual.'}
                            </p>
                        </div>
                        <AttendanceStatusBadge attendance={attendance} />
                    </div>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                    {attendance ? (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                <Metric label="Masuk" value={Math.max(0, students.length - absentCount)} tone="success" />
                                <Metric label="Tidak masuk" value={absentCount} tone={absentCount > 0 ? 'danger' : 'neutral'} />
                            </div>

                            <AttendanceStudentList
                                students={students}
                                statuses={maps.statuses}
                                notes={maps.notes}
                                readOnly
                            />

                            <div className="space-y-1 text-xs text-text-muted">
                                {attendance.reported_by?.name && (
                                    <p>
                                        Dilaporkan oleh{' '}
                                        <span className="font-medium text-text-secondary">
                                            {attendance.reported_by.name}
                                        </span>
                                        {attendance.reported_at && ` · ${formatDateTime(attendance.reported_at)}`}
                                    </p>
                                )}
                                {attendance.verified_by?.name && (
                                    <p>
                                        Diverifikasi oleh{' '}
                                        <span className="font-medium text-text-secondary">
                                            {attendance.verified_by.name}
                                        </span>
                                        {attendance.verified_at && ` · ${formatDateTime(attendance.verified_at)}`}
                                    </p>
                                )}
                                {attendance.verification_notes && (
                                    <p className="rounded-md bg-bg-secondary px-2.5 py-2 leading-relaxed text-text-secondary">
                                        Catatan: {attendance.verification_notes}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-text-secondary">
                            Belum ada absensi untuk kelas ini hari ini.
                        </p>
                    )}

                    {!attendanceLocked ? (
                        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
                            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {attendance ? (isVerified ? 'Koreksi absensi' : 'Koreksi & verifikasi') : 'Input absensi'}
                        </Button>
                    ) : (
                        <p className="text-xs text-text-muted">
                            Box kelas sudah diambil sehingga absensi tidak bisa diubah lagi.
                        </p>
                    )}
                </div>
            </Card>

            <AttendanceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                schoolClass={schoolClass}
                attendance={attendance}
                students={students}
                mode={attendance ? 'verify' : 'manual'}
            />
        </>
    );
}

export default WaliKelasAttendanceCard;
