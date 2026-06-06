<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendaceTypeModel extends BaseModel
{
    protected $table    = 'tbl_attendance_type';
    protected $fillable = ['guid','attendance_type','description','isactive'];
}
