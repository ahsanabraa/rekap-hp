<?php

namespace App\Http\Controllers;

use App\Models\CollectionRecord;
use App\Models\SchoolClass;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'kesiswaan') {
            return Inertia::render('Dashboard', [
                'role' => 'kesiswaan',
                'classes' => SchoolClass::with('homeroom:id,name')
                    ->with([
                        'students.user:id,name',
                        'students.collectionRecords' => fn ($query) => $query->whereDate('collection_date', today())->latest('id'),
                    ])
                    ->withCount('students')
                    ->withCount([
                        'students as collected_students_count' => fn ($query) => $query->whereHas(
                            'collectionRecords',
                            fn ($records) => $records
                                ->whereDate('collection_date', today())
                                ->where('status', 'dikumpulkan'),
                        ),
                    ])
                    ->orderBy('grade')
                    ->orderBy('group_name')
                    ->get(),
                'date' => today()->toDateString(),
            ]);
        }

        if ($user->role === 'wali_kelas') {
            $schoolClass = $user->homeroomClass()->with([
                'students.user:id,name',
                'students.collectionRecords' => fn ($query) => $query->whereDate('collection_date', today())->latest('id'),
            ])->first();

            $loanRequests = $schoolClass
                ? $schoolClass->students()->with('user:id,name')->whereHas('loanRequests')->with([
                    'collectionRecords' => fn ($query) => $query->whereDate('collection_date', today())->latest('id'),
                    'loanRequests' => fn ($query) => $query->latest()->orderByDesc('id'),
                ])->get()->flatMap(fn ($student) => $student->loanRequests->values()->map(function ($loanRequest, $index) use ($student) {
                    $record = $student->collectionRecords
                        ->where('loan_request_id', $loanRequest->id)
                        ->first();
                    $isLatestRequest = $index === 0;
                    $returnedAt = $isLatestRequest ? $record?->returned_at : null;

                    $loanRequest->setAttribute('student_name', $student->user->name);
                    $loanRequest->setAttribute('collection_status', $record?->status);
                    $loanRequest->setAttribute('returned_at', $returnedAt);
                    $loanRequest->setAttribute('can_return', $isLatestRequest
                        && $loanRequest->status === 'acc'
                        && $record?->status === 'sedang_dipinjam');
                    $loanRequest->setAttribute('can_review', $isLatestRequest && $loanRequest->status === 'pending');
                    $isReturnedLate = $returnedAt
                        && $loanRequest->ends_at
                        && $returnedAt->gt($loanRequest->ends_at);
                    $isStillBorrowedLate = $record?->status === 'sedang_dipinjam'
                        && $loanRequest->ends_at?->isPast();

                    $loanRequest->setAttribute('is_late', $isLatestRequest
                        && $loanRequest->status === 'acc'
                        && ($isStillBorrowedLate || $isReturnedLate));

                    return $loanRequest;
                }))->sortByDesc('id')->values()
                : collect();

            return Inertia::render('Dashboard', [
                'role' => 'wali_kelas',
                'schoolClass' => $schoolClass,
                'loanRequests' => $loanRequests,
                'date' => today()->toDateString(),
                'statuses' => CollectionRecord::STATUSES,
            ]);
        }

        return Inertia::render('Dashboard', [
            'role' => 'siswa',
            'date' => today()->toDateString(),
            'loanRequests' => $user->student?->loanRequests()->latest()->get() ?? collect(),
        ]);
    }

    public function updateCollectionStatus(Request $request, int $student): Response|RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:'.implode(',', CollectionRecord::STATUSES)],
        ]);

        $schoolClass = $request->user()->homeroomClass()->firstOrFail();
        $studentModel = $schoolClass->students()->findOrFail($student);

        CollectionRecord::updateOrCreate(
            [
                'student_id' => $studentModel->id,
                'collection_date' => Carbon::today()->toDateString(),
                'loan_request_id' => null,
            ],
            [
                'status' => $validated['status'],
                'collected_at' => $validated['status'] === 'dikumpulkan' ? now() : null,
                'recorded_by' => $request->user()->id,
            ],
        );

        $freshClass = $request->user()->homeroomClass()->with([
            'students.user:id,name',
            'students.collectionRecords' => fn ($query) => $query->whereDate('collection_date', today())->latest('id'),
        ])->first();

        $loanRequests = $freshClass
            ? $freshClass->students()->with('user:id,name')->whereHas('loanRequests')->with([
                'collectionRecords' => fn ($query) => $query->whereDate('collection_date', today())->latest('id'),
                'loanRequests' => fn ($query) => $query->latest()->orderByDesc('id'),
            ])->get()->flatMap(fn ($student) => $student->loanRequests->values()->map(function ($loanRequest, $index) use ($student) {
                $record = $student->collectionRecords->where('loan_request_id', $loanRequest->id)->first();
                $isLatestRequest = $index === 0;
                $returnedAt = $isLatestRequest ? $record?->returned_at : null;

                $loanRequest->setAttribute('student_name', $student->user->name);
                $loanRequest->setAttribute('collection_status', $record?->status);
                $loanRequest->setAttribute('returned_at', $returnedAt);
                $loanRequest->setAttribute('can_return', $isLatestRequest && $loanRequest->status === 'acc' && $record?->status === 'sedang_dipinjam');
                $loanRequest->setAttribute('can_review', $isLatestRequest && $loanRequest->status === 'pending');
                $isReturnedLate = $returnedAt && $loanRequest->ends_at && $returnedAt->gt($loanRequest->ends_at);
                $isStillBorrowedLate = $record?->status === 'sedang_dipinjam' && $loanRequest->ends_at?->isPast();
                $loanRequest->setAttribute('is_late', $isLatestRequest && $loanRequest->status === 'acc' && ($isStillBorrowedLate || $isReturnedLate));

                return $loanRequest;
            }))->sortByDesc('id')->values()
            : collect();

        return Inertia::render('Dashboard', [
            'role' => 'wali_kelas',
            'schoolClass' => $freshClass,
            'loanRequests' => $loanRequests,
            'date' => today()->toDateString(),
        ]);
    }
}
