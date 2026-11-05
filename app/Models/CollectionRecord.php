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
        'class_deposit_id',
        'phone_loan_id',
        'collection_date',
        'status',
        'collected_at',
        'returned_at',
        'recorded_by',
        'notes',
        'verification_note',
        'verified_note_by',
        'verified_note_at',
    ];

    protected function casts(): array
    {
        return [
            'collection_date' => 'date',
            'collected_at' => 'datetime',
            'returned_at' => 'datetime',
            'verified_note_at' => 'datetime',
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

    public function classDeposit(): BelongsTo
    {
        return $this->belongsTo(ClassDeposit::class);
    }

    public function phoneLoan(): BelongsTo
    {
        return $this->belongsTo(PhoneLoan::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function verifiedNoteBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_note_by');
    }
}
