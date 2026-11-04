<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('jurusan', 30)->default('')->after('grade');
            $table->unsignedSmallInteger('rombel')->default(1)->after('jurusan');
        });

        // Isi data lama: group_name lama dipakai sebagai jurusan, rombel dimulai dari 1.
        DB::table('classes')->get()->each(function (object $class): void {
            $jurusan = trim((string) $class->group_name) !== '' ? trim((string) $class->group_name) : 'RPL';

            DB::table('classes')->where('id', $class->id)->update([
                'jurusan' => $jurusan,
                'rombel' => 1,
                'name' => trim("{$class->grade} {$jurusan} 1"),
            ]);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique('classes_grade_group_name_unique');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->unique(['grade', 'jurusan', 'rombel']);
            $table->dropColumn('group_name');
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('group_name', 20)->default('')->after('grade');
        });

        DB::table('classes')->get()->each(function (object $class): void {
            $groupName = trim("{$class->jurusan} {$class->rombel}");

            DB::table('classes')->where('id', $class->id)->update([
                'group_name' => $groupName,
            ]);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique('classes_grade_jurusan_rombel_unique');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->unique(['grade', 'group_name']);
            $table->dropColumn(['jurusan', 'rombel']);
        });
    }
};
