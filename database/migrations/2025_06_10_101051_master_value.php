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
        Schema::create('tbl_mastervalue', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->string('master_key',50);
            $table->string('code',50);
            $table->text('description');
            $table->boolean('isactive')->default(true);
            $table->timestamps();
        });
        //DB::statement("ALTER TABLE tbl_mastervalue AUTO_INCREMENT = 5001;");

        DB::statement("ALTER SEQUENCE tbl_mastervalue_id_seq RESTART WITH 5001;");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_mastervalue');
    }
};
