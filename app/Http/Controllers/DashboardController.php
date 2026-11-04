<?php

namespace App\Http\Controllers;

use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'kesiswaan') {
            return $this->kesiswaanDashboard();
        }

        if ($user->role === 'wali_kelas') {
            return $this->waliKelasDashboard($user);
        }

        return $this->siswaDashboard($user);
    }

    private function kesiswaanDashboard(): Response
    {
        $classes = SchoolClass::query()
            ->with([
                'homeroom:id,name',
                'students:id,user_id,class_id,nis,is_class_leader,is_class_secretary',
                'students.user:id,name',
                'students.collectionRecords' => fn ($query) => $query
                    ->whereDate('collection_date', today())
                    ->whereNotNull('class_deposit_id')
                    ->latest('id'),
                'deposits' => fn ($query) => $query
                    ->whereDate('deposit_date', today())
                    ->with(['reportedBy:id,name', 'verifiedBy:id,name', 'releasedBy:id,name']),
                'attendanceReports' => fn ($query) => $query
                    ->whereDate('report_date', today())
                    ->with([
                        'records:id,attendance_report_id,student_id,status,notes',
                        'reportedBy:id,name',
                        'verifiedBy:id,name',
                    ]),
            ])
            ->withCount('students')
            ->ordered()
            ->get();

        $shortageCounts = $this->shortageCounts();

        $classes->each(function (SchoolClass $schoolClass) use ($shortageCounts): void {
            $deposit = $schoolClass->deposits->first();

            $this->attachDeposit(
                $schoolClass,
                $deposit,
                $shortageCounts[$schoolClass->id] ?? 0,
            );

            $this->attachAttendance(
                $schoolClass,
                $schoolClass->attendanceReports->first(),
                (bool) $deposit?->isReleased(),
            );
        });

        $deposits = $classes->pluck('deposit')->filter();
        $attendances = $classes->pluck('attendance')->filter();

        return Inertia::render('Dashboard', [
            'role' => 'kesiswaan',
            'date' => today()->toDateString(),
            'classes' => $classes,
            'summary' => [
                'total_classes' => $classes->count(),
                'submitted_classes' => $deposits->count(),
                'verified_classes' => $deposits->whereNotNull('verified_count')->count(),
                'shortage_classes' => $deposits->filter(fn (ClassDeposit $deposit) => $deposit->hasShortage())->count(),
                'flagged_classes' => $classes->where('needs_attention', true)->count(),
                'total_students' => (int) $classes->sum('students_count'),
                'reported_total' => (int) $deposits->sum('reported_count'),
                'verified_total' => (int) $deposits->sum(fn (ClassDeposit $deposit) => $deposit->verified_count ?? 0),
                'attendance_submitted_classes' => $attendances->count(),
                'attendance_verified_classes' => $attendances->filter(fn (AttendanceReport $report) => $report->isVerified())->count(),
                'absent_total' => (int) $attendances->sum(fn (AttendanceReport $report) => $report->absentTotal()),
            ],
            'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
            'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
        ]);
    }

    private function waliKelasDashboard($user): Response
    {
        $schoolClass = $user->homeroomClass()
            ->with([
                'students:id,user_id,class_id,nis,is_class_leader,is_class_secretary',
                'students.user:id,name',
                'students.collectionRecords' => fn ($query) => $query
                    ->whereDate('collection_date', today())
                    ->whereNotNull('class_deposit_id')
                    ->latest('id'),
                'deposits' => fn ($query) => $query
                    ->whereDate('deposit_date', today())
                    ->with(['reportedBy:id,name', 'verifiedBy:id,name', 'releasedBy:id,name']),
                'attendanceReports' => fn ($query) => $query
                    ->whereDate('report_date', today())
                    ->with([
                        'records:id,attendance_report_id,student_id,status,notes',
                        'reportedBy:id,name',
                        'verifiedBy:id,name',
                    ]),
            ])
            ->withCount('students')
            ->first();

        if ($schoolClass) {
            $this->attachDeposit(
                $schoolClass,
                $schoolClass->deposits->first(),
                $this->shortageCountFor($schoolClass->id),
            );

            $this->attachAttendance(
                $schoolClass,
                $schoolClass->attendanceReports->first(),
                (bool) $schoolClass->deposit?->isReleased(),
            );
        }

        return Inertia::render('Dashboard', [
            'role' => 'wali_kelas',
            'date' => today()->toDateString(),
            'schoolClass' => $schoolClass,
            'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
            'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
        ]);
    }

    private function siswaDashboard($user): Response
    {
        $student = $user->student()->with('schoolClass:id,name')->first();

        if (! $student) {
            return Inertia::render('Dashboard', [
                'role' => 'siswa',
                'date' => today()->toDateString(),
                'schoolClass' => null,
                'deposit' => null,
                'ownStatus' => null,
                'student' => null,
                'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
                'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
            ]);
        }

        $ownStatus = CollectionRecord::query()
            ->where('student_id', $student->id)
            ->whereDate('collection_date', today())
            ->whereNotNull('class_deposit_id')
            ->latest('id')
            ->value('status');

        $deposit = ClassDeposit::query()
            ->where('class_id', $student->class_id)
            ->whereDate('deposit_date', today())
            ->with(['reportedBy:id,name', 'verifiedBy:id,name', 'releasedBy:id,name'])
            ->first();

        $attendance = $this->todayAttendance($student->class_id);
        $attendanceLocked = $this->attendanceLocked($student->class_id);

        if ($student->is_class_leader) {
            $schoolClass = SchoolClass::query()
                ->with([
                    'homeroom:id,name',
                    'students:id,user_id,class_id,nis,is_class_leader,is_class_secretary',
                    'students.user:id,name',
                    'students.collectionRecords' => fn ($query) => $query
                        ->whereDate('collection_date', today())
                        ->whereNotNull('class_deposit_id')
                        ->latest('id'),
                ])
                ->withCount('students')
                ->find($student->class_id);

            $this->attachDeposit(
                $schoolClass,
                $deposit,
                $this->shortageCountFor($student->class_id),
            );

            return Inertia::render('Dashboard', [
                'role' => 'ketua_kelas',
                'date' => today()->toDateString(),
                'schoolClass' => $schoolClass,
                'attendance' => $attendance,
                'attendanceLocked' => $attendanceLocked,
                'ownStatus' => $ownStatus,
                'student' => $student->only(['id', 'nis', 'is_class_leader', 'is_class_secretary']),
                'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
                'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
            ]);
        }

        if ($student->is_class_secretary) {
            $schoolClass = SchoolClass::query()
                ->with([
                    'homeroom:id,name',
                    'students:id,user_id,class_id,nis,is_class_leader,is_class_secretary',
                    'students.user:id,name',
                ])
                ->withCount('students')
                ->find($student->class_id);

            return Inertia::render('Dashboard', [
                'role' => 'sekretaris',
                'date' => today()->toDateString(),
                'schoolClass' => $schoolClass,
                'attendance' => $attendance,
                'attendanceLocked' => $attendanceLocked,
                'student' => $student->only(['id', 'nis', 'is_class_leader', 'is_class_secretary']),
                'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
                'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
            ]);
        }

        return Inertia::render('Dashboard', [
            'role' => 'siswa',
            'date' => today()->toDateString(),
            'schoolClass' => $student->schoolClass?->only(['id', 'name']),
            'deposit' => $deposit,
            'attendance' => $attendance,
            'ownStatus' => $ownStatus,
            'student' => $student->only(['id', 'nis', 'is_class_leader', 'is_class_secretary']),
            'flagThreshold' => ClassDeposit::ATTENTION_THRESHOLD,
            'flagWindowDays' => ClassDeposit::ATTENTION_WINDOW_DAYS,
        ]);
    }

    private function attachDeposit(SchoolClass $schoolClass, ?ClassDeposit $deposit, int $shortages): void
    {
        $schoolClass->setAttribute('deposit', $deposit);
        $schoolClass->setAttribute('shortages_last_30_days', $shortages);
        $schoolClass->setAttribute('needs_attention', $shortages >= ClassDeposit::ATTENTION_THRESHOLD);
        $schoolClass->unsetRelation('deposits');
    }

    private function attachAttendance(SchoolClass $schoolClass, ?AttendanceReport $attendance, bool $locked): void
    {
        $schoolClass->setAttribute('attendance', $attendance);
        $schoolClass->setAttribute('attendance_locked', $locked);
        $schoolClass->unsetRelation('attendanceReports');
    }

    private function todayAttendance(int $classId): ?AttendanceReport
    {
        return AttendanceReport::query()
            ->where('class_id', $classId)
            ->whereDate('report_date', today())
            ->with([
                'records:id,attendance_report_id,student_id,status,notes',
                'reportedBy:id,name',
                'verifiedBy:id,name',
            ])
            ->first();
    }

    private function attendanceLocked(int $classId): bool
    {
        return ClassDeposit::query()
            ->where('class_id', $classId)
            ->whereDate('deposit_date', today())
            ->whereNotNull('released_at')
            ->exists();
    }

    /**
     * @return array<int, int>
     */
    private function shortageCounts(): array
    {
        return ClassDeposit::query()
            ->where('deposit_date', '>=', $this->attentionWindowStart())
            ->whereNotNull('verified_count')
            ->whereColumn('verified_count', '<', 'reported_count')
            ->selectRaw('class_id, COUNT(*) as aggregate')
            ->groupBy('class_id')
            ->pluck('aggregate', 'class_id')
            ->map(fn ($count) => (int) $count)
            ->all();
    }

    private function shortageCountFor(int $classId): int
    {
        return ClassDeposit::query()
            ->where('class_id', $classId)
            ->where('deposit_date', '>=', $this->attentionWindowStart())
            ->whereNotNull('verified_count')
            ->whereColumn('verified_count', '<', 'reported_count')
            ->count();
    }

    private function attentionWindowStart(): string
    {
        return today()
            ->subDays(ClassDeposit::ATTENTION_WINDOW_DAYS - 1)
            ->toDateString();
    }
}
