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
        Schema::create('tbl_role', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->string('rolename',40);
            $table->string('rolecode',6);
            $table->string('roledesc',200)->nullable()->default(null);
            $table->text('mobile_permission')->nullable()->default(null);
            $table->text('web_permission')->nullable()->default(null);
            $table->boolean('isactive')->default(true);
            $table->unsignedBigInteger('createdby');
            $table->timestamps();
            $table->unsignedBigInteger('updatedby');
            //$table->foreign('createdby')->references('id')->on('users');
            //$table->foreign('updatedby')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_role');
    }
};
