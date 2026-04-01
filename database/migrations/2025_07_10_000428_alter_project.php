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
            $table->text('unique_id')->after('isactive')->nullable()->default(null);
             $table->text('location_shotname')->nullable()->default(null)->change();;
             $table->text('location_longname')->nullable()->default(null)->change();;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_project',function(Blueprint $table){
            $table->dropColumn('unique_id');
        });
    }
};
