<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function makeWalasWithClass(string $username = 'walas'): array
    {
        $teacher = User::factory()->create(['role' => 'wali_kelas']);
        $schoolClass = SchoolClass::create([
            'name' => 'Kelas 10 A',
            'grade' => '10',
            'group_name' => 'A',
            'homeroom_user_id' => $teacher->id,
        ]);

        return [$teacher, $schoolClass];
    }

    private function makeStudent(SchoolClass $schoolClass, string $nis = 'TEST001'): Student
    {
        $studentUser = User::factory()->create(['role' => 'siswa']);

        return Student::create([
            'user_id' => $studentUser->id,
            'class_id' => $schoolClass->id,
            'nis' => $nis,
        ]);
    }

    public function test_walas_can_reset_own_student_password(): void
    {
        [$teacher, $schoolClass] = $this->makeWalasWithClass();
        $student = $this->makeStudent($schoolClass);

        $response = $this->actingAs($teacher)
            ->post(route('students.reset-password', $student));

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertTrue(Hash::check('password', $student->user->fresh()->password));
    }

    public function test_walas_cannot_reset_student_from_another_class(): void
    {
        [$teacher] = $this->makeWalasWithClass();
        $otherTeacher = User::factory()->create(['role' => 'wali_kelas']);
        $otherClass = SchoolClass::create([
            'name' => 'Kelas 10 B',
            'grade' => '10',
            'group_name' => 'B',
            'homeroom_user_id' => $otherTeacher->id,
        ]);
        $student = $this->makeStudent($otherClass);

        $this->actingAs($teacher)
            ->post(route('students.reset-password', $student))
            ->assertForbidden();
    }

    public function test_siswa_cannot_reset_password(): void
    {
        [$teacher, $schoolClass] = $this->makeWalasWithClass();
        $student = $this->makeStudent($schoolClass);
        $studentUser = $student->user;

        $this->actingAs($studentUser)
            ->post(route('students.reset-password', $student))
            ->assertForbidden();

        $this->actingAs($studentUser)
            ->post(route('teachers.reset-password', $teacher))
            ->assertForbidden();
    }

    public function test_guests_cannot_reset_password(): void
    {
        $this->post(route('students.reset-password', 1))->assertRedirect('/login');
        $this->post(route('teachers.reset-password', 1))->assertRedirect('/login');
    }

    public function test_kesiswaan_can_reset_student_password(): void
    {
        $kesiswaan = User::factory()->create(['role' => 'kesiswaan']);
        [$teacher, $schoolClass] = $this->makeWalasWithClass();
        $student = $this->makeStudent($schoolClass);

        $response = $this->actingAs($kesiswaan)
            ->post(route('students.reset-password', $student));

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertTrue(Hash::check('password', $student->user->fresh()->password));
    }

    public function test_kesiswaan_can_reset_walas_password(): void
    {
        $kesiswaan = User::factory()->create(['role' => 'kesiswaan']);
        [$teacher] = $this->makeWalasWithClass();

        $teacher->update(['password' => 'rahasia-lama']);

        $response = $this->actingAs($kesiswaan)
            ->post(route('teachers.reset-password', $teacher));

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertTrue(Hash::check('password', $teacher->fresh()->password));
    }

    public function test_walas_cannot_use_teacher_reset_route(): void
    {
        [$teacher] = $this->makeWalasWithClass();
        $otherTeacher = User::factory()->create(['role' => 'wali_kelas']);

        $this->actingAs($teacher)
            ->post(route('teachers.reset-password', $otherTeacher))
            ->assertForbidden();
    }

    public function test_teacher_reset_rejects_non_walas_user(): void
    {
        $kesiswaan = User::factory()->create(['role' => 'kesiswaan']);
        [$teacher, $schoolClass] = $this->makeWalasWithClass();
        $student = $this->makeStudent($schoolClass);

        $this->actingAs($kesiswaan)
            ->post(route('teachers.reset-password', $student->user))
            ->assertNotFound();

        $this->actingAs($kesiswaan)
            ->post(route('teachers.reset-password', $kesiswaan))
            ->assertNotFound();
    }
}
