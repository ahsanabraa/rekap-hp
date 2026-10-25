<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceReport extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'menunggu_verifikasi';

    public const STATUS_VERIFIED = 'terverifikasi';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_VERIFIED,
    ];

    protected $fillable = [
        'class_id',
        'report_date',
        'students_count',
        'absent_count',
        'verified_absent_count',
        'status',
        'reported_by',
        'reported_at',
        'verified_by',
        'verified_at',
        'verification_notes',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date',
            'reported_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    public function absentTotal(): int
    {
        return (int) ($this->verified_absent_count ?? $this->absent_count);
    }
}
