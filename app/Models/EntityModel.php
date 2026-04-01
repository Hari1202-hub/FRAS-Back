<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntityModel extends Model
{
    protected $table    = 'tbl_entity';
    protected $fillable = ['guid','entityname','isactive'];
    public $timestamps = false;
}
