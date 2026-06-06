<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterValueModel extends BaseModel
{
    protected $table    = 'tbl_mastervalue';
    protected $fillable = ['guid','master_key','code','description','isactive'];
}
