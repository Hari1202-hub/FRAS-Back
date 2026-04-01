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
            $table->text('checkout_project_id')->after('checkout')->nullable()->default(null);
            $table->text('checkin_lat')->after('checkout_project_id')->nullable()->default(null);
            $table->text('checkin_lang')->after('checkout')->nullable()->default(null);
            $table->text('checkout_lat')->after('checkout')->nullable()->default(null);
            $table->text('checkout_lang')->after('checkout')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_user_checin_checkout',function(Blueprint $table){
            $table->dropColumn('checkout_project_id');
            $table->dropColumn('checkin_lat');
            $table->dropColumn('checkin_lang');
            $table->dropColumn('checkout_lat');
            $table->dropColumn('checkout_lang');
        });
    }
};
