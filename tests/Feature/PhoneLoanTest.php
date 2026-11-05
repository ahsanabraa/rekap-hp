<?php

namespace Tests\Feature;

use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\PhoneLoan;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PhoneLoanTest extends TestCase
{
    use RefreshDatabase;

    public function test_kesiswaan_can_view_the_loan_page(): void
    {
        $this->makeClass(3);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->get(route('loans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Loans/Index')
                ->has('classes', 1)
                ->has('activeLoans', 0)
                ->has('historyLoans', 0)
            );
    }

    public function test_kesiswaan_can_mark_single_student_phone_as_borrowed(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $loan = PhoneLoan::firstOrFail();

        $this->assertNull($loan->returned_at);
        $this->assertSame($students[0]->id, $loan->student_id);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[0]->id,
            'status' => 'sedang_dipinjam',
            'phone_loan_id' => $loan->id,
        ]);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[1]->id,
            'status' => 'dikumpulkan',
            'phone_loan_id' => null,
        ]);
    }

    public function test_class_loan_only_marks_phones_that_were_collected(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'tidak_mengumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->post(route('loans.store'), $this->payload($schoolClass, null, ['target' => 'class']))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $loan = PhoneLoan::firstOrFail();

        $this->assertNull($loan->student_id);
        $this->assertSame(2, CollectionRecord::where('status', 'sedang_dipinjam')->count());
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[2]->id,
            'status' => 'tidak_mengumpulkan',
            'phone_loan_id' => null,
        ]);
    }

    public function test_loan_requires_a_collected_phone(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['tidak_mengumpulkan', 'tidak_mengumpulkan', 'tidak_mengumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id))
            ->assertSessionHasErrors('usage_description');

        $this->assertDatabaseCount('phone_loans', 0);
    }

    public function test_loan_rejects_invalid_time_and_missing_teacher(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id, [
                'start_time' => '09:00',
                'end_time' => '07:00',
                'teacher_name' => '',
            ]))
            ->assertSessionHasErrors(['end_time', 'teacher_name']);

        $this->assertDatabaseCount('phone_loans', 0);
    }

    public function test_student_must_belong_to_the_chosen_class(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        [, $otherStudents] = $this->makeClass(1, '2');
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)
            ->post(route('loans.store'), $this->payload($schoolClass, $otherStudents[0]->id))
            ->assertSessionHasErrors('student_id');

        $this->assertDatabaseCount('phone_loans', 0);
    }

    public function test_only_kesiswaan_can_mark_or_return_a_loan(): void
    {
        [$schoolClass, $students, $teacher] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($teacher)
            ->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id))
            ->assertForbidden();

        $this->actingAs($kesiswaan)->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id));
        $loan = PhoneLoan::firstOrFail();

        $this->actingAs($teacher)
            ->patch(route('loans.return', $loan))
            ->assertForbidden();

        $this->assertNull($loan->fresh()->returned_at);
    }

    public function test_returning_a_loan_restores_the_collection_status(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id));
        $loan = PhoneLoan::firstOrFail();

        $this->actingAs($kesiswaan)
            ->patch(route('loans.return', $loan))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertNotNull($loan->fresh()->returned_at);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[0]->id,
            'status' => 'dikumpulkan',
        ]);
        $this->assertDatabaseMissing('collection_records', [
            'student_id' => $students[0]->id,
            'status' => 'sedang_dipinjam',
        ]);
    }

    public function test_resubmitting_the_checklist_keeps_active_loans(): void
    {
        [$schoolClass, $students] = $this->makeClass();
        $students[0]->update(['is_class_leader' => true]);
        $this->depositFor($schoolClass, $students, ['dikumpulkan', 'dikumpulkan', 'dikumpulkan']);
        $kesiswaan = $this->makeKesiswaan();

        $this->actingAs($kesiswaan)->post(route('loans.store'), $this->payload($schoolClass, $students[0]->id));
        $loan = PhoneLoan::firstOrFail();

        $this->actingAs($students[0]->user)
            ->post(route('class-deposits.store'), [
                'entries' => collect($students)->map(fn (Student $student) => [
                    'student_id' => $student->id,
                    'status' => 'dikumpulkan',
                ])->all(),
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('collection_records', [
            'student_id' => $students[0]->id,
            'status' => 'sedang_dipinjam',
            'phone_loan_id' => $loan->id,
        ]);
    }

    /**
     * @return array{0: SchoolClass, 1: array<int, Student>, 2: User}
     */
    private function makeClass(int $studentCount = 3, string $rombel = '1'): array
    {
        $teacher = User::factory()->create(['role' => 'wali_kelas']);

        $schoolClass = SchoolClass::create([
            'grade' => '10',
            'jurusan' => 'RPL',
            'rombel' => (int) $rombel,
            'homeroom_user_id' => $teacher->id,
        ]);

        $students = [];

        for ($index = 0; $index < $studentCount; $index++) {
            $user = User::factory()->create(['role' => 'siswa']);

            $students[] = Student::create([
                'user_id' => $user->id,
                'class_id' => $schoolClass->id,
                'nis' => 'TEST'.$rombel.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
            ]);
        }

        return [$schoolClass, $students, $teacher];
    }

    private function depositFor(SchoolClass $schoolClass, array $students, array $statuses): ClassDeposit
    {
        $deposit = ClassDeposit::create([
            'class_id' => $schoolClass->id,
            'deposit_date' => today()->toDateString(),
            'students_count' => count($students),
            'reported_count' => count(array_filter($statuses, fn ($status) => $status === 'dikumpulkan')),
            'status' => ClassDeposit::STATUS_PENDING,
        ]);

        foreach ($students as $index => $student) {
            CollectionRecord::create([
                'class_deposit_id' => $deposit->id,
                'student_id' => $student->id,
                'collection_date' => today()->toDateString(),
                'status' => $statuses[$index],
            ]);
        }

        return $deposit;
    }

    private function payload(SchoolClass $schoolClass, ?int $studentId, array $overrides = []): array
    {
        return array_merge([
            'target' => 'student',
            'class_id' => $schoolClass->id,
            'student_id' => $studentId,
            'usage_description' => 'Praktik mapel Informatika',
            'usage_date' => today()->toDateString(),
            'start_time' => '07:00',
            'end_time' => '09:00',
            'teacher_name' => 'Pak Guru',
        ], $overrides);
    }

    private function makeKesiswaan(): User
    {
        return User::factory()->create(['role' => 'kesiswaan']);
    }
}
