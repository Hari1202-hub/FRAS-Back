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
        Schema::create('tbl_entity', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->string('entityname',50);
            $table->boolean('isactive')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_entity');
    }
};
