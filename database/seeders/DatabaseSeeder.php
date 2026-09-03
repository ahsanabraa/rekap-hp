<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
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
                'name' => 'Pak Budi Santoso',
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

        $students = [
            'Ahmad Fadillah',
            'Aisyah Putri Ramadhani',
            'Bambang Setiawan',
            'Citra Dewi Lestari',
            'Dimas Prayoga',
            'Febrianti Sari',
            'Gilang Ramadhan',
            'Hanifah Nur Azizah',
            'Irfan Hakim',
            'Joko Widodo Putra',
            'Kartika Sari',
            'Luthfi Hidayat',
            'Maya Anggraini',
            'Nanda Pratama',
            'Omar Daniel',
            'Putri Wulandari',
            'Rizky Aditya',
            'Siti Nurhaliza',
            'Taufik Rahman',
            'Ulya Maghfiroh',
            'Vito Alvaro',
            'Winda Oktaviani',
            'Yusuf Maulana',
            'Zahra Amalia',
            'Aditya Nugraha',
        ];

        foreach ($students as $index => $name) {
            $nis = str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            $slug = strtolower(explode(' ', $name)[0]);

            $user = User::updateOrCreate(
                ['email' => "{$slug}{$nis}@demo.com"],
                [
                    'name' => $name,
                    'role' => 'siswa',
                    'email_verified_at' => now(),
                    'password' => 'password',
                ],
            );

            Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'class_id' => $schoolClass->id,
                    'nis' => $nis,
                ],
            );
        }
    }
}
