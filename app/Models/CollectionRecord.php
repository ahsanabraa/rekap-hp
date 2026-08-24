<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionRecord extends Model
{
    use HasFactory;

    public const STATUSES = [
        'dikumpulkan',
        'sedang_dipinjam',
        'tidak_mengumpulkan',
        'tidak_masuk',
    ];

    protected $fillable = [
        'student_id',
        'loan_request_id',
        'collection_date',
        'status',
        'collected_at',
        'returned_at',
        'recorded_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'collection_date' => 'date',
            'collected_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function loanRequest(): BelongsTo
    {
        return $this->belongsTo(LoanRequest::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
