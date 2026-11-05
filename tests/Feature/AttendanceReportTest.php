<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AttendanceReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_class_secretary_can_submit_daily_attendance(): void
    {
        [$schoolClass, $students, , , $secretaryUser] = $this->makeClass();

        $response = $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students, [$students[1]->id]),
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $report = AttendanceReport::where('class_id', $schoolClass->id)->firstOrFail();

        $this->assertSame(AttendanceReport::STATUS_PENDING, $report->status);
        $this->assertSame(3, $report->students_count);
        $this->assertSame(1, $report->absent_count);
        $this->assertNull($report->verified_absent_count);
        $this->assertSame($secretaryUser->id, $report->reported_by);

        $this->assertDatabaseCount('attendance_records', 3);
        $this->assertDatabaseHas('attendance_records', [
            'attendance_report_id' => $report->id,
            'student_id' => $students[1]->id,
            'status' => AttendanceRecord::STATUS_ABSENT,
        ]);
    }

    public function test_non_secretary_cannot_submit_attendance(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        $this->actingAs($leaderUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ])->assertForbidden();

        $this->actingAs($students[2]->user)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ])->assertForbidden();

        $this->assertDatabaseCount('attendance_reports', 0);
    }

    public function test_attendance_must_include_every_student_in_the_class(): void
    {
        [$schoolClass, $students, , , $secretaryUser] = $this->makeClass();

        $response = $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'masuk'],
                ['student_id' => $students[1]->id, 'status' => 'masuk'],
            ],
        ]);

        $response->assertSessionHasErrors('entries');
        $this->assertDatabaseCount('attendance_reports', 0);
    }

    public function test_attendance_is_locked_after_wali_kelas_verification(): void
    {
        [$schoolClass, $students, $teacher, , $secretaryUser] = $this->makeClass();

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students, [$students[1]->id]),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($teacher)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students, [$students[1]->id]),
        ])->assertRedirect();

        $response = $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ]);

        $response->assertSessionHasErrors('entries');
        $this->assertSame(1, $report->fresh()->absent_count);
    }

    public function test_wali_kelas_can_correct_and_verify_attendance(): void
    {
        [$schoolClass, $students, $teacher, , $secretaryUser] = $this->makeClass();

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students, [$students[1]->id]),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($teacher)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students, [$students[2]->id]),
            'verification_notes' => 'Koreksi: siswa 2 ternyata masuk, siswa 3 sakit.',
        ])->assertRedirect();

        $report->refresh();

        $this->assertSame(AttendanceReport::STATUS_VERIFIED, $report->status);
        $this->assertSame(1, $report->absent_count);
        $this->assertSame(1, $report->verified_absent_count);
        $this->assertSame($teacher->id, $report->verified_by);
        $this->assertNotNull($report->verified_at);
        $this->assertSame('Koreksi: siswa 2 ternyata masuk, siswa 3 sakit.', $report->verification_notes);

        $this->assertDatabaseHas('attendance_records', [
            'attendance_report_id' => $report->id,
            'student_id' => $students[1]->id,
            'status' => AttendanceRecord::STATUS_PRESENT,
        ]);
        $this->assertDatabaseHas('attendance_records', [
            'attendance_report_id' => $report->id,
            'student_id' => $students[2]->id,
            'status' => AttendanceRecord::STATUS_ABSENT,
        ]);
    }

    public function test_wali_kelas_can_input_attendance_manually(): void
    {
        [$schoolClass, $students, $teacher] = $this->makeClass();

        $this->actingAs($teacher)->post(route('attendance-reports.manual'), [
            'entries' => $this->entries($students, [$students[0]->id]),
            'verification_notes' => 'Sekretaris tidak masuk hari ini.',
        ])->assertRedirect();

        $report = AttendanceReport::firstOrFail();

        $this->assertSame(AttendanceReport::STATUS_VERIFIED, $report->status);
        $this->assertSame($teacher->id, $report->reported_by);
        $this->assertSame($teacher->id, $report->verified_by);
        $this->assertSame(1, $report->verified_absent_count);
    }

    public function test_wali_kelas_can_only_verify_their_own_class(): void
    {
        [$schoolClass, $students, , , $secretaryUser] = $this->makeClass();
        $otherTeacher = User::factory()->create([
            'role' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($otherTeacher)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students),
        ])->assertForbidden();

        $this->assertNull($report->fresh()->verified_at);
    }

    public function test_kesiswaan_cannot_verify_attendance(): void
    {
        [$schoolClass, $students, , , $secretaryUser] = $this->makeClass();
        $kesiswaan = User::factory()->create([
            'role' => 'kesiswaan',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($kesiswaan)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students),
        ])->assertForbidden();
    }

    public function test_attendance_is_locked_after_box_is_released(): void
    {
        [$schoolClass, $students, $teacher, , $secretaryUser] = $this->makeClass();

        ClassDeposit::create([
            'class_id' => $schoolClass->id,
            'deposit_date' => today()->toDateString(),
            'students_count' => 3,
            'reported_count' => 3,
            'verified_count' => 3,
            'discrepancy' => 0,
            'status' => ClassDeposit::STATUS_RELEASED,
            'released_at' => now(),
        ]);

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ])->assertSessionHasErrors('entries');

        $this->actingAs($teacher)->post(route('attendance-reports.manual'), [
            'entries' => $this->entries($students),
        ])->assertSessionHasErrors('entries');

        $this->assertDatabaseCount('attendance_reports', 0);
    }

    public function test_verified_absence_forces_checklist_status(): void
    {
        [$schoolClass, $students, $teacher, $leaderUser, $secretaryUser] = $this->makeClass();

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students, [$students[2]->id]),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($teacher)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students, [$students[2]->id]),
        ])->assertRedirect();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[1]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[2]->id, 'status' => 'dikumpulkan'],
            ],
        ])->assertSessionHasNoErrors();

        $this->assertSame(2, ClassDeposit::firstOrFail()->reported_count);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[2]->id,
            'status' => 'tidak_masuk',
        ]);
    }

    public function test_verified_presence_blocks_not_present_checklist_status(): void
    {
        [$schoolClass, $students, $teacher, $leaderUser, $secretaryUser] = $this->makeClass();

        $this->actingAs($secretaryUser)->post(route('attendance-reports.store'), [
            'entries' => $this->entries($students),
        ]);

        $report = AttendanceReport::firstOrFail();

        $this->actingAs($teacher)->patch(route('attendance-reports.verify', $report), [
            'entries' => $this->entries($students),
        ])->assertRedirect();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[1]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[2]->id, 'status' => 'tidak_masuk'],
            ],
        ])->assertSessionHasErrors('entries');

        $this->assertDatabaseCount('class_deposits', 0);
    }

    public function test_secretary_cannot_be_the_class_leader(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $response = $this->actingAs($kesiswaan)->post(route('students.class-secretary', $students[0]), [
            'is_class_secretary' => true,
        ]);

        $response->assertSessionHasErrors('is_class_secretary');
        $this->assertFalse($students[0]->fresh()->is_class_secretary);
    }

    public function test_setting_class_secretary_removes_previous_secretary(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->assertTrue($students[1]->is_class_secretary);

        $this->actingAs($kesiswaan)->post(route('students.class-secretary', $students[2]), [
            'is_class_secretary' => true,
        ])->assertRedirect();

        $this->assertFalse($students[1]->fresh()->is_class_secretary);
        $this->assertTrue($students[2]->fresh()->is_class_secretary);
    }

    public function test_secretary_dashboard_is_rendered(): void
    {
        [$schoolClass, $students, , , $secretaryUser] = $this->makeClass();

        $this->actingAs($secretaryUser)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'sekretaris')
                ->where('schoolClass.id', $schoolClass->id)
                ->has('schoolClass.students', 3)
            );
    }

    /**
     * @param  array<int, Student>  $students
     * @param  array<int, int>  $absentIds
     * @return array<int, array<string, int|string>>
     */
    private function entries(array $students, array $absentIds = []): array
    {
        return collect($students)->map(fn (Student $student) => [
            'student_id' => $student->id,
            'status' => in_array($student->id, $absentIds, true)
                ? AttendanceRecord::STATUS_ABSENT
                : AttendanceRecord::STATUS_PRESENT,
        ])->all();
    }

    /**
     * @return array{0: SchoolClass, 1: array<int, Student>, 2: User, 3: User, 4: User}
     */
    private function makeClass(int $studentCount = 3): array
    {
        $teacher = User::factory()->create([
            'role' => 'wali_kelas',
            'email_verified_at' => now(),
        ]);

        $schoolClass = SchoolClass::create([
            'name' => 'Kelas 10 A',
            'grade' => '10',
            'group_name' => 'A',
            'homeroom_user_id' => $teacher->id,
        ]);

        $students = [];
        $leaderUser = null;
        $secretaryUser = null;

        for ($index = 0; $index < $studentCount; $index++) {
            $user = User::factory()->create([
                'role' => 'siswa',
                'email_verified_at' => now(),
            ]);

            $students[] = Student::create([
                'user_id' => $user->id,
                'class_id' => $schoolClass->id,
                'nis' => 'TEST'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'is_class_leader' => $index === 0,
                'is_class_secretary' => $index === 1,
            ]);

            if ($index === 0) {
                $leaderUser = $user;
            }

            if ($index === 1) {
                $secretaryUser = $user;
            }
        }

        return [$schoolClass, $students, $teacher, $leaderUser, $secretaryUser];
    }

    private function makeKesiswaan(): User
    {
        return User::factory()->create([
            'role' => 'kesiswaan',
            'email_verified_at' => now(),
        ]);
    }
}
