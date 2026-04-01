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
        Schema::table('tbl_user_checin_checkout',function(Blueprint $table){
            $table->text('attendance_type')->after('checkout')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_user_checin_checkout',function(Blueprint $table){
            $table->dropColumn('attendance_type');
        });
    }
};
