<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TplUserModel extends Model
{
    protected $table    = 'tbl_user';
    protected $fillable = ['name', 'guid', 'email', 'mobile', 'category_code', 'classification_code', 'entity_id', 'loginmethod_code', 'isactive'];
    public function User()
    {
        return $this->belongsTo(User::class, 'id', 'user_id');
    }
    public function EnrolledImages()
    {
        return $this->hasOne(EntrolledImageModel::class, 'empguid', 'guid');
    }
    public function Project()
    {
        return $this->hasOneThrough(
            ProjectModel::class,
            UserProjectModel::class,
            'user_id',
            'id',
            'id',
            'project_id'
        );
    }
    public function ProjectLatLngs()
    {
        return $this->hasManyThrough(
            ProjectLatLngModel::class, // Final model
            ProjectModel::class,       // Intermediate model
            'entity_id',               // Foreign key on ProjectModel
            'project_id',              // Foreign key on ProjectLatLngModel
            'entity_id',               // Local key on TplUserModel
            'id'                       // Local key on ProjectModel
        );
    }
    public function Roles()
    {
        return $this->belongsToMany(RoleModel::class, 'tbl_user_role', 'user_id', 'role_id');
    }
    public function Entities()
    {
        return $this->belongsTo(EntityModel::class,  'entity_id', 'id');
    }
    public function Classifications()
    {
        return $this->hasOne(MasterValueModel::class,  'code', 'classification_code');
    }
    public function Categories()
    {
        return $this->hasOne(MasterValueModel::class,  'code', 'category_code');
    }
    public function Checkin()
    {
        return $this->belongsTo(CheckinModel::class, 'guid', 'emp_id');
    }


    public function checkinCheckout()
    {
        return $this->hasMany(CheckinModel::class, 'emp_id', 'guid');
    }

    public function faceEnrolled(){
        return $this->hasOne(EntrolledImageModel::class,'empguid', 'guid');
    }
}
