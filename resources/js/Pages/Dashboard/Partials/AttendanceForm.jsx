import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ClipboardCheck, ClipboardList, Info, Loader2, Users } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';

import AttendanceStatusBadge from './AttendanceStatusBadge';
import AttendanceStudentList from './AttendanceStudentList';
import { attendanceMaps } from './constants';

function AttendanceForm({ schoolClass, attendance, attendanceLocked = false }) {
    const students = useMemo(
        () =>
            [...(schoolClass?.students ?? [])].sort((a, b) =>
                String(a.nis).localeCompare(String(b.nis), undefined, { numeric: true }),
            ),
        [schoolClass],
    );

    const initial = useMemo(() => attendanceMaps(students, attendance), [students, attendance]);
    const [statuses, setStatuses] = useState(() => initial.statuses);
    const [notes, setNotes] = useState(() => initial.notes);
    const [editing, setEditing] = useState(!attendance);
    const [processing, setProcessing] = useState(false);
    const errors = usePage().props.errors ?? {};

    const isVerified = attendance?.status === 'terverifikasi';
    const locked = attendanceLocked || isVerified;
    const showForm = !locked && editing;
    const absentCount = students.filter((student) => statuses[student.id] === 'tidak_masuk').length;

    function updateStatus(studentId, status) {
        setStatuses((current) => ({ ...current, [studentId]: status }));
    }

    function updateNote(studentId, value) {
        setNotes((current) => ({ ...current, [studentId]: value }));
    }

    function submit(event) {
        event.preventDefault();
        if (processing) return;

        setProcessing(true);
        router.post(
            route('attendance-reports.store'),
            {
                entries: students.map((student) => ({
                    student_id: student.id,
                    status: statuses[student.id] ?? 'masuk',
                    notes: (notes[student.id] ?? '').trim() || null,
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => setEditing(false),
            },
        );
    }

    if (students.length === 0) {
        return (
            <Card className="border-dashed">
                <div className="empty-state p-6 sm:p-10">
                    <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                    <p className="empty-state-title">Belum ada siswa</p>
                    <p className="empty-state-desc">Hubungi kesiswaan untuk menambahkan siswa ke kelas ini</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="min-w-0 overflow-hidden">
            <div className="border-b bg-white px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                            <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                            Absensi Pagi
                        </h2>
                        <p className="mt-1 text-xs text-text-secondary">
                            Semua siswa dianggap masuk. Tandai siswa yang tidak masuk, lalu kirim ke wali kelas.
                        </p>
                    </div>
                    <AttendanceStatusBadge attendance={attendance} />
                </div>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
                {attendance?.verification_notes && (
                    <div className="rounded-lg bg-bg-secondary px-3 py-2.5 text-xs leading-relaxed text-text-secondary">
                        Catatan wali kelas: {attendance.verification_notes}
                    </div>
                )}

                {locked && (
                    <div className="flex items-start gap-2 rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {isVerified
                            ? 'Absensi sudah diverifikasi wali kelas dan tidak dapat diubah.'
                            : 'Box kelas hari ini sudah diambil sehingga absensi tidak dapat diubah.'}
                    </div>
                )}

                {!locked && attendance && !editing && (
                    <div className="flex flex-col gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-sm text-warning sm:flex-row sm:items-center sm:justify-between">
                        <span>Absensi sudah dikirim dan sedang menunggu verifikasi wali kelas.</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                            Ubah absensi
                        </Button>
                    </div>
                )}

                {showForm ? (
                    <form onSubmit={submit} className="space-y-3">
                        <AttendanceStudentList
                            students={students}
                            statuses={statuses}
                            notes={notes}
                            onToggle={updateStatus}
                            onNoteChange={updateNote}
                        />

                        {errors.entries && (
                            <p className="error-text" role="alert">
                                {errors.entries}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-success-light px-2.5 py-1 font-medium text-success">
                                {students.length - absentCount} masuk
                            </span>
                            <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                                {absentCount} tidak masuk
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-text-muted">
                                {absentCount > 0
                                    ? `${absentCount} siswa akan dilaporkan tidak masuk.`
                                    : 'Semua siswa dilaporkan masuk.'}
                            </p>
                            <Button type="submit" disabled={processing} className="w-full justify-center gap-2 sm:w-auto">
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                                        Kirim absensi
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    attendance && (
                        <AttendanceStudentList
                            students={students}
                            statuses={initial.statuses}
                            notes={initial.notes}
                            readOnly
                        />
                    )
                )}

                {!attendance && locked && (
                    <p className="text-sm text-text-secondary">Absensi hari ini tidak diisi oleh sekretaris.</p>
                )}
            </div>
        </Card>
    );
}

export default AttendanceForm;
