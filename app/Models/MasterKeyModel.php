<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterKeyModel extends Model
{
    protected $table    = 'tbl_masterkey';
    protected $fillable = ['guid','master_key','code','description','isactive'];
}
