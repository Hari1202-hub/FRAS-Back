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
        Schema::create('tbl_enrolled_payload', function (Blueprint $table) {
            $table->id();
            $table->text('deviceid')->nullable()->default(null);
            $table->text('userid')->nullable()->default(null);
            $table->text('task')->nullable()->default(null);
            $table->text('logdate')->nullable()->default(null);
            $table->text('platform')->nullable()->default(null);
            $table->text('devicemodel')->nullable()->default(null);
            $table->text('data')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_enrolled_payload');
    }
};
