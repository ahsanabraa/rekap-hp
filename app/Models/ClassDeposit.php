<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassDeposit extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'menunggu_verifikasi';

    public const STATUS_VERIFIED = 'terverifikasi';

    public const STATUS_DISCREPANCY = 'selisih';

    public const STATUS_RELEASED = 'selesai';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_VERIFIED,
        self::STATUS_DISCREPANCY,
        self::STATUS_RELEASED,
    ];

    public const ATTENTION_THRESHOLD = 3;

    public const ATTENTION_WINDOW_DAYS = 30;

    protected $fillable = [
        'class_id',
        'deposit_date',
        'students_count',
        'reported_count',
        'verified_count',
        'discrepancy',
        'status',
        'reported_by',
        'reported_at',
        'verified_by',
        'verified_at',
        'verification_notes',
        'released_by',
        'released_at',
    ];

    protected function casts(): array
    {
        return [
            'deposit_date' => 'date',
            'reported_at' => 'datetime',
            'verified_at' => 'datetime',
            'released_at' => 'datetime',
        ];
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(CollectionRecord::class);
    }

    public function reportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function isReleased(): bool
    {
        return $this->released_at !== null;
    }

    public function hasShortage(): bool
    {
        return $this->verified_count !== null
            && $this->verified_count < $this->reported_count;
    }
}
