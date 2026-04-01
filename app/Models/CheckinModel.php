<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckinModel extends Model
{
    protected $table    = 'tbl_user_checin_checkout';
protected $fillable = [
        'guid', 
        'user_id', 
        'emp_id', 
        'project_id', 
        'date', 
        'checkin', 
        'checkout', 
        'attendance_type',
        'checkout_project_id',
        'checkin_lat',
        'checkin_lang',
        'checkout_lat',
        'checkout_lang',
        'checkin_is_manual',
        'checkout_is_manual',
        'checkin_image',
        'checkout_image'
    ];
    public function getProjectIdAttribute($value)
    {
        return empty($value) ? null : $value;
    }

    // Mutator to ensure project_id is null if an empty string is passed
    public function setProjectIdAttribute($value)
    {
        $this->attributes['project_id'] = empty($value) ? null : $value;
    }
    public function Project()
    {
        return $this->hasOne(ProjectModel::class, 'guid', 'project_id');
    }
    public function CreatedUser()
    {
        return $this->belongsTo(TplUserModel::class, 'user_id', 'id');
    }
    public function User()
    {
        return $this->hasOne(TplUserModel::class, 'guid', 'emp_id');
    }
    public function UserLogin()
    {
        return $this->hasOne(User::class, 'guid', 'emp_id');
    }
    public function Entity()
    {
        return $this->hasOneThrough(
            EntityModel::class,
            ProjectModel::class,
            'guid',         // Foreign key on ProjectModel (local key in CheckinModel)
            'id',           // Foreign key on EntityModel
            'project_id',   // Local key on CheckinModel
            'entity_id'     // Local key on ProjectModel
        );
    }
    public function Classification()
    {
        return $this->hasOneThrough(
            MasterValueModel::class,
            TplUserModel::class,
            'id',         // Foreign key on TplUserModel (local key in CheckinModel)
            'code',         // Foreign key on MasterVlaueModel
            'user_id',   // Local key on CheckinModel
            'classification_code'     // Local key on TplUserModel
        )->where('master_key', 'CLASSIFICATION');
    }
    public function Category()
    {
        return $this->hasOneThrough(
            MasterValueModel::class,
            TplUserModel::class,
            'id',         // Foreign key on TplUserModel (local key in CheckinModel)
            'code',         // Foreign key on MasterVlaueModel
            'user_id',   // Local key on CheckinModel
            'category_code'     // Local key on TplUserModel
        )->where('master_key', 'CATEGORY');
    }
}
