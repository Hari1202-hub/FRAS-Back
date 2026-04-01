<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayloadLogModel extends Model
{
    public $timestamps = true;
    protected $table    = 'tbl_payloadlog';
    protected $fillable = ['request','response','api'];
}
