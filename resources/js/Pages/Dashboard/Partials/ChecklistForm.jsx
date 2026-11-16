import { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ClipboardCheck, ClipboardList, Crown, Info, Loader2, Search, Users } from 'lucide-react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';

import AttentionNotice from './AttentionNotice';
import DepositInfo from './DepositInfo';
import DepositMetrics from './DepositMetrics';
import DepositStatusBadge from './DepositStatusBadge';
import StatusIcon from './StatusIcon';
import StatusLegend from './StatusLegend';
import StudentStatusList from './StudentStatusList';
import { buildInitialStatuses, studentStatusLegend, studentStatusOptions } from './constants';

function ChecklistForm({ schoolClass, attendance, flagWindowDays }) {
    const students = useMemo(
        () =>
            [...(schoolClass?.students ?? [])].sort((a, b) =>
                String(a.nis).localeCompare(String(b.nis), undefined, { numeric: true }),
            ),
        [schoolClass],
    );
    const deposit = schoolClass?.deposit;
    const isPending = deposit?.status === 'menunggu_verifikasi';
    const isLocked = Boolean(deposit && !isPending);
    const verifiedAttendance = attendance?.status === 'terverifikasi' ? attendance : null;
    const attendanceStatuses = useMemo(
        () =>
            Object.fromEntries(
                (attendance?.records ?? []).map((record) => [record.student_id, record.status]),
            ),
        [attendance],
    );
    const [editing, setEditing] = useState(!deposit);
    const [statuses, setStatuses] = useState(() => buildInitialStatuses(students, attendanceStatuses));
    const [query, setQuery] = useState('');
    const [processing, setProcessing] = useState(false);
    const errors = usePage().props.errors ?? {};

    // Absensi bisa masuk setelah checklist dibuka; siswa yang tidak masuk langsung ditandai.
    useEffect(() => {
        setStatuses((current) => {
            const next = { ...current };

            Object.entries(attendanceStatuses).forEach(([studentId, status]) => {
                if (status === 'tidak_masuk') {
                    next[studentId] = 'tidak_masuk';
                } else if (status === 'masuk' && next[studentId] === 'tidak_masuk') {
                    next[studentId] = 'belum';
                }
            });

            return next;
        });
    }, [attendanceStatuses]);

    const counts = useMemo(() => {
        const result = { dikumpulkan: 0, tidak_mengumpulkan: 0, tidak_masuk: 0, belum: 0 };

        students.forEach((student) => {
            const status = statuses[student.id] ?? 'belum';
            if (Object.hasOwn(result, status)) {
                result[status] += 1;
            } else {
                result.belum += 1;
            }
        });

        return result;
    }, [students, statuses]);

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.user?.name?.toLowerCase().includes(keyword) ||
                String(student.nis).toLowerCase().includes(keyword),
        );
    }, [students, query]);

    function toggleStatus(studentId, status) {
        if (attendanceStatuses[studentId] === 'tidak_masuk') return;
        if (attendanceStatuses[studentId] === 'masuk' && status === 'tidak_masuk') return;

        setStatuses((current) => ({
            ...current,
            [studentId]: current[studentId] === status ? 'belum' : status,
        }));
    }

    function submit(event) {
        event.preventDefault();
        if (counts.belum > 0 || processing) return;

        setProcessing(true);
        router.post(
            route('class-deposits.store'),
            {
                entries: students.map((student) => ({
                    student_id: student.id,
                    status: statuses[student.id] ?? 'belum',
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
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

    const showForm = !isLocked && editing;

    return (
        <div className="space-y-4">
            <AttentionNotice schoolClass={schoolClass} flagWindowDays={flagWindowDays} />

            <Card className="min-w-0 overflow-hidden">
                <div className="border-b bg-white px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                                <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                                Checklist Setoran Pagi
                            </h2>
                            <p className="mt-1 text-xs text-text-secondary">
                                {attendance
                                    ? verifiedAttendance
                                        ? 'Absensi sudah diverifikasi wali kelas. Siswa yang tidak masuk terkunci otomatis.'
                                        : 'Absensi sudah diisi sekretaris. Siswa yang tidak masuk ditandai otomatis, menunggu verifikasi wali kelas.'
                                    : 'Absensi belum diisi sekretaris. Tandai manual siswa yang tidak masuk.'}
                            </p>
                        </div>
                        <DepositStatusBadge deposit={deposit} />
                    </div>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                    <DepositMetrics deposit={deposit} />
                    <DepositInfo deposit={deposit} />

                    {isLocked && (
                        <div className="flex items-start gap-2 rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            Checklist sudah diverifikasi kesiswaan dan tidak dapat diubah lagi.
                        </div>
                    )}

                    {isPending && !editing && (
                        <div className="flex flex-col gap-2 rounded-lg bg-warning-light px-3 py-2.5 text-sm text-warning sm:flex-row sm:items-center sm:justify-between">
                            <span>Checklist sudah dikirim dan sedang menunggu verifikasi kesiswaan.</span>
                            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                                Ubah checklist
                            </Button>
                        </div>
                    )}

                    {attendance && !verifiedAttendance && (
                        <div className="flex items-start gap-2 rounded-lg bg-bg-secondary px-3 py-2.5 text-sm text-text-secondary">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            Absensi sudah diisi sekretaris. Siswa yang tidak masuk sudah ditandai otomatis dan tidak bisa diubah.
                        </div>
                    )}

                    {showForm && (
                        <>
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                                    aria-hidden="true"
                                />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari nama atau NIS..."
                                    className="h-10 pl-9 text-sm"
                                    aria-label="Cari siswa"
                                />
                            </div>

                            <p className="text-xs tabular-nums text-text-muted" role="status">
                                Menampilkan {filtered.length} dari {students.length} siswa
                            </p>

                            <StatusLegend items={studentStatusLegend} className="mb-1" />

                            <div className="space-y-2">
                                {filtered.map((student) => {
                                    const activeStatus = statuses[student.id] ?? 'belum';
                                    const attendanceStatus = attendanceStatuses[student.id];

                                    return (
                                        <div
                                            key={student.id}
                                            className="rounded-lg border border-border bg-white p-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary sm:h-9 sm:w-9 sm:text-sm"
                                                    aria-hidden="true"
                                                >
                                                    {student.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <p className="truncate text-sm font-medium text-text">
                                                            {student.user.name}
                                                        </p>
                                                        {student.is_class_leader && (
                                                            <Badge variant="success" className="px-1.5 py-0 text-[10px]">
                                                                <Crown className="mr-0.5 h-2.5 w-2.5" aria-hidden="true" />
                                                                Ketua
                                                            </Badge>
                                                        )}
                                                        {student.is_class_vice_leader && (
                                                            <Badge variant="warning" className="px-1.5 py-0 text-[10px]">
                                                                <Crown className="mr-0.5 h-2.5 w-2.5" aria-hidden="true" />
                                                                Wakil
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs tabular-nums text-text-muted">
                                                        NIS {student.nis}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-0 sm:w-[290px] sm:shrink-0">
                                                {attendanceStatus === 'tidak_masuk' ? (
                                                    <div className="col-span-3 flex items-center justify-center rounded-md border border-border bg-bg-secondary px-2 py-1.5">
                                                        <StatusIcon
                                                            label="Tidak masuk (absensi)"
                                                            icon={Info}
                                                            tone="neutral"
                                                            className="h-5 w-5"
                                                        />
                                                    </div>
                                                ) : (
                                                    studentStatusOptions.map((option) => {
                                                        const Icon = option.icon;
                                                        const active = activeStatus === option.value;
                                                        const disabled =
                                                            attendanceStatus === 'masuk' &&
                                                            option.value === 'tidak_masuk';

                                                        return (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => toggleStatus(student.id, option.value)}
                                                                aria-pressed={active}
                                                                disabled={disabled}
                                                                title={
                                                                    disabled
                                                                        ? 'Siswa tercatat masuk pada absensi terverifikasi'
                                                                        : undefined
                                                                }
                                                                className={cn(
                                                                    'flex items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                                                                    active
                                                                        ? option.activeClass
                                                                        : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary hover:text-text',
                                                                    disabled && 'cursor-not-allowed opacity-40 hover:bg-white',
                                                                )}
                                                            >
                                                                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                                <span className="truncate">{option.label}</span>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filtered.length === 0 && (
                                <div className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
                                    <p className="text-sm font-medium text-text">Tidak ada hasil</p>
                                    <p className="mt-1 text-xs text-text-secondary">Coba kata kunci lain</p>
                                </div>
                            )}

                            {errors.entries && (
                                <p className="error-text" role="alert">
                                    {errors.entries}
                                </p>
                            )}
                        </>
                    )}

                    {!showForm && (
                        <StudentStatusList students={students} attendance={attendance} />
                    )}
                </div>

                {showForm && (
                    <div className="border-t bg-white px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-success-light px-2.5 py-1 font-medium text-success">
                                {counts.dikumpulkan} setor
                            </span>
                            <span className="rounded-full bg-danger-light px-2.5 py-1 font-medium text-danger">
                                {counts.tidak_mengumpulkan} tidak membawa
                            </span>
                            <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                                {counts.tidak_masuk} tidak masuk
                            </span>
                            {counts.belum > 0 && (
                                <span className="rounded-full bg-warning-light px-2.5 py-1 font-medium text-warning">
                                    {counts.belum} belum ditandai
                                </span>
                            )}
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-text-muted">
                                {counts.belum > 0
                                    ? 'Tandai semua siswa terlebih dahulu sebelum mengirim.'
                                    : 'Jumlah setor akan menjadi laporan ke kesiswaan.'}
                            </p>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={processing || counts.belum > 0}
                                className="w-full justify-center gap-2 sm:w-auto"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                                        Kirim checklist
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default ChecklistForm;
