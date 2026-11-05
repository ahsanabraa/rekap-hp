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

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_student_sees_personal_history_and_active_loan(): void
    {
        $teacher = User::factory()->create(['role' => 'wali_kelas']);
        $schoolClass = SchoolClass::create([
            'grade' => '10',
            'jurusan' => 'RPL',
            'rombel' => 1,
            'homeroom_user_id' => $teacher->id,
        ]);

        $user = User::factory()->create(['role' => 'siswa']);
        $student = Student::create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
            'nis' => 'TEST001',
        ]);

        $deposit = ClassDeposit::create([
            'class_id' => $schoolClass->id,
            'deposit_date' => today()->toDateString(),
            'students_count' => 1,
            'reported_count' => 1,
            'reported_by' => $teacher->id,
            'reported_at' => now(),
        ]);

        $loan = PhoneLoan::create([
            'class_id' => $schoolClass->id,
            'student_id' => $student->id,
            'usage_description' => 'Presentasi kelompok',
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addHour(),
            'teacher_name' => 'Bu Ani',
            'recorded_by' => $teacher->id,
        ]);

        CollectionRecord::create([
            'student_id' => $student->id,
            'class_deposit_id' => $deposit->id,
            'phone_loan_id' => $loan->id,
            'collection_date' => today()->toDateString(),
            'status' => 'sedang_dipinjam',
            'recorded_by' => $teacher->id,
        ]);

        $this->actingAs($user)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'siswa')
                ->where('activeLoan.id', $loan->id)
                ->where('history.0.status', 'sedang_dipinjam')
                ->where('historySummary.deposit_days', 1)
                ->where('historySummary.sedang_dipinjam', 1)
            );
    }
}
