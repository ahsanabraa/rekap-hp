<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->cascadeOnDelete();
            $table->text('usage_description');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('teacher_name');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();

            $table->index(['class_id', 'returned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_loans');
    }
};
