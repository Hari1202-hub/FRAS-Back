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
        Schema::create('tbl_user_checin_checkout', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('emp_id',10);
            $table->date('date');
            $table->time('checkin');
            $table->time('checkout');
            $table->timestamps();
        });
        //DB::statement("ALTER TABLE tbl_user_checin_checkout AUTO_INCREMENT = 5001;");
       // DB::statement("ALTER SEQUENCE tbl_user_checin_checkout RESTART WITH 5001;");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_user_checin_checkout');
    }
};
