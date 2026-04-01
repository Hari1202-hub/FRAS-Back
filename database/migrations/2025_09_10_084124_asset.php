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
        Schema::create('tbl_asset', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            $table->text('asset_id');
            $table->text('asset_name');
            $table->unsignedBigInteger('asset_type');
            $table->text('qr_code')->nullable()->default(null);
            $table->text('qr_code_img')->nullable()->default(null);
            $table->text('ref_asset_id')->nullable()->default(null);
            $table->boolean('isactive')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_asset');
    }
};
