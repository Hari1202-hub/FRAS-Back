<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payday_punch_logs', function (Blueprint $table) {
            $table->id();

            // Source punch: a row in tbl_user_checin_checkout, split per punch type.
            $table->unsignedBigInteger('checkin_id')->index();
            $table->string('punchstatus', 1); // 0 = check-in, 1 = check-out

            // What was sent to Payday
            $table->string('empno')->nullable();
            $table->string('empprojectcode')->nullable();
            $table->string('punchdate')->nullable(); // dd-mm-yyyy HH:MM:SS
            $table->json('request_payload')->nullable();

            // Outcome
            $table->string('status', 20)->default('pending'); // pending|success|failed|skipped
            $table->string('response_status')->nullable();
            $table->string('response_code')->nullable();
            $table->text('response_message')->nullable();
            $table->longText('response_body')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('synced_at')->nullable();

            $table->timestamps();

            // One log row per (punch, type) — drives "what's still pending".
            $table->unique(['checkin_id', 'punchstatus']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payday_punch_logs');
    }
};
