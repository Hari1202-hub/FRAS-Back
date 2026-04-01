<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleModel extends Model
{
    public $timestamps = true;
    protected $table    = 'tbl_role';
    protected $fillable = ['guid','rolename','rolecode','roledesc','web_permission','mobile_permission','isactive','createdby','updatedby'];

    public function AttendanceLogic()
    {
        return $this->hasOne(RolesAttendanceLogicModel::class, 'role_id', 'id');
    }
}
