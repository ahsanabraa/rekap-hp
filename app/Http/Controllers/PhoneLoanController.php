<?php

namespace App\Http\Controllers;

use App\Models\CollectionRecord;
use App\Models\PhoneLoan;
use App\Models\SchoolClass;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PhoneLoanController extends Controller
{
    public function index(): Response
    {
        $classes = SchoolClass::query()
            ->with([
                'students:id,user_id,class_id,nis',
                'students.user:id,name',
            ])
            ->ordered()
            ->get();

        $loans = PhoneLoan::query()
            ->with([
                'schoolClass:id,name',
                'student:id,user_id,nis',
                'student.user:id,name',
                'recorder:id,name',
            ])
            ->latest('id')
            ->get();

        return Inertia::render('Loans/Index', [
            'date' => today()->toDateString(),
            'classes' => $classes,
            'activeLoans' => $loans->whereNull('returned_at')->values(),
            'historyLoans' => $loans->whereNotNull('returned_at')->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'target' => ['required', 'in:student,class'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'usage_description' => ['required', 'string', 'max:1000'],
            'usage_date' => ['required', 'date_format:Y-m-d', 'in:'.today()->toDateString()],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'teacher_name' => ['required', 'string', 'max:255'],
        ]);

        $schoolClass = SchoolClass::findOrFail($validated['class_id']);
        $classStudentIds = $schoolClass->students()->pluck('id')->map(fn ($id) => (int) $id);

        if ($validated['target'] === 'student') {
            if (! $validated['student_id'] || ! $classStudentIds->contains((int) $validated['student_id'])) {
                throw ValidationException::withMessages([
                    'student_id' => 'Pilih siswa yang terdaftar di kelas ini.',
                ]);
            }

            $targetIds = collect([(int) $validated['student_id']]);
        } else {
            $targetIds = $classStudentIds;
        }

        $records = CollectionRecord::query()
            ->whereIn('student_id', $targetIds)
            ->whereDate('collection_date', today())
            ->whereNotNull('class_deposit_id')
            ->where('status', 'dikumpulkan')
            ->get();

        if ($records->isEmpty()) {
            throw ValidationException::withMessages([
                'usage_description' => 'Belum ada HP yang disetor hari ini untuk ditandai dipinjam.',
            ]);
        }

        $startsAt = Carbon::parse($validated['usage_date'].' '.$validated['start_time']);
        $endsAt = Carbon::parse($validated['usage_date'].' '.$validated['end_time']);

        DB::transaction(function () use ($validated, $schoolClass, $records, $startsAt, $endsAt, $request): void {
            $loan = PhoneLoan::create([
                'class_id' => $schoolClass->id,
                'student_id' => $validated['target'] === 'student' ? (int) $validated['student_id'] : null,
                'usage_description' => $validated['usage_description'],
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'teacher_name' => $validated['teacher_name'],
                'recorded_by' => $request->user()->id,
            ]);

            CollectionRecord::query()
                ->whereKey($records->pluck('id'))
                ->update([
                    'status' => 'sedang_dipinjam',
                    'phone_loan_id' => $loan->id,
                ]);
        });

        return back()->with('success', 'HP berhasil ditandai sedang dipinjam.');
    }

    public function markReturned(PhoneLoan $phoneLoan): RedirectResponse
    {
        if ($phoneLoan->returned_at) {
            return back()->with('success', 'HP ini sudah ditandai dikembalikan.');
        }

        DB::transaction(function () use ($phoneLoan): void {
            $phoneLoan->collectionRecords()
                ->where('status', 'sedang_dipinjam')
                ->update([
                    'status' => 'dikumpulkan',
                    'returned_at' => now(),
                ]);

            $phoneLoan->update(['returned_at' => now()]);
        });

        return back()->with('success', 'HP berhasil ditandai sudah dikembalikan.');
    }
}
