<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetTypeModel extends Model
{
    protected $table    = 'tbl_asset_type';
    protected $fillable = ['guid','name','ref_asset_id','isactive'];
}
