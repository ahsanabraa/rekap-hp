<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'role',
        'password',
    ];

    public function student(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function homeroomClass(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(SchoolClass::class, 'homeroom_user_id');
    }

    public function recordedCollectionRecords(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CollectionRecord::class, 'recorded_by');
    }

    public function reviewedLoanRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LoanRequest::class, 'reviewed_by');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
