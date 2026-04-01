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
        Schema::create('tbl_sub_activities', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique();
            $table->text('sub_activity_id');
            $table->text('sub_activity_name');
            $table->unsignedBigInteger('projectid');
            $table->unsignedBigInteger('activity_id');
            $table->text('ref_activity_id')->nullable()->default(null);
            $table->double('completion_percentage')->nullable()->default(null);
            $table->text('description');
            $table->string('unit',255)->nullable()->default(null);
            $table->double('qty')->nullable()->default(null);
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
        Schema::dropIfExists('tbl_sub_activities');
    }
};
