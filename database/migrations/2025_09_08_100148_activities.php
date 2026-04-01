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
        Schema::create('tbl_activities', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            //$table->string('guid',10)->unique();
            $table->text('activity_id');
            $table->text('activity_name');
            $table->unsignedBigInteger('projectid');
            $table->text('ref_activity_id')->nullable()->default(null);
            $table->string('activity_type',255);
            $table->text('activity_description');
            $table->string('unit',255)->nullable()->default(null);
            $table->double('qty')->nullable()->default(null);
            $table->unsignedBigInteger('sub_activity_count')->nullable()->default(0);
            $table->date('startdate');
            $table->date('enddate');
            $table->enum('status',['Completed','Ongoing','Not Started'])->default('Not Started');            
            $table->boolean('isactive')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_activities');
    }
};
