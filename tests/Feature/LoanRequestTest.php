<?php

namespace Tests\Feature;

use App\Models\CollectionRecord;
use App\Models\LoanRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_loan_request_marks_student_as_borrowing(): void
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
        $studentUser = User::factory()->create([
            'role' => 'siswa',
            'email_verified_at' => now(),
        ]);
        $student = Student::create([
            'user_id' => $studentUser->id,
            'class_id' => $schoolClass->id,
            'nis' => 'TEST001',
        ]);
        $loanRequest = LoanRequest::create([
            'student_id' => $student->id,
            'reason' => 'Keperluan keluarga',
            'starts_at' => today()->setTime(10, 0),
            'ends_at' => today()->setTime(11, 0),
        ]);

        $response = $this->actingAs($teacher)->patch(route('loan-requests.review', $loanRequest), [
            'status' => 'acc',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('loan_requests', [
            'id' => $loanRequest->id,
            'status' => 'acc',
        ]);
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $student->id,
            'collection_date' => today(),
            'status' => 'sedang_dipinjam',
        ]);

        $response = $this->actingAs($teacher)->patch(route('loan-requests.return', $loanRequest));

        $response->assertRedirect();
        $this->assertDatabaseHas('collection_records', [
            'student_id' => $student->id,
            'collection_date' => today(),
            'status' => 'dikumpulkan',
        ]);
        $this->assertNotNull(
            CollectionRecord::where('student_id', $student->id)->first()->returned_at,
        );

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('loanRequests.0.is_late', true)
                ->where('loanRequests.0.collection_status', 'dikumpulkan')
            );

        $secondLoanRequest = LoanRequest::create([
            'student_id' => $student->id,
            'reason' => 'Keperluan pelajaran',
            'starts_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
        ]);

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('loanRequests.0.id', $secondLoanRequest->id)
                ->where('loanRequests.0.can_review', true)
                ->where('loanRequests.1.id', $loanRequest->id)
                ->where('loanRequests.1.can_review', false)
                ->where('loanRequests.1.can_return', false)
            );

        $this->actingAs($teacher)->patch(route('loan-requests.review', $secondLoanRequest), [
            'status' => 'acc',
        ]);

        $this->assertDatabaseHas('collection_records', [
            'loan_request_id' => $secondLoanRequest->id,
            'status' => 'sedang_dipinjam',
            'returned_at' => null,
        ]);
    }

    public function test_student_cannot_submit_another_request_while_phone_is_borrowed(): void
    {
        $studentUser = User::factory()->create([
            'role' => 'siswa',
            'email_verified_at' => now(),
        ]);
        $teacher = User::factory()->create(['role' => 'wali_kelas']);
        $schoolClass = SchoolClass::create([
            'name' => 'Kelas 10 A',
            'grade' => '10',
            'group_name' => 'A',
            'homeroom_user_id' => $teacher->id,
        ]);
        $student = Student::create([
            'user_id' => $studentUser->id,
            'class_id' => $schoolClass->id,
            'nis' => 'TEST002',
        ]);
        CollectionRecord::create([
            'student_id' => $student->id,
            'collection_date' => today(),
            'status' => 'sedang_dipinjam',
        ]);

        $response = $this->actingAs($studentUser)->post(route('loan-requests.store'), [
            'reason' => 'Keperluan keluarga',
            'starts_at' => now()->addHour()->format('H:i'),
            'ends_at' => now()->addHours(2)->format('H:i'),
        ]);

        $response->assertSessionHasErrors('reason');
        $this->assertDatabaseCount('loan_requests', 0);
    }
}
