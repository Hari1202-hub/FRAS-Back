<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntrolledImageModel extends BaseModel
{
    protected $table    = 'tbl_entrolled_image';
    protected $fillable = ['empguid','vector', 'vectors','image','created_by'];
    public function User(){
        return $this->belongsTo(User::class,'empguid','guid');
    }
    public function TplUser(){
        return $this->belongsTo(TplUserModel::class,'empguid','guid');
    }
}
