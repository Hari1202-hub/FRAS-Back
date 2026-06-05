<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_app_access_logs', function (Blueprint $table) {
            $table->id();
            $table->string('client_id', 100)->index();
            $table->string('client_name', 100)->nullable();
            $table->string('endpoint', 255);
            $table->string('method', 10);
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->integer('response_status')->default(200);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_app_access_logs');
    }
};
