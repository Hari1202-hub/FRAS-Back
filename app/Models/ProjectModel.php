<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ProjectModel extends Model
{
    public $timestamps = true;
    protected $table    = 'tbl_project';
    protected $fillable = ['guid','projectid','projectname','entity_id','location_shotname','location_longname','geog','latitude','longitude','isactive'];
    public function Entity(){
        return $this->hasOne(EntityModel::class,'id','entity_id');
    }
    
    public function UserProject(){
        return $this->hasOne(UserProjectModel::class,'project_id','id');
    }

    public function ProjectLatLng(){
        return $this->hasMany(ProjectLatLngModel::class,'project_id','id');
    }
    public static function getProjectsWithinRadius($user_id,$lat, $lng, $radius = 300)
    {
        $driver = DB::getDriverName();
        $latCast = $driver === 'pgsql' ? 'CAST(pl.latitude AS DOUBLE PRECISION)' : '(pl.latitude + 0)';
        $lngCast = $driver === 'pgsql' ? 'CAST(pl.longitude AS DOUBLE PRECISION)' : '(pl.longitude + 0)';

        $distanceExpr = "(6371000  * acos(
            cos(radians($lat)) 
            * cos(radians($latCast)) 
            * cos(radians($lngCast) - radians($lng)) 
            + sin(radians($lat)) 
            * sin(radians($latCast))
        ))";

        $latestSub = DB::table('tbl_project_lat_lng')
            ->select(DB::raw('MAX(id) as id'))
            ->groupBy('project_id');

        // Build inner query with distance calculation
        $innerQuery = DB::table('tbl_project as p')
            ->join('tbl_user_project as up', 'up.project_id', '=', 'p.id')
            ->join('tbl_project_lat_lng as pl', 'pl.project_id', '=', 'p.id')
            ->joinSub($latestSub, 'latest_pl', function ($join) {
                $join->on('pl.id', '=', 'latest_pl.id');
            })
            ->select(
                'p.id',
                'p.guid',
                'p.projectid',
                'p.projectname',
                'p.entity_id',
                'p.location_shotname',
                'p.location_longname',
                'p.geog',
                'p.isactive',
                'pl.latitude',
                'pl.longitude',
                DB::raw("$distanceExpr AS distance")
            )
            ->where('p.isactive', true)
            ->where('up.user_id', $user_id);

        // Now filter by distance in outer query
        $projectsRaw =  DB::table(DB::raw("({$innerQuery->toSql()}) as sub"))
            ->mergeBindings($innerQuery) // import bindings from inner query
            ->where('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();

        $projectIds = $projectsRaw->pluck('id')->all();
        $projects = ProjectModel::with('ProjectLatLng')
            ->whereIn('id', $projectIds)
            ->get();
        return $projects;
    }

}
