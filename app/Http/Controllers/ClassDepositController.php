<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\PhoneLoan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClassDepositController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $student = $request->user()->student()->with('schoolClass')->first();

        abort_unless($student?->schoolClass, 422, 'Kamu belum terdaftar di kelas.');

        $schoolClass = $student->schoolClass;

        $canSubmit = $student->is_class_leader
            || $student->is_class_vice_leader
            || ($student->is_class_secretary && $schoolClass->classLeadersAbsentToday());

        abort_unless($canSubmit, 403, 'Hanya ketua, wakil ketua, atau sekretaris pengganti yang dapat mengisi checklist setoran.');

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

        // Absensi hari ini (walau belum diverifikasi) langsung dipakai agar siswa tidak masuk otomatis ditandai.
        $attendanceStatuses = $this->todayAttendanceStatuses($schoolClass->id);

        if ($attendanceStatuses !== []) {
            $entries = $entries->map(function (array $entry) use ($attendanceStatuses): array {
                $attendanceStatus = $attendanceStatuses[(int) $entry['student_id']] ?? null;

                if ($attendanceStatus === AttendanceRecord::STATUS_ABSENT) {
                    $entry['status'] = 'tidak_masuk';
                }

                if ($attendanceStatus === AttendanceRecord::STATUS_PRESENT && $entry['status'] === 'tidak_masuk') {
                    throw ValidationException::withMessages([
                        'entries' => 'Ada siswa yang tercatat masuk pada absensi sehingga tidak bisa ditandai tidak masuk.',
                    ]);
                }

                return $entry;
            });
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

            // Pinjaman aktif tidak boleh hilang saat checklist dikirim ulang.
            PhoneLoan::query()
                ->where('class_id', $schoolClass->id)
                ->whereNull('returned_at')
                ->whereDate('starts_at', today())
                ->get()
                ->each(function (PhoneLoan $loan) use ($deposit, $studentIds): void {
                    CollectionRecord::query()
                        ->where('class_deposit_id', $deposit->id)
                        ->whereIn('student_id', $loan->student_id ? [$loan->student_id] : $studentIds)
                        ->where('status', 'dikumpulkan')
                        ->update([
                            'status' => 'sedang_dipinjam',
                            'phone_loan_id' => $loan->id,
                        ]);
                });

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
            'entries' => ['nullable', 'array'],
            'entries.*.student_id' => ['required_with:entries', 'integer'],
            'entries.*.verification_note' => ['nullable', 'string', 'max:500'],
        ]);

        $entries = collect($validated['entries'] ?? []);
        $studentIds = $classDeposit->schoolClass
            ->students()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $foreignIds = $entries
            ->pluck('student_id')
            ->map(fn ($id) => (int) $id)
            ->diff($studentIds);

        if ($foreignIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'entries' => 'Ada siswa yang bukan anggota kelas ini pada daftar keterangan.',
            ]);
        }

        $discrepancy = (int) $validated['verified_count'] - $classDeposit->reported_count;

        DB::transaction(function () use ($classDeposit, $validated, $discrepancy, $entries, $request): void {
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

            foreach ($entries as $entry) {
                CollectionRecord::query()
                    ->where('class_deposit_id', $classDeposit->id)
                    ->where('student_id', (int) $entry['student_id'])
                    ->update([
                        'verification_note' => $entry['verification_note'] ?? null,
                        'verified_note_by' => $request->user()->id,
                        'verified_note_at' => now(),
                    ]);
            }
        });

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

    /**
     * @return array<int, string>
     */
    private function todayAttendanceStatuses(int $classId): array
    {
        $report = AttendanceReport::query()
            ->where('class_id', $classId)
            ->whereDate('report_date', today())
            ->with('records:id,attendance_report_id,student_id,status')
            ->first();

        if (! $report) {
            return [];
        }

        return $report->records
            ->mapWithKeys(fn (AttendanceRecord $record) => [(int) $record->student_id => $record->status])
            ->all();
    }
}
