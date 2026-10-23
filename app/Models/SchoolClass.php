<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'grade',
        'group_name',
        'homeroom_user_id',
    ];

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
}
