import { AlertTriangle, Check, Clock, Info, PackageCheck, X } from 'lucide-react';

const studentStatusOptions = [
    {
        value: 'dikumpulkan',
        label: 'Setor',
        fullLabel: 'Setor HP',
        icon: Check,
        variant: 'success',
        activeClass: 'border-success bg-success-light text-success',
    },
    {
        value: 'tidak_mengumpulkan',
        label: 'Tidak membawa',
        fullLabel: 'Tidak membawa HP',
        icon: X,
        variant: 'danger',
        activeClass: 'border-danger bg-danger-light text-danger',
    },
    {
        value: 'tidak_masuk',
        label: 'Tidak masuk',
        fullLabel: 'Tidak masuk',
        icon: Info,
        variant: 'neutral',
        activeClass: 'border-border-strong bg-bg-tertiary text-text',
    },
];

const studentStatusMeta = {
    dikumpulkan: { label: 'Setor', variant: 'success', icon: Check },
    tidak_mengumpulkan: { label: 'Tidak membawa', variant: 'danger', icon: X },
    tidak_masuk: { label: 'Tidak masuk', variant: 'neutral', icon: Info },
    sedang_dipinjam: { label: 'Dipinjam', variant: 'warning', icon: Clock },
};
const attendanceStatusOptions = [
    {
        value: 'masuk',
        label: 'Masuk',
        icon: Check,
        activeClass: 'border-success bg-success-light text-success',
    },
    {
        value: 'tidak_masuk',
        label: 'Tidak masuk',
        icon: Info,
        activeClass: 'border-border-strong bg-bg-tertiary text-text',
    },
];

const statusTone = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
    neutral: 'bg-bg-tertiary text-text-secondary',
};

const studentStatusLegend = [
    { key: 'dikumpulkan', label: 'Setor HP', icon: Check, tone: 'success' },
    { key: 'tidak_mengumpulkan', label: 'Tidak membawa', icon: X, tone: 'danger' },
    { key: 'sedang_dipinjam', label: 'Dipinjam', icon: Clock, tone: 'warning' },
    { key: 'tidak_masuk', label: 'Tidak masuk', icon: Info, tone: 'neutral' },
    { key: 'belum', label: 'Belum didata', icon: Info, tone: 'primary' },
];

const attendanceLegend = [
    { key: 'masuk', label: 'Masuk', icon: Check, tone: 'success' },
    { key: 'tidak_masuk', label: 'Tidak masuk', icon: Info, tone: 'neutral' },
];

const verifyStatusLegend = [
    ...studentStatusLegend,
    { key: 'perlu_dicek', label: 'Perlu dicek', icon: AlertTriangle, tone: 'danger' },
];
function attendanceMaps(students = [], attendance = null) {
    const statuses = {};
    const notes = {};

    students.forEach((student) => {
        statuses[student.id] = 'masuk';
    });

    (attendance?.records ?? []).forEach((record) => {
        statuses[record.student_id] = record.status;
        if (record.notes) {
            notes[record.student_id] = record.notes;
        }
    });

    return { statuses, notes };
}
const depositStatusMeta = {
    menunggu_verifikasi: { label: 'Menunggu verifikasi', variant: 'warning', icon: Clock },
    terverifikasi: { label: 'Terverifikasi', variant: 'success', icon: Check },
    selisih: { label: 'Ada selisih', variant: 'danger', icon: AlertTriangle },
    selesai: { label: 'Box sudah diambil', variant: 'neutral', icon: PackageCheck },
};
const formatDate = (date) => {
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return date;
    }
};

const formatDateTime = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatTime = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
function buildInitialStatuses(students, attendanceStatuses = {}) {
    const allowed = new Set(studentStatusOptions.map((option) => option.value));

    return Object.fromEntries(
        students.map((student) => {
            if (attendanceStatuses[student.id] === 'tidak_masuk') {
                return [student.id, 'tidak_masuk'];
            }

            const status = student.collection_records?.[0]?.status;

            // HP yang sedang dipinjam tetap dihitung sudah disetor saat checklist pagi.
            if (status === 'sedang_dipinjam') {
                return [student.id, 'dikumpulkan'];
            }

            return [student.id, allowed.has(status) ? status : 'belum'];
        }),
    );
}

export {
    attendanceLegend,
    attendanceMaps,
    attendanceStatusOptions,
    buildInitialStatuses,
    depositStatusMeta,
    formatDate,
    formatDateTime,
    formatTime,
    statusTone,
    studentStatusLegend,
    studentStatusMeta,
    studentStatusOptions,
    verifyStatusLegend,
};
