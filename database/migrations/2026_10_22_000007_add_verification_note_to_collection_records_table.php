<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->text('verification_note')->nullable()->after('notes');
            $table->foreignId('verified_note_by')->nullable()->after('verification_note')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_note_at')->nullable()->after('verified_note_by');
        });
    }

    public function down(): void
    {
        Schema::table('collection_records', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_note_by');
            $table->dropColumn(['verification_note', 'verified_note_at']);
        });
    }
};
