<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('collection_date');
            $table->string('status', 30);
            $table->timestamp('collected_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'collection_date']);
            $table->index(['collection_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_records');
    }
};
