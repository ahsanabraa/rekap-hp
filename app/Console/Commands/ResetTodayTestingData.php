<?php

namespace App\Console\Commands;

use App\Models\AttendanceReport;
use App\Models\ClassDeposit;
use App\Models\CollectionRecord;
use App\Models\SchoolClass;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetTodayTestingData extends Command
{
    protected $signature = 'testing:reset-today
                            {--class= : ID kelas yang ingin direset (default: semua kelas)}
                            {--keep-attendance : Pertahankan absensi hari ini, hanya reset setoran HP}';

    protected $description = 'Reset data setoran HP dan absensi hari ini supaya alur pengujian bisa diulang dari awal';

    public function handle(): int
    {
        $classId = $this->option('class') ? (int) $this->option('class') : null;

        if ($classId !== null && ! SchoolClass::query()->whereKey($classId)->exists()) {
            $this->error("Kelas dengan ID {$classId} tidak ditemukan.");

            return self::FAILURE;
        }

        $deposits = ClassDeposit::query()
            ->when($classId, fn ($query) => $query->where('class_id', $classId))
            ->whereDate('deposit_date', today())
            ->get();

        $depositIds = $deposits->pluck('id');

        $deletedRecords = 0;
        $deletedDeposits = 0;
        $deletedReports = 0;

        DB::transaction(function () use ($depositIds, $deposits, $classId, &$deletedRecords, &$deletedDeposits, &$deletedReports): void {
            if ($depositIds->isNotEmpty()) {
                // collection_records memakai nullOnDelete, jadi hapus dulu agar tidak menyisakan data yatim.
                $deletedRecords = CollectionRecord::query()
                    ->whereIn('class_deposit_id', $depositIds)
                    ->delete();

                $deletedDeposits = ClassDeposit::query()
                    ->whereKey($depositIds)
                    ->delete();
            }

            if (! $this->option('keep-attendance')) {
                $reports = AttendanceReport::query()
                    ->when($classId, fn ($query) => $query->where('class_id', $classId))
                    ->whereDate('report_date', today())
                    ->get();

                $deletedReports = $reports->count();

                AttendanceReport::query()
                    ->whereKey($reports->pluck('id'))
                    ->delete();
            }
        });

        $this->info('Reset data hari ini selesai.');
        $this->line("- Setoran HP dihapus: {$deletedDeposits} ({$deletedRecords} catatan HP)");
        $this->line($this->option('keep-attendance')
            ? '- Absensi hari ini dipertahankan.'
            : "- Absensi dihapus: {$deletedReports}");

        if ($deposits->isEmpty() && $this->option('keep-attendance')) {
            $this->comment('Tidak ada setoran HP hari ini yang perlu direset.');
        }

        return self::SUCCESS;
    }
}
