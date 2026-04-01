<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubactivityModel extends Model
{
    protected $table    = 'tbl_sub_activities';
    protected $fillable = ['guid','projectid','activity_id','sub_activity_id','ref_activity_id','completion_percentage','description','unit','qty','startdate','enddate','status','isactive'];
    public function Activity(){
        return $this->hasOne(ActivityModel::class,'id','activity_id');
    }
    public function Project(){
        return $this->hasOne(ProjectModel::class,'id','projectid');
    }
}
