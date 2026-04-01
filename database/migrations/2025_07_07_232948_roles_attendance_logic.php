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
        Schema::create('tbl_role_attendance_logic', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            //$table->uuid('guid')->unique();
            $table->string('guid',50)->unique();
            $table->unsignedBigInteger('attendace_type_id');
            $table->boolean('project_required')->default(false);
            $table->boolean('location_required')->default(false);
            $table->boolean('comment_required')->default(false);
            $table->text('default_comment')->nullable()->default(null);
            $table->text('description')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_role_attendace_logic');
    }
};
