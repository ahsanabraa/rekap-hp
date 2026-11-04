<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    /**
     * Daftar jurusan SMK. Samakan dengan resources/js/lib/jurusan.js.
     */
    private const JURUSAN = ['RPL', 'DKV', 'TKJ', 'TRANSMISI'];

    private const TINGKAT = ['10', '11', '12'];

    public function index(): Response
    {
        return Inertia::render('Classes/Index', [
            'classes' => SchoolClass::with('homeroom:id,name,username')
                ->withCount('students')
                ->ordered()
                ->get(),
            'teachers' => User::query()
                ->where('role', 'wali_kelas')
                ->orderBy('name')
                ->get(['id', 'name', 'username']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateClass($request);

        $schoolClass = SchoolClass::create($validated);

        return back()->with('success', "Kelas {$schoolClass->name} berhasil ditambahkan.");
    }

    public function update(Request $request, SchoolClass $schoolClass): RedirectResponse
    {
        $validated = $this->validateClass($request, $schoolClass);

        $schoolClass->update($validated);

        return back()->with('success', "Kelas {$schoolClass->name} berhasil diperbarui.");
    }

    public function destroy(SchoolClass $schoolClass): RedirectResponse
    {
        if ($schoolClass->students()->exists()) {
            return back()->with(
                'error',
                "Kelas {$schoolClass->name} masih memiliki siswa. Pindahkan atau hapus siswanya terlebih dahulu.",
            );
        }

        $name = $schoolClass->name;
        $schoolClass->delete();

        return back()->with('success', "Kelas {$name} berhasil dihapus.");
    }

    private function validateClass(Request $request, ?SchoolClass $ignore = null): array
    {
        $validated = $request->validate([
            'grade' => ['required', 'string', Rule::in(self::TINGKAT)],
            'jurusan' => ['required', 'string', 'max:30', Rule::in(self::JURUSAN)],
            'rombel' => ['required', 'integer', 'min:1', 'max:99'],
            'homeroom_user_id' => ['nullable', 'exists:users,id,role,wali_kelas'],
        ], [
            'grade.in' => 'Tingkat harus salah satu dari 10, 11, atau 12.',
            'jurusan.in' => 'Jurusan belum terdaftar.',
            'rombel.min' => 'Rombel minimal 1.',
            'rombel.max' => 'Rombel maksimal 99.',
        ]);

        $duplicate = SchoolClass::query()
            ->where('grade', $validated['grade'])
            ->where('jurusan', $validated['jurusan'])
            ->where('rombel', $validated['rombel'])
            ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'rombel' => "Kelas {$validated['grade']} {$validated['jurusan']} {$validated['rombel']} sudah ada.",
            ]);
        }

        return $validated;
    }
}
