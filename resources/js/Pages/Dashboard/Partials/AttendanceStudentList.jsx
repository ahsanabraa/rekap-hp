import { useMemo, useState } from 'react';
import { Check, Crown, Info, Search, Users } from 'lucide-react';

import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';

import StatusIcon from './StatusIcon';
import StatusLegend from './StatusLegend';
import { attendanceLegend, attendanceStatusOptions } from './constants';

function AttendanceStudentList({
    students = [],
    statuses = {},
    notes = {},
    onToggle = null,
    onNoteChange = null,
    readOnly = false,
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.user?.name?.toLowerCase().includes(keyword) ||
                String(student.nis).toLowerCase().includes(keyword),
        );
    }, [students, query]);

    const absentCount = students.filter((student) => statuses[student.id] === 'tidak_masuk').length;

    if (students.length === 0) {
        return (
            <div className="empty-state py-8">
                <Users className="empty-state-icon h-10 w-10" aria-hidden="true" />
                <p className="empty-state-title">Belum ada siswa</p>
                <p className="empty-state-desc">Kelas ini belum memiliki siswa</p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-0 flex-1 sm:max-w-sm">
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
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-success-light px-2.5 py-1 font-medium text-success">
                        {students.length - absentCount} masuk
                    </span>
                    <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                        {absentCount} tidak masuk
                    </span>
                </div>
            </div>

            {readOnly && <StatusLegend items={attendanceLegend} className="mb-3" />}

            <p className="mb-2 text-xs tabular-nums text-text-muted" role="status">
                Menampilkan {filtered.length} dari {students.length} siswa
            </p>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-bg-secondary px-4 py-8 text-center">
                    <p className="text-sm font-medium text-text">Tidak ada hasil</p>
                    <p className="mt-1 text-xs text-text-secondary">Coba kata kunci lain</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((student) => {
                        const status = statuses[student.id] ?? 'masuk';
                        const isAbsent = status === 'tidak_masuk';

                        const identity = (
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
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
                                        {student.is_class_secretary && (
                                            <Badge variant="primary" className="px-1.5 py-0 text-[10px]">
                                                Sekretaris
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="truncate text-xs tabular-nums text-text-muted">
                                        NIS {student.nis}
                                    </p>
                                </div>
                            </div>
                        );

                        if (readOnly) {
                            return (
                                <div
                                    key={student.id}
                                    className="rounded-lg border border-border bg-white p-2.5 sm:p-3"
                                >
                                    <div className="flex min-w-0 items-center justify-between gap-2.5">
                                        {identity}
                                        {isAbsent ? (
                                            <StatusIcon
                                                label="Tidak masuk"
                                                icon={Info}
                                                tone="neutral"
                                                className="shrink-0"
                                            />
                                        ) : (
                                            <StatusIcon
                                                label="Masuk"
                                                icon={Check}
                                                tone="success"
                                                className="shrink-0"
                                            />
                                        )}
                                    </div>
                                    {isAbsent && notes[student.id] && (
                                        <p className="mt-1.5 pl-10 text-xs text-text-secondary sm:pl-11">
                                            Catatan: {notes[student.id]}
                                        </p>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={student.id}
                                className="rounded-lg border border-border bg-white p-2.5 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:p-3"
                            >
                                {identity}

                                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-0 sm:w-[200px] sm:shrink-0">
                                    {attendanceStatusOptions.map((option) => {
                                        const Icon = option.icon;
                                        const active = status === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => onToggle?.(student.id, option.value)}
                                                aria-pressed={active}
                                                className={cn(
                                                    'flex items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                                                    active
                                                        ? option.activeClass
                                                        : 'border-border bg-white text-text-secondary hover:bg-bg-tertiary hover:text-text',
                                                )}
                                            >
                                                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                <span className="truncate">{option.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {isAbsent && (
                                    <Input
                                        value={notes[student.id] ?? ''}
                                        onChange={(event) => onNoteChange?.(student.id, event.target.value)}
                                        placeholder="Alasan, mis. izin/sakit"
                                        className="mt-2 h-8 w-full text-xs sm:mt-0 sm:max-w-[200px]"
                                        aria-label={`Catatan ketidakhadiran ${student.user.name}`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AttendanceStudentList;
