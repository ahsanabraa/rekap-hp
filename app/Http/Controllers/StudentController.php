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

    public function setClassLeader(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'is_class_leader' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($student, $validated): void {
            if ($validated['is_class_leader']) {
                Student::query()
                    ->where('class_id', $student->class_id)
                    ->update(['is_class_leader' => false]);
            }

            $student->update(['is_class_leader' => (bool) $validated['is_class_leader']]);
        });

        $message = $validated['is_class_leader']
            ? $student->user->name.' sekarang menjadi ketua kelas.'
            : 'Status ketua kelas '.$student->user->name.' dicabut.';

        return back()->with('success', $message);
    }
}
