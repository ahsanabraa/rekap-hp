<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('grade', 20);
            $table->string('group_name', 20);
            $table->foreignId('homeroom_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['grade', 'group_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
