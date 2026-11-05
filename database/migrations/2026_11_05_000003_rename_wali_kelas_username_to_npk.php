<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Akun wali kelas lama memakai username nama; ganti ke NPK contoh 1001.
        if (DB::table('users')->where('username', '1001')->exists()) {
            return;
        }

        DB::table('users')
            ->where('role', 'wali_kelas')
            ->where('username', 'budi.santoso')
            ->update(['username' => '1001']);
    }

    public function down(): void
    {
    }
};
