<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    /**
     * Password default setelah direset. Sama dengan password awal
     * saat akun dibuat agar mudah diingat & diumumkan.
     */
    public const DEFAULT_PASSWORD = 'password';

    /**
     * Reset password siswa. Walas hanya untuk siswa kelasnya sendiri,
     * kesiswaan untuk semua siswa.
     */
    public function resetStudent(Request $request, int $student): RedirectResponse
    {
        $studentModel = Student::with('user')->findOrFail($student);

        if ($request->user()->role === 'wali_kelas') {
            $homeroomClassId = $request->user()->homeroomClass()->value('id');

            abort_unless($homeroomClassId && $studentModel->class_id === $homeroomClassId, 403);
        }

        $studentModel->user->update(['password' => self::DEFAULT_PASSWORD]);

        return back()->with(
            'success',
            "Password {$studentModel->user->name} direset ke: ".self::DEFAULT_PASSWORD
        );
    }

    /**
     * Reset password wali kelas. Hanya kesiswaan.
     */
    public function resetTeacher(Request $request, int $user): RedirectResponse
    {
        $teacher = User::where('role', 'wali_kelas')->findOrFail($user);

        $teacher->update(['password' => self::DEFAULT_PASSWORD]);

        return back()->with(
            'success',
            "Password {$teacher->name} direset ke: ".self::DEFAULT_PASSWORD
        );
    }
}
