<?php

use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassDepositController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::post('/class-deposits', [ClassDepositController::class, 'store'])
    ->middleware(['auth', 'role:siswa'])
    ->name('class-deposits.store');

Route::patch('/class-deposits/{classDeposit}/verify', [ClassDepositController::class, 'verify'])
    ->middleware(['auth', 'role:kesiswaan'])
    ->name('class-deposits.verify');

Route::patch('/class-deposits/{classDeposit}/release', [ClassDepositController::class, 'release'])
    ->middleware(['auth', 'role:kesiswaan'])
    ->name('class-deposits.release');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:kesiswaan'])->group(function () {
    Route::get('/classes', [ClassController::class, 'index'])->name('classes.index');
    Route::post('/classes', [ClassController::class, 'store'])->name('classes.store');
    Route::delete('/classes/{schoolClass}', [ClassController::class, 'destroy'])->name('classes.destroy');

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::post('/students/{student}/class-leader', [StudentController::class, 'setClassLeader'])
        ->name('students.class-leader');

    Route::post('/teachers/{user}/reset-password', [PasswordResetController::class, 'resetTeacher'])
        ->name('teachers.reset-password');
});

Route::post('/students/{student}/reset-password', [PasswordResetController::class, 'resetStudent'])
    ->middleware(['auth', 'role:wali_kelas,kesiswaan'])
    ->name('students.reset-password');

require __DIR__.'/auth.php';
