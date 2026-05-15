<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_app_clients', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');                           // e.g. "Python Face Service"
            $table->string('client_id')->unique();            // e.g. "python-face-service"
            $table->string('client_secret');                  // bcrypt hash of the raw secret
            $table->string('access_token')->nullable();       // SHA-256 hash of the issued token
            $table->timestamp('token_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_app_clients');
    }
};
