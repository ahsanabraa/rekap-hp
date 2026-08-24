<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('collection_records')
            ->whereNotNull('loan_request_id')
            ->whereNotNull('returned_at')
            ->update(['loan_request_id' => null]);
    }

    public function down(): void
    {
    }
};
