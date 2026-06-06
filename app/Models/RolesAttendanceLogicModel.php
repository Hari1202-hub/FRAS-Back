<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolesAttendanceLogicModel extends BaseModel
{
    protected $table    = 'tbl_role_attendance_logic';
    protected $fillable = ['role_id','attendace_type_id','project_required','location_required','comment_required','default_comment','description'];

    public function Roles(){
        return $this->belongsTo(RoleModel::class,'role_id','id');
    }
    public function AttendanceTypes(){
        return $this->belongsTo(AttendaceTypeModel::class,'attendace_type_id','id');
    }
}
