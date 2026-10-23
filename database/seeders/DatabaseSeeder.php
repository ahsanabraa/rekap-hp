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
            ['username' => 'kesiswaan'],
            [
                'name' => 'Admin Kesiswaan',
                'role' => 'kesiswaan',
                'email' => null,
                'email_verified_at' => null,
                'password' => 'password',
            ],
        );

        $waliKelas = User::updateOrCreate(
            ['username' => 'budi.santoso'],
            [
                'name' => 'Pak Budi Santoso',
                'role' => 'wali_kelas',
                'email' => null,
                'email_verified_at' => null,
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

            // Username siswa = NIS agar mudah diingat.
            $user = User::updateOrCreate(
                ['username' => $nis],
                [
                    'name' => $name,
                    'role' => 'siswa',
                    'email' => null,
                    'email_verified_at' => null,
                    'password' => 'password',
                ],
            );

            Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'class_id' => $schoolClass->id,
                    'nis' => $nis,
                    'is_class_leader' => $index === 0,
                ],
            );
        }
    }
}
