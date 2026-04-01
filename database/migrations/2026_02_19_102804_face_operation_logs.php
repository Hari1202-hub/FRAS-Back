<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::create('face_operation_logs', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->string('action_type', 200);
            $table->timestamp('event_time')->nullable();
            $table->json('log_payload');
            $table->boolean('sync_status')->default(1); // server always synced
            $table->unsignedBigInteger('user_id')->index();
            
            $table->timestamps();

            $table->index('action_type');
            $table->index('event_time');

            $table->index(['action_type', 'created_at']);
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('face_operation_logs');
    }
};
