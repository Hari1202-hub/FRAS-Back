<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetModel extends Model
{
    protected $table    = 'tbl_asset';
    protected $fillable = ['guid','asset_id','asset_name','asset_type','qr_code','qr_code_img','ref_asset_id','isactive'];
    public function AssetType(){
        return $this->hasOne(AssetTypeModel::class,'id','asset_type');
    }
}
