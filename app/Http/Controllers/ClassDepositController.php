<?php

namespace App\Http\Controllers;

use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClassDepositController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $student = $request->user()->student()->with('schoolClass')->first();

        abort_unless($student && $student->is_class_leader, 403, 'Hanya ketua kelas yang dapat mengisi checklist setoran.');
        abort_unless($student->schoolClass, 422, 'Kamu belum terdaftar di kelas.');

        $schoolClass = $student->schoolClass;
        $studentIds = $schoolClass->students()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.student_id' => ['required', 'integer'],
            'entries.*.status' => ['required', 'in:dikumpulkan,tidak_mengumpulkan,tidak_masuk'],
            'entries.*.notes' => ['nullable', 'string', 'max:500'],
        ]);

        $entries = collect($validated['entries']);
        $providedIds = $entries->pluck('student_id')->map(fn ($id) => (int) $id);
        $expectedIds = collect($studentIds)->sort()->values();
        $actualIds = $providedIds->sort()->values();

        if ($providedIds->duplicates()->isNotEmpty() || $actualIds->all() !== $expectedIds->all()) {
            throw ValidationException::withMessages([
                'entries' => 'Daftar siswa pada checklist tidak sesuai dengan data kelas. Muat ulang halaman lalu coba lagi.',
            ]);
        }

        $deposit = ClassDeposit::query()
            ->where('class_id', $schoolClass->id)
            ->whereDate('deposit_date', today())
            ->first();

        if (! $deposit) {
            $deposit = new ClassDeposit([
                'class_id' => $schoolClass->id,
                'deposit_date' => today()->toDateString(),
            ]);
        }

        if ($deposit->exists && $deposit->status !== ClassDeposit::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'entries' => 'Setoran hari ini sudah diverifikasi kesiswaan sehingga tidak bisa diubah.',
            ]);
        }

        $reportedCount = $entries->where('status', 'dikumpulkan')->count();

        DB::transaction(function () use ($deposit, $entries, $studentIds, $schoolClass, $request, $reportedCount): void {
            $deposit->fill([
                'students_count' => count($studentIds),
                'reported_count' => $reportedCount,
                'verified_count' => null,
                'discrepancy' => 0,
                'status' => ClassDeposit::STATUS_PENDING,
                'reported_by' => $request->user()->id,
                'reported_at' => now(),
                'verified_by' => null,
                'verified_at' => null,
                'verification_notes' => null,
                'released_by' => null,
                'released_at' => null,
            ])->save();

            CollectionRecord::query()
                ->whereIn('student_id', $studentIds)
                ->whereDate('collection_date', today())
                ->where(function ($query) use ($deposit) {
                    $query->whereNull('class_deposit_id')
                        ->orWhere('class_deposit_id', $deposit->id);
                })
                ->delete();

            foreach ($entries as $entry) {
                $status = $entry['status'];

                CollectionRecord::create([
                    'class_deposit_id' => $deposit->id,
                    'student_id' => (int) $entry['student_id'],
                    'collection_date' => today()->toDateString(),
                    'status' => $status,
                    'collected_at' => $status === 'dikumpulkan' ? now() : null,
                    'returned_at' => null,
                    'recorded_by' => $request->user()->id,
                    'notes' => $entry['notes'] ?? null,
                ]);
            }

            CollectionRecord::query()
                ->where('class_deposit_id', $deposit->id)
                ->whereNotIn('student_id', $studentIds)
                ->delete();

            $deposit->setRelation('schoolClass', $schoolClass);
        });

        return back()->with('success', 'Checklist setoran berhasil dikirim. Menunggu verifikasi kesiswaan.');
    }

    public function verify(Request $request, ClassDeposit $classDeposit): RedirectResponse
    {
        if ($classDeposit->isReleased()) {
            throw ValidationException::withMessages([
                'verified_count' => 'Box sudah ditandai diambil sehingga verifikasi tidak bisa diubah.',
            ]);
        }

        $validated = $request->validate([
            'verified_count' => ['required', 'integer', 'min:0', 'max:'.$classDeposit->students_count],
            'verification_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $discrepancy = (int) $validated['verified_count'] - $classDeposit->reported_count;

        $classDeposit->update([
            'verified_count' => $validated['verified_count'],
            'discrepancy' => $discrepancy,
            'status' => $discrepancy === 0
                ? ClassDeposit::STATUS_VERIFIED
                : ClassDeposit::STATUS_DISCREPANCY,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'verification_notes' => $validated['verification_notes'] ?? null,
        ]);

        $message = $discrepancy === 0
            ? 'Setoran terverifikasi. Jumlah HP sesuai dengan checklist.'
            : 'Setoran terverifikasi dengan selisih '.$discrepancy.' HP.';

        return back()->with('success', $message);
    }

    public function release(Request $request, ClassDeposit $classDeposit): RedirectResponse
    {
        if ($classDeposit->isReleased()) {
            return back()->with('success', 'Box kelas ini sudah ditandai diambil.');
        }

        if ($classDeposit->verified_count === null) {
            throw ValidationException::withMessages([
                'verified_count' => 'Verifikasi jumlah HP terlebih dahulu sebelum menandai box diambil.',
            ]);
        }

        $classDeposit->update([
            'status' => ClassDeposit::STATUS_RELEASED,
            'released_by' => $request->user()->id,
            'released_at' => now(),
        ]);

        return back()->with('success', 'Box berhasil ditandai sudah diambil oleh ketua kelas.');
    }
}
