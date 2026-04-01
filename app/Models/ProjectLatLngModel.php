<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectLatLngModel extends Model
{
    protected $table    = 'tbl_project_lat_lng';
    protected $fillable = ['project_id','latitude','longitude'];
}
