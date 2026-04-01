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
        Schema::create('tbl_project', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',10)->unique();
            $table->string('projectid',10)->unique();
            $table->string('projectname',40);
            $table->unsignedBigInteger('entity_id');
            $table->string('location_shotname',40)->nullable()->default(null);
            $table->string('location_longname',200)->nullable()->default(null);
            //$table->geometry('geog')->nullable()->default(null);
            $table->text('geog')->nullable()->default(null);
            $table->float('latitude')->nullable()->default(null);
            $table->float('longitude')->nullable()->default(null);
            $table->date('startdate');
            $table->date('enddate');
            $table->boolean('isactive')->default(true);
            $table->foreign('entity_id')->references('id')->on('tbl_entity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_project');
    }
};
