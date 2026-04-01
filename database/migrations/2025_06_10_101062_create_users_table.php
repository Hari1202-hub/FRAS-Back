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
        Schema::create('tbl_user', function (Blueprint $table) {
            $table->id();
            $table->string('name',40);
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->text('unique_id');
            $table->string('email')->unique();
            $table->string('image')->nullable()->default(null);
            $table->unsignedBigInteger('mobile');
            $table->string('category_code');
            $table->string('classification_code');
            $table->string('entity_id');
            $table->string('loginmethod_code',10);
            $table->boolean('isactive',10)->default(true);

            //$table->timestamp('email_verified_at')->nullable();
           // $table->string('password');
           // $table->rememberToken();
            $table->timestamps();
        });
        Schema::create('tbl_userlogin', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            $table->string('email')->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('emp_id',50);
            //$table->string('category');
            $table->text('password');
            $table->text('passcode');
            $table->rememberToken();
            $table->unsignedBigInteger('defaultpassword');
            $table->boolean('isactive',10)->default(true);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_userlogin');
        Schema::dropIfExists('tbl_user');
        
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
