<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Classes/Index', [
            'classes' => SchoolClass::with('homeroom:id,name,email')
                ->withCount('students')
                ->orderBy('grade')
                ->orderBy('group_name')
                ->get(),
            'teachers' => User::query()
                ->where('role', 'wali_kelas')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'grade' => ['required', 'string', 'max:20'],
            'group_name' => ['required', 'string', 'max:20'],
            'homeroom_user_id' => ['nullable', 'exists:users,id,role,wali_kelas'],
        ]);

        SchoolClass::create($validated);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function destroy(SchoolClass $schoolClass): RedirectResponse
    {
        $schoolClass->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }
}
