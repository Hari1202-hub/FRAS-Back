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
         Schema::table('tbl_entrolled_log',function(Blueprint $table){
            $table->text('api')->after('created_by')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('tbl_entrolled_log',function(Blueprint $table){
            $table->dropColumn('api');
        });
    }
};
