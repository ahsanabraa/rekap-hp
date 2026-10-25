<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    public const STATUS_PRESENT = 'masuk';

    public const STATUS_ABSENT = 'tidak_masuk';

    public const STATUSES = [
        self::STATUS_PRESENT,
        self::STATUS_ABSENT,
    ];

    protected $fillable = [
        'attendance_report_id',
        'student_id',
        'status',
        'notes',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(AttendanceReport::class, 'attendance_report_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
