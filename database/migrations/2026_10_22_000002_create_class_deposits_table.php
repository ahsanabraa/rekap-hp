<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->date('deposit_date');
            $table->unsignedSmallInteger('students_count')->default(0);
            $table->unsignedSmallInteger('reported_count')->default(0);
            $table->unsignedSmallInteger('verified_count')->nullable();
            $table->integer('discrepancy')->default(0);
            $table->string('status', 30)->default('menunggu_verifikasi');
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reported_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
            $table->foreignId('released_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            $table->unique(['class_id', 'deposit_date']);
            $table->index(['deposit_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_deposits');
    }
};
