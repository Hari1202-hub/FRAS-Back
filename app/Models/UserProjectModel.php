<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProjectModel extends BaseModel
{
    public $timestamps = true;
    protected $table    = 'tbl_user_project';
    protected $fillable = ['user_id','project_id'];
    public function Project()
    {
        return $this->belongsTo(ProjectModel::class,  'project_id', 'id');
    }


    public function Entity()
    {
        return $this->hasOneThrough(
            EntityModel::class,    // Final model
            ProjectModel::class,    // Intermediate model
            'entity_id',   // Foreign key on users table...
            'id',      // Foreign key on posts table...
            'project_id',           // Local key on countries table...
            'id'            // Local key on users table...
        );
    }


    public function User()
{
    return $this->belongsTo(TplUserModel::class,'user_id','id');
}


}