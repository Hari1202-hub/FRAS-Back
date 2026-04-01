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
        Schema::table('tbl_project',function(Blueprint $table){
            $table->dropColumn('latitude');
            $table->dropColumn('longitude');
        });
        Schema::create('tbl_project_lat_lng', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->float('latitude')->nullable()->default(null);
            $table->float('longitude')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_project_lat_lng');
    }
};
