<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntityModel extends BaseModel
{
    protected $table    = 'tbl_entity';
    protected $fillable = ['guid', 'entity_code', 'entityname', 'isactive'];
    public $timestamps = false;
}
