<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrolledPayloadModel extends Model
{
    protected $table    = 'tbl_enrolled_payload';
    protected $fillable = ['deviceid','userid','task','logdate','platform','devicemodel','data'];
}
