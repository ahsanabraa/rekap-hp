<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceReportController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $student = $request->user()->student()->with('schoolClass')->first();

        abort_unless($student && $student->is_class_secretary, 403, 'Hanya sekretaris kelas yang dapat mengisi absensi.');
        abort_unless($student->schoolClass, 422, 'Kamu belum terdaftar di kelas.');

        $schoolClass = $student->schoolClass;

        $this->ensureAttendanceIsOpen($schoolClass);

        $report = $this->todayReport($schoolClass->id);

        if ($report?->isVerified()) {
            throw ValidationException::withMessages([
                'entries' => 'Absensi hari ini sudah diverifikasi wali kelas sehingga tidak bisa diubah.',
            ]);
        }

        $this->saveReport($request, $schoolClass, $report, verified: false);

        return back()->with('success', 'Absensi berhasil dikirim. Menunggu verifikasi wali kelas.');
    }

    public function storeManual(Request $request): RedirectResponse
    {
        $schoolClass = $request->user()->homeroomClass()->first();

        abort_unless($schoolClass, 422, 'Kamu belum memiliki kelas.');

        $this->ensureAttendanceIsOpen($schoolClass);

        $report = $this->todayReport($schoolClass->id);

        $this->saveReport($request, $schoolClass, $report, verified: true);

        return back()->with('success', 'Absensi hari ini disimpan dan langsung terverifikasi.');
    }

    public function verify(Request $request, AttendanceReport $attendanceReport): RedirectResponse
    {
        $schoolClass = $attendanceReport->schoolClass;

        abort_unless(
            $schoolClass && (int) $schoolClass->homeroom_user_id === (int) $request->user()->id,
            403,
            'Kamu bukan wali kelas untuk kelas ini.',
        );

        $this->ensureAttendanceIsOpen($schoolClass);

        $this->saveReport($request, $schoolClass, $attendanceReport, verified: true);

        return back()->with('success', 'Absensi kelas '.$schoolClass->name.' berhasil diverifikasi.');
    }

    private function saveReport(
        Request $request,
        SchoolClass $schoolClass,
        ?AttendanceReport $report,
        bool $verified,
    ): void {
        $studentIds = $schoolClass->students()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.student_id' => ['required', 'integer'],
            'entries.*.status' => ['required', 'in:masuk,tidak_masuk'],
            'entries.*.notes' => ['nullable', 'string', 'max:500'],
            'verification_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $entries = collect($validated['entries']);
        $providedIds = $entries->pluck('student_id')->map(fn ($id) => (int) $id);
        $expectedIds = collect($studentIds)->sort()->values();
        $actualIds = $providedIds->sort()->values();

        if ($providedIds->duplicates()->isNotEmpty() || $actualIds->all() !== $expectedIds->all()) {
            throw ValidationException::withMessages([
                'entries' => 'Daftar siswa pada absensi tidak sesuai dengan data kelas. Muat ulang halaman lalu coba lagi.',
            ]);
        }

        $absentCount = $entries->where('status', AttendanceRecord::STATUS_ABSENT)->count();

        DB::transaction(function () use (
            $request,
            $schoolClass,
            $report,
            $entries,
            $studentIds,
            $absentCount,
            $verified,
            $validated,
        ): void {
            $report ??= new AttendanceReport([
                'class_id' => $schoolClass->id,
                'report_date' => today()->toDateString(),
            ]);

            $isVerified = $verified || ($report->exists && $report->isVerified());

            $report->fill([
                'students_count' => count($studentIds),
                'absent_count' => $absentCount,
                'verified_absent_count' => $isVerified ? $absentCount : null,
                'status' => $isVerified ? AttendanceReport::STATUS_VERIFIED : AttendanceReport::STATUS_PENDING,
                'verification_notes' => $validated['verification_notes'] ?? null,
            ]);

            if (! $report->reported_by) {
                $report->reported_by = $request->user()->id;
                $report->reported_at = now();
            }

            if ($isVerified) {
                $report->verified_by = $request->user()->id;
                $report->verified_at = now();
            } else {
                $report->verified_by = null;
                $report->verified_at = null;
            }

            $report->save();

            AttendanceRecord::query()
                ->where('attendance_report_id', $report->id)
                ->delete();

            foreach ($entries as $entry) {
                AttendanceRecord::create([
                    'attendance_report_id' => $report->id,
                    'student_id' => (int) $entry['student_id'],
                    'status' => $entry['status'],
                    'notes' => $entry['notes'] ?? null,
                ]);
            }
        });
    }

    private function todayReport(int $classId): ?AttendanceReport
    {
        return AttendanceReport::query()
            ->where('class_id', $classId)
            ->whereDate('report_date', today())
            ->first();
    }

    private function ensureAttendanceIsOpen(SchoolClass $schoolClass): void
    {
        $locked = ClassDeposit::query()
            ->where('class_id', $schoolClass->id)
            ->whereDate('deposit_date', today())
            ->whereNotNull('released_at')
            ->exists();

        if ($locked) {
            throw ValidationException::withMessages([
                'entries' => 'Box kelas hari ini sudah diambil sehingga absensi tidak bisa diubah.',
            ]);
        }
    }
}
