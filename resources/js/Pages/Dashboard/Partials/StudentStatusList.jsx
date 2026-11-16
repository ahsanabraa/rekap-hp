import { useMemo, useState } from 'react';
import { Crown, Info, Search, Users } from 'lucide-react';

import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';

import StatusIcon from './StatusIcon';
import StatusLegend from './StatusLegend';
import { studentStatusLegend, studentStatusMeta } from './constants';

function StudentStatusList({ students = [], attendance = null }) {
    const [query, setQuery] = useState('');

    const attendanceStatuses = useMemo(
        () =>
            Object.fromEntries(
                (attendance?.records ?? []).map((record) => [record.student_id, record.status]),
            ),
        [attendance],
    );

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return students;

        return students.filter(
            (student) =>
                student.user?.name?.toLowerCase().includes(keyword) ||
                String(student.nis).toLowerCase().includes(keyword),
        );
    }, [students, query]);

    const counts = useMemo(() => {
        const result = {
            dikumpulkan: 0,
            tidak_mengumpulkan: 0,
            tidak_masuk: 0,
            sedang_dipinjam: 0,
            belum: 0,
        };

        students.forEach((student) => {
            const status = student.collection_records?.[0]?.status ?? 'belum';
            if (Object.hasOwn(result, status)) {
                result[status] += 1;
            } else {
                result.belum += 1;
            }
        });

        return result;
    }, [students]);

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
                        {counts.dikumpulkan} setor
                    </span>
                    <span className="rounded-full bg-danger-light px-2.5 py-1 font-medium text-danger">
                        {counts.tidak_mengumpulkan} tidak membawa
                    </span>
                    <span className="rounded-full bg-bg-tertiary px-2.5 py-1 font-medium text-text-secondary">
                        {counts.tidak_masuk} tidak masuk
                    </span>
                    {counts.sedang_dipinjam > 0 && (
                        <span className="rounded-full bg-warning-light px-2.5 py-1 font-medium text-warning">
                            {counts.sedang_dipinjam} dipinjam
                        </span>
                    )}
                    {counts.belum > 0 && (
                        <span className="rounded-full bg-warning-light px-2.5 py-1 font-medium text-warning">
                            {counts.belum} belum
                        </span>
                    )}
                </div>
            </div>

            <StatusLegend items={studentStatusLegend} className="mb-3" />

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
                        const meta =
                            studentStatusMeta[student.collection_records?.[0]?.status] ?? {
                                label: 'Belum didata',
                                variant: 'primary',
                                icon: Info,
                            };

                        return (
                            <div
                                key={student.id}
                                className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-white p-2.5 sm:p-3"
                            >
                                <div
                                    className="avatar avatar-md flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary sm:h-9 sm:w-9 sm:text-sm"
                                    aria-hidden="true"
                                >
                                    {student.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <p className="truncate text-sm font-medium text-text">{student.user.name}</p>
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
                                    <p className="truncate text-xs tabular-nums text-text-muted">NIS {student.nis}</p>
                                    {student.collection_records?.[0]?.verification_note && (
                                        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                                            Keterangan kesiswaan: {student.collection_records[0].verification_note}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                                    {attendanceStatuses[student.id] === 'tidak_masuk' &&
                                        student.collection_records?.[0]?.status !== 'tidak_masuk' && (
                                            <StatusIcon label="Tidak masuk" icon={Info} tone="neutral" />
                                        )}
                                    <StatusIcon
                                        label={meta.label}
                                        icon={meta.icon}
                                        tone={meta.variant}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default StudentStatusList;
