<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntrolledLog extends Model
{
    public $timestamps = true;
    protected $table    = 'tbl_entrolled_log';
    protected $fillable = ['empguid','vector','image','created_by','api'];
}
