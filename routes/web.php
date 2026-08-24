<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanRequestController;
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

Route::post('/collection-records/{student}/status', [DashboardController::class, 'updateCollectionStatus'])
    ->middleware(['auth', 'role:wali_kelas'])
    ->name('collection-records.status');

Route::post('/loan-requests', [LoanRequestController::class, 'store'])
    ->middleware(['auth', 'role:siswa'])
    ->name('loan-requests.store');

Route::patch('/loan-requests/{loanRequest}/review', [LoanRequestController::class, 'review'])
    ->middleware(['auth', 'role:wali_kelas'])
    ->name('loan-requests.review');

Route::patch('/loan-requests/{loanRequest}/return', [LoanRequestController::class, 'returnPhone'])
    ->middleware(['auth', 'role:wali_kelas'])
    ->name('loan-requests.return');

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
});

require __DIR__.'/auth.php';
