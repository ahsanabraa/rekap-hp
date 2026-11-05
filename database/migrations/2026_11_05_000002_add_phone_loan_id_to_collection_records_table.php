<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->foreignId('phone_loan_id')
                ->nullable()
                ->after('class_deposit_id')
                ->constrained('phone_loans')
                ->nullOnDelete();

            $table->index('phone_loan_id');
        });
    }

    public function down(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->dropConstrainedForeignId('phone_loan_id');
        });
    }
};
