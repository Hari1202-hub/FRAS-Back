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
        Schema::create('tbl_auditlog', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',50)->unique();
            $table->string('eventtype',10);
            $table->string('eventmodule',10);
            $table->string('auditlog_desc',40);
            $table->unsignedBigInteger('from_userid')->nullable()->default(null);
            $table->unsignedBigInteger('to_userid')->nullable()->default(null);
            $table->Integer('isauto');
            $table->Date('date');
            $table->string('reference',4000);
        });
        //DB::statement("ALTER TABLE tbl_masterkey AUTO_INCREMENT = 5001;");

        DB::statement("ALTER SEQUENCE tbl_auditlog_id_seq RESTART WITH 5001;");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_auditlog');
    }
};
