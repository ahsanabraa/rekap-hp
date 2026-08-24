<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->foreignId('loan_request_id')
                ->nullable()
                ->after('student_id')
                ->constrained('loan_requests')
                ->nullOnDelete();

            $table->index('loan_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->dropConstrainedForeignId('loan_request_id');
        });
    }
};
