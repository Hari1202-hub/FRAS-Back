<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityModel extends Model
{
    protected $table    = 'tbl_activities';
    protected $fillable = ['guid','projectid','activity_id','ref_activity_id','activity_type','activity_description','unit','qty','sub_activity_count','startdate','enddate','status','isactive'];
    public function Project(){
        return $this->hasOne(ProjectModel::class,'id','projectid');
    }
}
