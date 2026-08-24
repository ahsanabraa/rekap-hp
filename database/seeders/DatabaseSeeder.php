<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'kesiswaan@example.com'],
            [
                'name' => 'Admin Kesiswaan',
                'role' => 'kesiswaan',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );

        $waliKelas = User::updateOrCreate(
            ['email' => 'walikelas@example.com'],
            [
                'name' => 'Wali Kelas Demo',
                'role' => 'wali_kelas',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );

        $schoolClass = SchoolClass::updateOrCreate(
            ['grade' => '10', 'group_name' => 'A'],
            [
                'name' => 'Kelas 10 A',
                'homeroom_user_id' => $waliKelas->id,
            ],
        );

        $studentUser = User::updateOrCreate(
            ['email' => 'siswa@example.com'],
            [
                'name' => 'Siswa Demo',
                'role' => 'siswa',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );

        Student::updateOrCreate(
            ['user_id' => $studentUser->id],
            [
                'class_id' => $schoolClass->id,
                'nis' => 'DEMO001',
            ],
        );
    }
}
