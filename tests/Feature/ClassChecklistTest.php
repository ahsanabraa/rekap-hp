<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassChecklistTest extends TestCase
{
    use RefreshDatabase;

    public function test_wakil_ketua_can_submit_the_phone_checklist(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $students[0]->update(['is_class_leader' => true]);
        $students[1]->update(['is_class_vice_leader' => true]);

        $this->actingAs($students[1]->user)
            ->post(route('class-deposits.store'), ['entries' => $this->entries($students)])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(1, ClassDeposit::count());
    }

    public function test_secretary_can_take_over_when_leader_and_vice_are_absent(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $students[0]->update(['is_class_leader' => true]);
        $students[1]->update(['is_class_vice_leader' => true]);
        $students[2]->update(['is_class_secretary' => true]);
        $this->attendanceFor($schoolClass, [
            $students[0]->id => AttendanceRecord::STATUS_ABSENT,
            $students[1]->id => AttendanceRecord::STATUS_ABSENT,
            $students[2]->id => AttendanceRecord::STATUS_PRESENT,
        ]);

        $this->actingAs($students[2]->user)
            ->post(route('class-deposits.store'), ['entries' => $this->entries($students)])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(1, ClassDeposit::count());
    }

    public function test_secretary_cannot_submit_when_a_leader_is_present(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $students[0]->update(['is_class_leader' => true]);
        $students[2]->update(['is_class_secretary' => true]);
        $this->attendanceFor($schoolClass, [
            $students[0]->id => AttendanceRecord::STATUS_PRESENT,
            $students[2]->id => AttendanceRecord::STATUS_PRESENT,
        ]);

        $this->actingAs($students[2]->user)
            ->post(route('class-deposits.store'), ['entries' => $this->entries($students)])
            ->assertForbidden();

        $this->assertSame(0, ClassDeposit::count());
    }

    public function test_absent_students_are_marked_automatically_from_attendance(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $students[0]->update(['is_class_leader' => true]);
        $this->attendanceFor($schoolClass, [
            $students[0]->id => AttendanceRecord::STATUS_PRESENT,
            $students[1]->id => AttendanceRecord::STATUS_ABSENT,
            $students[2]->id => AttendanceRecord::STATUS_PRESENT,
        ]);

        $this->actingAs($students[0]->user)
            ->post(route('class-deposits.store'), ['entries' => $this->entries($students)])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[1]->id,
            'status' => 'tidak_masuk',
        ]);
        $this->assertSame(2, CollectionRecord::where('status', 'dikumpulkan')->count());
    }

    public function test_kesiswaan_can_set_and_revoke_a_vice_leader(): void
    {
        [, $students] = $this->makeClass();
        $kesiswaan = User::factory()->create(['role' => 'kesiswaan']);

        $this->actingAs($kesiswaan)
            ->post(route('students.class-vice-leader', $students[1]), ['is_class_vice_leader' => true])
            ->assertSessionHasNoErrors();

        $this->assertTrue($students[1]->fresh()->is_class_vice_leader);

        $this->actingAs($kesiswaan)
            ->post(route('students.class-vice-leader', $students[1]), ['is_class_vice_leader' => false])
            ->assertSessionHasNoErrors();

        $this->assertFalse($students[1]->fresh()->is_class_vice_leader);
    }

    public function test_a_student_cannot_hold_two_class_roles(): void
    {
        [, $students] = $this->makeClass();
        $kesiswaan = User::factory()->create(['role' => 'kesiswaan']);
        $students[0]->update(['is_class_leader' => true]);

        $this->actingAs($kesiswaan)
            ->post(route('students.class-vice-leader', $students[0]), ['is_class_vice_leader' => true])
            ->assertSessionHasErrors('is_class_vice_leader');

        $this->actingAs($kesiswaan)
            ->post(route('students.class-vice-leader', $students[1]), ['is_class_vice_leader' => true])
            ->assertSessionHasNoErrors();

        $this->actingAs($kesiswaan)
            ->post(route('students.class-secretary', $students[1]), ['is_class_secretary' => true])
            ->assertSessionHasErrors('is_class_secretary');
    }

    /**
     * @return array{0: SchoolClass, 1: array<int, Student>}
     */
    private function makeClass(int $studentCount = 3): array
    {
        $teacher = User::factory()->create(['role' => 'wali_kelas']);

        $schoolClass = SchoolClass::create([
            'grade' => '10',
            'jurusan' => 'RPL',
            'rombel' => 1,
            'homeroom_user_id' => $teacher->id,
        ]);

        $students = [];

        for ($index = 0; $index < $studentCount; $index++) {
            $user = User::factory()->create(['role' => 'siswa']);

            $students[] = Student::create([
                'user_id' => $user->id,
                'class_id' => $schoolClass->id,
                'nis' => 'TEST'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
            ]);
        }

        return [$schoolClass, $students];
    }

    private function entries(array $students): array
    {
        return collect($students)
            ->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])
            ->all();
    }

    private function attendanceFor(SchoolClass $schoolClass, array $statuses): AttendanceReport
    {
        $report = AttendanceReport::create([
            'class_id' => $schoolClass->id,
            'report_date' => today()->toDateString(),
            'students_count' => count($statuses),
            'absent_count' => count(array_filter($statuses, fn ($status) => $status === AttendanceRecord::STATUS_ABSENT)),
            'status' => AttendanceReport::STATUS_PENDING,
        ]);

        foreach ($statuses as $studentId => $status) {
            AttendanceRecord::create([
                'attendance_report_id' => $report->id,
                'student_id' => $studentId,
                'status' => $status,
            ]);
        }

        return $report;
    }
}
