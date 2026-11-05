<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'grade',
        'jurusan',
        'rombel',
        'homeroom_user_id',
    ];

    protected $casts = [
        'rombel' => 'integer',
    ];

    protected static function booted(): void
    {
        // Nama kelas selalu mengikuti tingkat + jurusan + rombel, contoh: 11 RPL 4.
        static::saving(function (SchoolClass $schoolClass): void {
            $schoolClass->name = trim(
                "{$schoolClass->grade} {$schoolClass->jurusan} {$schoolClass->rombel}",
            );
        });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query
            ->orderBy('grade')
            ->orderBy('jurusan')
            ->orderBy('rombel');
    }

    public function homeroom(): BelongsTo
    {
        return $this->belongsTo(User::class, 'homeroom_user_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(ClassDeposit::class, 'class_id');
    }

    public function attendanceReports(): HasMany
    {
        return $this->hasMany(AttendanceReport::class, 'class_id');
    }

    /**
     * Ketua dan wakil ketua sama-sama tercatat tidak masuk hari ini.
     * Kelas tanpa ketua/wakil dianggap tidak punya pemimpin yang hadir.
     */
    public function classLeadersAbsentToday(): bool
    {
        $leaderIds = $this->students()
            ->where(fn (Builder $query) => $query
                ->where('is_class_leader', true)
                ->orWhere('is_class_vice_leader', true))
            ->pluck('id');

        if ($leaderIds->isEmpty()) {
            return true;
        }

        $statuses = $this->attendanceReports()
            ->whereDate('report_date', today())
            ->with('records:id,attendance_report_id,student_id,status')
            ->first()?->records
            ->mapWithKeys(fn (AttendanceRecord $record) => [(int) $record->student_id => $record->status])
            ?? collect();

        return $leaderIds->every(
            fn ($id) => $statuses->get($id) === AttendanceRecord::STATUS_ABSENT,
        );
    }
}
