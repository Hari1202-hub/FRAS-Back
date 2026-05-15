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

    /**
     * Return every active project (assigned to the user) whose Google Maps polygon
     * contains the given GPS coordinate.
     *
     * Polygon vertices are read from tbl_project_lat_lng (ordered by id asc).
     * Projects with fewer than 3 vertices are skipped.
     *
     * Matching mirrors the frontend isPointInPolygon() logic:
     *   1. Standard ray-casting (point strictly inside)
     *   2. Edge-buffer fallback: within $minBuffer metres of any polygon edge
     */
    public static function getProjectsContainingPoint(
        int   $user_id,
        float $testLat,
        float $testLng,
        float $minBuffer = 20.0
    ): \Illuminate\Support\Collection {
        // Load active projects assigned to the user, with their polygon vertices
        // ordered by id so the original drawing order is preserved.
        $projects = self::with([
                'ProjectLatLng' => fn($q) => $q->orderBy('id', 'asc'),
                'Entity',
                'UserProject',
            ])
            ->join('tbl_user_project as up', 'up.project_id', '=', 'tbl_project.id')
            ->where('tbl_project.isactive', true)
            ->where('up.user_id', $user_id)
            ->select('tbl_project.*')
            ->distinct()
            ->get();

        return $projects->filter(function ($project) use ($testLat, $testLng, $minBuffer) {
            $vertices = $project->ProjectLatLng;

            // Need at least 3 points to form a polygon
            if ($vertices->count() < 3) return false;

            $polygon = $vertices->map(fn($v) => [
                'latitude'  => (float) $v->latitude,
                'longitude' => (float) $v->longitude,
            ])->toArray();

            return self::pointInPolygon($testLat, $testLng, $polygon, $minBuffer);
        })->values();
    }

    /**
     * Port of the frontend isPointInPolygon():
     *
     *  1. Ray-casting (crossing-number) — point strictly inside polygon.
     *  2. Edge-buffer — point within $minBuffer metres of any polygon edge.
     *
     * Polygon vertices must be {latitude, longitude} associative arrays
     * (matches the format used by the Google Maps drawing tool on the frontend).
     */
    private static function pointInPolygon(
        float $testLat,
        float $testLng,
        array $polygon,
        float $minBuffer = 20.0
    ): bool {
        $n      = count($polygon);
        $inside = false;
        $j      = $n - 1;

        // ── 1. Standard ray-casting ──────────────────────────────────────────
        for ($i = 0; $i < $n; $i++) {
            $xi = (float) $polygon[$i]['latitude'];
            $yi = (float) $polygon[$i]['longitude'];
            $xj = (float) $polygon[$j]['latitude'];
            $yj = (float) $polygon[$j]['longitude'];

            $intersect = ($yi > $testLng) !== ($yj > $testLng)
                && $testLat < ($xj - $xi) * ($testLng - $yi)
                    / ($yj - $yi + PHP_FLOAT_EPSILON) + $xi;

            if ($intersect) $inside = !$inside;
            $j = $i;
        }

        if ($inside) return true;

        // ── 2. Edge-buffer fallback (GPS drift / boundary tolerance) ─────────
        for ($i = 0; $i < $n; $i++) {
            $next = ($i + 1) % $n;
            if (self::distanceToSegmentMeters(
                $testLat, $testLng,
                (float) $polygon[$i]['latitude'],    (float) $polygon[$i]['longitude'],
                (float) $polygon[$next]['latitude'], (float) $polygon[$next]['longitude']
            ) <= $minBuffer) {
                return true;
            }
        }

        return false;
    }

    /**
     * Shortest distance (metres) from point P to line segment V→W.
     * Port of the frontend distanceToSegmentMeters().
     */
    private static function distanceToSegmentMeters(
        float $latP, float $lonP,
        float $lat1, float $lon1,
        float $lat2, float $lon2
    ): float {
        $r    = 6371000.0; // Earth radius in metres
        $rad  = M_PI / 180.0;

        $φP = $latP * $rad;  $λP = $lonP * $rad;
        $φ1 = $lat1 * $rad;  $λ1 = $lon1 * $rad;
        $φ2 = $lat2 * $rad;  $λ2 = $lon2 * $rad;

        $dLat  = $φ2 - $φ1;
        $dLon  = $λ2 - $λ1;
        $denom = $dLat * $dLat + $dLon * $dLon;

        $t        = $denom > 0.0
            ? (($φP - $φ1) * $dLat + ($λP - $λ1) * $dLon) / $denom
            : 0.0;
        $tClamped = max(0.0, min(1.0, $t));

        $closestLat = $φ1 + $tClamped * $dLat;
        $closestLon = $λ1 + $tClamped * $dLon;

        $dLatP = $φP - $closestLat;
        $dLonP = $λP - $closestLon;

        $a = sin($dLatP / 2) ** 2
           + cos($φP) * cos($closestLat) * sin($dLonP / 2) ** 2;

        return $r * 2.0 * atan2(sqrt($a), sqrt(1.0 - $a));
    }

    // -------------------------------------------------------------------------
    // Legacy radius-based lookup (used by V1)
    // -------------------------------------------------------------------------

    public static function getProjectsWithinRadius($user_id, $lat, $lng, $radius = 300)
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

        $projectsRaw =  DB::table(DB::raw("({$innerQuery->toSql()}) as sub"))
            ->mergeBindings($innerQuery)
            ->where('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();

        $projectIds = $projectsRaw->pluck('id')->all();
        $projects = ProjectModel::with('ProjectLatLng')
            ->whereIn('id', $projectIds)
            ->get();

        // Check coordinates with OpenStreetMap Nominatim API
        foreach ($projects as $project) {
            $lat = $project->ProjectLatLng->first()->latitude ?? null;
            $lng = $project->ProjectLatLng->first()->longitude ?? null;
            if ($lat && $lng) {
                $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$lat}&lon={$lng}&zoom=10&addressdetails=1";
                $opts = [
                    "http" => [
                        "header" => "User-Agent: LaravelApp/1.0\r\n"
                    ]
                ];
                $context = stream_context_create($opts);
                $response = @file_get_contents($url, false, $context);
                if ($response !== false) {
                    $data = json_decode($response, true);
                    $project->osm_address = $data['display_name'] ?? null;
                } else {
                    $project->osm_address = null;
                }
            } else {
                $project->osm_address = null;
            }
        }

        return $projects;
    }

}
