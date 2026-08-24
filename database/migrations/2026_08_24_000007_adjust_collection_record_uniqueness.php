<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexNames = collect(Schema::getIndexes('collection_records'))->pluck('name');

        Schema::table('collection_records', function (Blueprint $table) use ($indexNames): void {
            if (! $indexNames->contains('collection_records_student_id_index')) {
                $table->index('student_id');
            }

            if ($indexNames->contains('collection_records_student_id_collection_date_unique')) {
                $table->dropUnique('collection_records_student_id_collection_date_unique');
            }

            if (! $indexNames->contains('collection_records_student_date_request_unique')) {
                $table->unique(
                    ['student_id', 'collection_date', 'loan_request_id'],
                    'collection_records_student_date_request_unique',
                );
            }
        });
    }

    public function down(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->dropUnique('collection_records_student_date_request_unique');
            $table->unique(['student_id', 'collection_date']);
        });
    }
};
