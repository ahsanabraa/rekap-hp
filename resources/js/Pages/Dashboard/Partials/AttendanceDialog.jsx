import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

import AttendanceStudentList from './AttendanceStudentList';
import { attendanceMaps } from './constants';

function AttendanceDialog({ open, onOpenChange, schoolClass, attendance, students, mode }) {
    const [statuses, setStatuses] = useState({});
    const [notes, setNotes] = useState({});
    const [classNote, setClassNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const errors = usePage().props.errors ?? {};

    useEffect(() => {
        if (!open) return;

        const maps = attendanceMaps(students, attendance);
        setStatuses(maps.statuses);
        setNotes(maps.notes);
        setClassNote(attendance?.verification_notes ?? '');
    }, [open, attendance, students]);

    function handleOpenChange(nextOpen) {
        if (!nextOpen) {
            setStatuses({});
            setNotes({});
            setClassNote('');
            onOpenChange(false);
        }
    }

    function submit(event) {
        event.preventDefault();
        if (processing) return;

        setProcessing(true);

        const payload = {
            entries: students.map((student) => ({
                student_id: student.id,
                status: statuses[student.id] ?? 'masuk',
                notes: (notes[student.id] ?? '').trim() || null,
            })),
            verification_notes: classNote.trim() || null,
        };

        const options = {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => handleOpenChange(false),
        };

        if (mode === 'manual') {
            router.post(route('attendance-reports.manual'), payload, options);
        } else {
            router.patch(route('attendance-reports.verify', attendance.id), payload, options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'manual' ? 'Input absensi' : 'Verifikasi absensi'} {schoolClass?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Semua siswa dianggap masuk. Tandai siswa yang tidak masuk, lalu simpan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <AttendanceStudentList
                        students={students}
                        statuses={statuses}
                        notes={notes}
                        onToggle={(studentId, status) =>
                            setStatuses((current) => ({ ...current, [studentId]: status }))
                        }
                        onNoteChange={(studentId, value) =>
                            setNotes((current) => ({ ...current, [studentId]: value }))
                        }
                    />

                    <div className="space-y-2">
                        <Label htmlFor="attendance-notes">Catatan untuk kelas (opsional)</Label>
                        <Textarea
                            id="attendance-notes"
                            value={classNote}
                            onChange={(event) => setClassNote(event.target.value)}
                            placeholder="Contoh: 2 siswa izin lomba, 1 sakit."
                            disabled={processing}
                            className="min-h-[70px] resize-none"
                        />
                    </div>

                    {errors.entries && (
                        <p className="error-text" role="alert">
                            {errors.entries}
                        </p>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan absensi'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AttendanceDialog;
