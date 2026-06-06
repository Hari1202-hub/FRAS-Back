<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRoleModel extends BaseModel
{
    protected $table    = 'tbl_user_role';
    protected $fillable = ['user_id','role_id'];
    public function Roles()
    {
        return $this->hasOne(RoleModel::class,  'id', 'role_id');
    }
    public function User()
    {
        return $this->hasOne(TplUserModel::class,  'id', 'user_id');
    }
}
