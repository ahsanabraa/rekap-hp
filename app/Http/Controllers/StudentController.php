<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Students/Index', [
            'students' => Student::with(['user:id,name,username', 'schoolClass:id,name'])
                ->orderBy('nis')
                ->get(),
            'classes' => SchoolClass::orderBy('grade')
                ->orderBy('group_name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // Username otomatis = NIS agar mudah diingat siswa.
            'nis' => ['required', 'string', 'max:30', 'unique:students,nis', 'unique:users,username'],
            'class_id' => ['required', 'exists:classes,id'],
        ]);

        DB::transaction(function () use ($validated): void {
            $user = User::create([
                'name' => $validated['name'],
                'username' => $validated['nis'],
                'role' => 'siswa',
                'password' => 'password',
            ]);

            Student::create([
                'user_id' => $user->id,
                'class_id' => $validated['class_id'],
                'nis' => $validated['nis'],
            ]);
        });

        return back()->with('success', 'Siswa berhasil ditambahkan. Password awal: password.');
    }
}
