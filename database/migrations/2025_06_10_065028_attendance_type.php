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
        Schema::create('tbl_attendance_type', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->string('attendance_type',200);
            $table->text('description');
            $table->boolean('isactive')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_attendance_type');
    }
};
