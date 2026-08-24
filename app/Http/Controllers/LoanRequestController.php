<?php

namespace App\Http\Controllers;

use App\Models\CollectionRecord;
use App\Models\LoanRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoanRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $student = $request->user()->student()->firstOrFail();

        if ($student->collectionRecords()
            ->whereDate('collection_date', today())
            ->where('status', 'sedang_dipinjam')
            ->exists()) {
            throw ValidationException::withMessages([
                'reason' => 'Kamu masih meminjam HP. Kembalikan HP terlebih dahulu sebelum mengajukan lagi.',
            ]);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i'],
        ]);

        $startsAt = Carbon::today()->setTimeFromTimeString($validated['starts_at']);
        $endsAt = Carbon::today()->setTimeFromTimeString($validated['ends_at']);

        if ($startsAt->isBefore(now())) {
            throw ValidationException::withMessages([
                'starts_at' => 'Jam mulai tidak boleh sudah lewat.',
            ]);
        }

        if ($endsAt->lessThanOrEqualTo($startsAt)) {
            throw ValidationException::withMessages([
                'ends_at' => 'Jam selesai harus setelah jam mulai.',
            ]);
        }

        $student->loanRequests()->create([
            'reason' => $validated['reason'],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        return back()->with('success', 'Pengajuan berhasil dikirim.');
    }

    public function review(Request $request, LoanRequest $loanRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:acc,dec'],
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $schoolClass = $request->user()->homeroomClass()->firstOrFail();
        abort_unless($loanRequest->student()->where('class_id', $schoolClass->id)->exists(), 404);

        DB::transaction(function () use ($request, $validated, $loanRequest): void {
            $loanRequest->update([
                'status' => $validated['status'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_notes' => $validated['review_notes'] ?? null,
            ]);

            if ($validated['status'] === 'acc') {
                CollectionRecord::updateOrCreate(
                    [
                        'student_id' => $loanRequest->student_id,
                        'collection_date' => today(),
                        'loan_request_id' => $loanRequest->id,
                    ],
                    [
                        'status' => 'sedang_dipinjam',
                        'returned_at' => null,
                        'recorded_by' => $request->user()->id,
                    ],
                );
            }
        });

        return back()->with('success', 'Pengajuan berhasil diperbarui.');
    }

    public function returnPhone(Request $request, LoanRequest $loanRequest): RedirectResponse
    {
        $schoolClass = $request->user()->homeroomClass()->firstOrFail();
        abort_unless($loanRequest->student()->where('class_id', $schoolClass->id)->exists(), 404);

        $collectionRecord = $loanRequest->collectionRecord()
            ->whereDate('collection_date', today())
            ->where('status', 'sedang_dipinjam')
            ->firstOrFail();

        $collectionRecord->update([
            'status' => 'dikumpulkan',
            'returned_at' => now(),
            'recorded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'HP berhasil ditandai sudah dikembalikan.');
    }
}
