import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, Info, Loader2, ShieldAlert } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';

import StatusIcon from './StatusIcon';
import StatusLegend from './StatusLegend';
import { studentStatusMeta, verifyStatusLegend } from './constants';

function VerifyDepositDialog({ target, onClose }) {
    const deposit = target?.deposit;
    const students = useMemo(() => target?.students ?? [], [target]);
    const [verifiedCount, setVerifiedCount] = useState('');
    const [notes, setNotes] = useState('');
    const [entryNotes, setEntryNotes] = useState({});
    const [processing, setProcessing] = useState(false);

    const open = Boolean(target && deposit);
    const reported = deposit?.reported_count ?? 0;
    const parsedVerified = verifiedCount === '' ? null : Number(verifiedCount);
    const difference = parsedVerified === null ? null : parsedVerified - reported;

    const attendanceStatuses = useMemo(
        () =>
            Object.fromEntries(
                (target?.attendance?.records ?? []).map((record) => [record.student_id, record.status]),
            ),
        [target],
    );

    useEffect(() => {
        if (!target || !deposit) return;

        setVerifiedCount(String(deposit.verified_count ?? deposit.reported_count));
        setNotes(deposit.verification_notes ?? '');
        setEntryNotes(
            Object.fromEntries(
                students.map((student) => [
                    student.id,
                    student.collection_records?.[0]?.verification_note ?? '',
                ]),
            ),
        );
    }, [target, deposit, students]);

    function handleOpenChange(nextOpen) {
        if (!nextOpen) {
            setVerifiedCount('');
            setNotes('');
            setEntryNotes({});
            onClose();
        }
    }

    function submit(event) {
        event.preventDefault();
        if (!deposit) return;

        setProcessing(true);
        router.patch(
            route('class-deposits.verify', deposit.id),
            {
                verified_count: Number(verifiedCount),
                verification_notes: notes.trim() || null,
                entries: students.map((student) => ({
                    student_id: student.id,
                    verification_note: (entryNotes[student.id] ?? '').trim() || null,
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => handleOpenChange(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Verifikasi setoran {target?.name}</DialogTitle>
                    <DialogDescription>
                        Masukkan jumlah fisik HP yang benar-benar ada di dalam box. Bandingkan dengan checklist ketua kelas
                        dan absensi wali kelas.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                        Dilaporkan ketua kelas:{' '}
                        <span className="font-semibold text-text">{reported} HP</span>
                        {deposit?.reported_by?.name && <span> oleh {deposit.reported_by.name}</span>}
                    </div>

                    {target?.needs_attention && (
                        <div className="flex items-start gap-2 rounded-lg bg-danger-light px-3 py-2.5 text-sm text-danger">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                Kelas ini sudah {target.shortages_last_30_days}x tercatat selisih dalam 30 hari
                                terakhir. Hitung ulang box dengan teliti.
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="verified-count">Jumlah fisik HP</Label>
                        <Input
                            id="verified-count"
                            type="number"
                            min="0"
                            max={target?.students_count ?? undefined}
                            value={verifiedCount}
                            onChange={(event) => setVerifiedCount(event.target.value)}
                            required
                            disabled={processing}
                        />
                    </div>

                    {difference !== null && difference !== 0 && (
                        <div
                            className={cn(
                                'flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm',
                                difference < 0
                                    ? 'bg-danger-light text-danger'
                                    : 'bg-warning-light text-warning',
                            )}
                        >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>
                                {difference < 0
                                    ? `Jumlah fisik kurang ${Math.abs(difference)} HP dari checklist.`
                                    : `Jumlah fisik lebih ${difference} HP dari checklist.`}{' '}
                                Kelas akan ditandai selisih.
                            </p>
                        </div>
                    )}

                    {students.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Keterangan per siswa (opsional)</Label>
                                <span className="text-xs tabular-nums text-text-muted">{students.length} siswa</span>
                            </div>
                            <StatusLegend items={verifyStatusLegend} />
                            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                                {students.map((student) => {
                                    const hpStatus = student.collection_records?.[0]?.status;
                                    const attendanceStatus = attendanceStatuses[student.id];
                                    const conflict =
                                        hpStatus === 'dikumpulkan' && attendanceStatus === 'tidak_masuk';
                                    const meta = studentStatusMeta[hpStatus] ?? {
                                        label: 'Belum didata',
                                        variant: 'primary',
                                        icon: Info,
                                    };

                                    return (
                                        <div key={student.id} className="rounded-md bg-bg-secondary p-2">
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <p className="truncate text-xs font-medium text-text">
                                                    {student.user?.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <StatusIcon
                                                        label={meta.label}
                                                        icon={meta.icon}
                                                        tone={meta.variant}
                                                    />
                                                    {attendanceStatus === 'tidak_masuk' && hpStatus !== 'tidak_masuk' && (
                                                        <StatusIcon label="Tidak masuk" icon={Info} tone="neutral" />
                                                    )}
                                                    {conflict && (
                                                        <StatusIcon
                                                            label="Perlu dicek"
                                                            icon={AlertTriangle}
                                                            tone="danger"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <Input
                                                value={entryNotes[student.id] ?? ''}
                                                onChange={(event) =>
                                                    setEntryNotes((current) => ({
                                                        ...current,
                                                        [student.id]: event.target.value,
                                                    }))
                                                }
                                                placeholder={
                                                    conflict
                                                        ? 'Contoh: sudah dikonfirmasi, HP dititipkan ke teman.'
                                                        : 'Keterangan (opsional)'
                                                }
                                                disabled={processing}
                                                className="mt-1.5 h-8 text-xs"
                                                aria-label={`Keterangan untuk ${student.user?.name}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="verification-notes">Catatan kelas (opsional)</Label>
                        <Textarea
                            id="verification-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Contoh: 2 HP belum diserahkan, sudah dikonfirmasi ke ketua kelas."
                            disabled={processing}
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || verifiedCount === ''}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan verifikasi'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default VerifyDepositDialog;
