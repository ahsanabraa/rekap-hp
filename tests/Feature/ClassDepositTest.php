<?php

namespace Tests\Feature;

use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClassDepositTest extends TestCase
{
    use RefreshDatabase;

    public function test_class_leader_can_submit_daily_checklist(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        $response = $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[1]->id, 'status' => 'tidak_mengumpulkan'],
                ['student_id' => $students[2]->id, 'status' => 'tidak_masuk'],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $deposit = ClassDeposit::where('class_id', $schoolClass->id)->firstOrFail();

        $this->assertSame('menunggu_verifikasi', $deposit->status);
        $this->assertSame(3, $deposit->students_count);
        $this->assertSame(1, $deposit->reported_count);
        $this->assertSame($leaderUser->id, $deposit->reported_by);

        $this->assertDatabaseCount('collection_records', 3);
        $this->assertDatabaseHas('collection_records', [
            'class_deposit_id' => $deposit->id,
            'student_id' => $students[0]->id,
            'status' => 'dikumpulkan',
        ]);
        $this->assertDatabaseHas('collection_records', [
            'class_deposit_id' => $deposit->id,
            'student_id' => $students[1]->id,
            'status' => 'tidak_mengumpulkan',
        ]);
        $this->assertDatabaseHas('collection_records', [
            'class_deposit_id' => $deposit->id,
            'student_id' => $students[2]->id,
            'status' => 'tidak_masuk',
        ]);
    }

    public function test_non_class_leader_cannot_submit_checklist(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        $response = $this->actingAs($students[1]->user)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('class_deposits', 0);
    }

    public function test_checklist_must_include_every_student_in_the_class(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        $response = $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[1]->id, 'status' => 'dikumpulkan'],
            ],
        ]);

        $response->assertSessionHasErrors('entries');
        $this->assertDatabaseCount('class_deposits', 0);
    }

    public function test_checklist_is_locked_after_kesiswaan_verification(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($kesiswaan)->patch(route('class-deposits.verify', $deposit), [
            'verified_count' => 3,
        ])->assertRedirect();

        $response = $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'tidak_mengumpulkan',
            ])->all(),
        ]);

        $response->assertSessionHasErrors('entries');
        $this->assertSame(3, $deposit->fresh()->reported_count);
    }

    public function test_kesiswaan_can_verify_discrepancy_and_release_box(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => [
                ['student_id' => $students[0]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[1]->id, 'status' => 'dikumpulkan'],
                ['student_id' => $students[2]->id, 'status' => 'tidak_mengumpulkan'],
            ],
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($kesiswaan)->patch(route('class-deposits.verify', $deposit), [
            'verified_count' => 1,
            'verification_notes' => '1 HP tidak ditemukan saat hitung fisik.',
        ])->assertRedirect();

        $deposit->refresh();
        $this->assertSame(ClassDeposit::STATUS_DISCREPANCY, $deposit->status);
        $this->assertSame(-1, $deposit->discrepancy);
        $this->assertSame($kesiswaan->id, $deposit->verified_by);

        $this->actingAs($kesiswaan)
            ->patch(route('class-deposits.release', $deposit))
            ->assertRedirect();

        $deposit->refresh();
        $this->assertSame(ClassDeposit::STATUS_RELEASED, $deposit->status);
        $this->assertNotNull($deposit->released_at);
    }

    public function test_kesiswaan_can_correct_verification_before_release(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($kesiswaan)->patch(route('class-deposits.verify', $deposit), [
            'verified_count' => 3,
        ])->assertRedirect();

        $this->assertSame(ClassDeposit::STATUS_VERIFIED, $deposit->fresh()->status);

        $this->actingAs($kesiswaan)->patch(route('class-deposits.verify', $deposit), [
            'verified_count' => 2,
            'verification_notes' => 'Koreksi setelah hitung ulang.',
        ])->assertRedirect();

        $deposit->refresh();
        $this->assertSame(ClassDeposit::STATUS_DISCREPANCY, $deposit->status);
        $this->assertSame(-1, $deposit->discrepancy);
        $this->assertSame('Koreksi setelah hitung ulang.', $deposit->verification_notes);
    }

    public function test_box_cannot_be_released_before_verification(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($kesiswaan)
            ->patch(route('class-deposits.release', $deposit))
            ->assertSessionHasErrors('verified_count');

        $this->assertNull($deposit->fresh()->released_at);
        $this->assertSame(ClassDeposit::STATUS_PENDING, $deposit->fresh()->status);
    }

    public function test_verification_is_locked_after_release(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($kesiswaan)->patch(route('class-deposits.verify', $deposit), [
            'verified_count' => 3,
        ]);

        $this->actingAs($kesiswaan)->patch(route('class-deposits.release', $deposit));

        $this->actingAs($kesiswaan)
            ->patch(route('class-deposits.verify', $deposit), ['verified_count' => 1])
            ->assertSessionHasErrors('verified_count');

        $deposit->refresh();
        $this->assertSame(3, $deposit->verified_count);
        $this->assertSame(ClassDeposit::STATUS_RELEASED, $deposit->status);
    }

    public function test_submission_replaces_legacy_collection_records(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        CollectionRecord::create([
            'student_id' => $students[0]->id,
            'collection_date' => today()->toDateString(),
            'status' => 'dikumpulkan',
        ]);

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ])->assertSessionHasNoErrors();

        $deposit = ClassDeposit::firstOrFail();

        $this->assertDatabaseMissing('collection_records', [
            'student_id' => $students[0]->id,
            'class_deposit_id' => null,
        ]);
        $this->assertDatabaseCount('collection_records', 3);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[0]->id,
            'class_deposit_id' => $deposit->id,
        ]);
    }

    public function test_setting_class_leader_removes_previous_leader_in_same_class(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->assertTrue($students[0]->is_class_leader);

        $this->actingAs($kesiswaan)->post(route('students.class-leader', $students[1]), [
            'is_class_leader' => true,
        ])->assertRedirect();

        $this->assertFalse($students[0]->fresh()->is_class_leader);
        $this->assertTrue($students[1]->fresh()->is_class_leader);
    }

    public function test_wali_kelas_cannot_verify_or_release_a_deposit(): void
    {
        [$schoolClass, $students, $teacher, $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($leaderUser)->post(route('class-deposits.store'), [
            'entries' => collect($students)->map(fn (Student $student) => [
                'student_id' => $student->id,
                'status' => 'dikumpulkan',
            ])->all(),
        ]);

        $deposit = ClassDeposit::firstOrFail();

        $this->actingAs($teacher)
            ->patch(route('class-deposits.verify', $deposit), ['verified_count' => 3])
            ->assertForbidden();

        $this->actingAs($teacher)
            ->patch(route('class-deposits.release', $deposit))
            ->assertForbidden();

        $this->assertNull($deposit->fresh()->verified_at);
    }

    public function test_class_is_flagged_after_three_shortages_within_thirty_days(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();
        $kesiswaan = $this->makeKesiswaan();

        foreach ([0, 1, 2] as $daysAgo) {
            $deposit = ClassDeposit::create([
                'class_id' => $schoolClass->id,
                'deposit_date' => today()->subDays($daysAgo)->toDateString(),
                'students_count' => 3,
                'reported_count' => 3,
                'verified_count' => 2,
                'discrepancy' => -1,
                'status' => ClassDeposit::STATUS_DISCREPANCY,
                'reported_by' => $leaderUser->id,
                'reported_at' => now(),
                'verified_by' => $kesiswaan->id,
                'verified_at' => now(),
            ]);
        }

        $this->actingAs($kesiswaan)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'kesiswaan')
                ->where('classes.0.shortages_last_30_days', 3)
                ->where('classes.0.needs_attention', true)
                ->where('summary.flagged_classes', 1)
            );
    }

    public function test_class_leader_dashboard_contains_checklist_students(): void
    {
        [$schoolClass, $students, , $leaderUser] = $this->makeClass();

        $this->actingAs($leaderUser)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'ketua_kelas')
                ->where('schoolClass.id', $schoolClass->id)
                ->has('schoolClass.students', 3)
            );
    }

    /**
     * @return array{0: SchoolClass, 1: array<int, Student>, 2: User, 3: User}
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
            ]);

            if ($index === 0) {
                $leaderUser = $user;
            }
        }

        return [$schoolClass, $students, $teacher, $leaderUser];
    }

    private function makeKesiswaan(): User
    {
        return User::factory()->create([
            'role' => 'kesiswaan',
            'email_verified_at' => now(),
        ]);
    }
}
