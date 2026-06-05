<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\CheckinModel;
use App\Models\EntrolledImageModel;
use App\Models\ProjectModel;
use App\Models\TplUserModel;

class DashboardController extends BaseController
{
    /**
     * Dashboard statistics.
     *
     * Query params:
     *   date   – Y-m-d (default today)
     *   entity – entity id (filter project-based stats)
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'   => 'nullable|date_format:Y-m-d',
            'entity' => 'nullable',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $ctx        = $this->authContext();
        $entityId   = $ctx['entity_id']; // null = super admin (no restriction)

        $date       = $request->date ?? date('Y-m-d');
        $yesterday  = Carbon::yesterday()->toDateString();
        $weekStart  = Carbon::today()->subDays(6)->toDateString();
        $monthStart = Carbon::today()->subDays(29)->toDateString();

        // ── Staff counts ──────────────────────────────────────────────────────
        $staffQ = TplUserModel::where('isactive', true)->where('id', '<>', 1);
        if ($entityId) $staffQ->where('entity_id', $entityId);
        $totalActive = $staffQ->count();

        $enrollQ = DB::table('tbl_entrolled_image as ei')
            ->join('tbl_user as u', 'u.guid', '=', 'ei.empguid');
        if ($entityId) $enrollQ->where('u.entity_id', $entityId);
        $totalEnrolled   = $enrollQ->count();
        $totalUnenrolled = max(0, $totalActive - $totalEnrolled);

        // ── Check-in / Check-out counts for selected date ──────────────────────
        $checkedInToday  = $this->distinctCheckins($date, 'checkin',  $entityId);
        $checkedOutToday = $this->distinctCheckins($date, 'checkout', $entityId);
        $stillInside     = max(0, $checkedInToday - $checkedOutToday);
        $absent          = max(0, $totalActive - $checkedInToday);

        // ── Trends: last 7 days per-day breakdown ─────────────────────────────
        $trend = $this->getDailyTrend($weekStart, $date, $entityId);

        // ── Project-based check-in breakdown for selected date ─────────────────
        $effectiveEntity = $entityId ?? $request->entity;
        $projectBreakdown = $this->getProjectBreakdown($date, $effectiveEntity);

        // ── New enrollments this week / month ─────────────────────────────────
        $weekEnrollQ  = DB::table('tbl_entrolled_image as ei')
            ->join('tbl_user as u', 'u.guid', '=', 'ei.empguid')
            ->whereDate('ei.created_at', '>=', $weekStart);
        $monthEnrollQ = DB::table('tbl_entrolled_image as ei')
            ->join('tbl_user as u', 'u.guid', '=', 'ei.empguid')
            ->whereDate('ei.created_at', '>=', $monthStart);
        if ($entityId) {
            $weekEnrollQ->where('u.entity_id', $entityId);
            $monthEnrollQ->where('u.entity_id', $entityId);
        }
        $enrolledThisWeek  = $weekEnrollQ->count();
        $enrolledThisMonth = $monthEnrollQ->count();

        // ── Top projects by check-ins today ───────────────────────────────────
        $topQ = DB::table('tbl_user_checin_checkout as c')
            ->leftJoin('tbl_project as p', DB::raw('p.id::text'), '=', DB::raw('c.project_id::text'))
            ->whereDate('c.date', $date)
            ->whereNotNull('c.checkin');
        if ($entityId) {
            $topQ->join('tbl_user as u', DB::raw('u.guid::text'), '=', DB::raw('c.emp_id::text'))
                 ->where('u.entity_id', $entityId);
        }
        $topProjects = $topQ->selectRaw("p.projectname, COUNT(DISTINCT c.emp_id) AS checkin_count")
            ->groupBy('p.projectname')
            ->orderByDesc('checkin_count')
            ->limit(5)
            ->get();

        // ── Active projects count ─────────────────────────────────────────────
        $projQ = ProjectModel::where('isactive', true);
        if ($entityId) $projQ->where('entity_id', $entityId);
        $totalProjects = $projQ->count();

        return $this->success([
            'date' => $date,

            'staff' => [
                'total_active'     => $totalActive,
                'total_enrolled'   => $totalEnrolled,
                'total_unenrolled' => $totalUnenrolled,
                'enrolled_this_week'  => $enrolledThisWeek,
                'enrolled_this_month' => $enrolledThisMonth,
            ],

            'attendance' => [
                'checked_in'   => $checkedInToday,
                'checked_out'  => $checkedOutToday,
                'still_inside' => $stillInside,
                'absent'       => $absent,
            ],

            'projects' => [
                'total_active'      => $totalProjects,
                'checkins_by_project' => $projectBreakdown,
                'top_projects_today'  => $topProjects,
            ],

            'trend_last_7_days' => $trend,
        ], 'Dashboard data fetched.', 200, $request, 'dashboard');
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function distinctCheckins(string $date, string $column, $entityId = null): int
    {
        $q = DB::table('tbl_user_checin_checkout as c')
            ->whereDate('c.date', $date)
            ->whereNotNull("c.{$column}");

        if ($entityId) {
            $q->join('tbl_user as u', DB::raw('u.guid::text'), '=', DB::raw('c.emp_id::text'))
              ->where('u.entity_id', $entityId);
        }

        return $q->distinct('c.emp_id')->count('c.emp_id');
    }

    private function getDailyTrend(string $from, string $to, $entityId = null): array
    {
        $q = DB::table('tbl_user_checin_checkout as c')
            ->whereBetween(DB::raw('c.date::date'), [$from, $to]);

        if ($entityId) {
            $q->join('tbl_user as u', DB::raw('u.guid::text'), '=', DB::raw('c.emp_id::text'))
              ->where('u.entity_id', $entityId);
        }

        $rows = $q->selectRaw("
                c.date::date AS day,
                COUNT(DISTINCT c.emp_id) FILTER (WHERE c.checkin IS NOT NULL)  AS checked_in,
                COUNT(DISTINCT c.emp_id) FILTER (WHERE c.checkout IS NOT NULL) AS checked_out
            ")
            ->groupBy(DB::raw('c.date::date'))
            ->orderBy(DB::raw('c.date::date'))
            ->get();

        return $rows->map(fn($r) => [
            'date'        => $r->day,
            'checked_in'  => (int) $r->checked_in,
            'checked_out' => (int) $r->checked_out,
        ])->values()->toArray();
    }

    private function getProjectBreakdown(string $date, $entityId = null): array
    {
        $query = DB::table('tbl_user_checin_checkout as c')
            ->leftJoin('tbl_project as p', DB::raw('p.id::text'), '=', DB::raw('c.project_id::text'))
            ->leftJoin('tbl_entity as e',  DB::raw('e.id::text'), '=', DB::raw('p.entity_id::text'))
            ->whereDate('c.date', $date)
            ->whereNotNull('c.checkin')
            ->selectRaw("
                p.guid           AS project_guid,
                p.projectname,
                e.entityname,
                COUNT(DISTINCT c.emp_id) FILTER (WHERE c.checkin  IS NOT NULL) AS checked_in,
                COUNT(DISTINCT c.emp_id) FILTER (WHERE c.checkout IS NOT NULL) AS checked_out
            ")
            ->groupBy('p.guid', 'p.projectname', 'e.entityname');

        if ($entityId) {
            $query->whereRaw('p.entity_id::text = ?', [$entityId]);
        }

        return $query->orderByDesc('checked_in')->get()->map(fn($r) => [
            'project_guid' => $r->project_guid,
            'projectname'  => $r->projectname,
            'entityname'   => $r->entityname,
            'checked_in'   => (int) $r->checked_in,
            'checked_out'  => (int) $r->checked_out,
            'still_inside' => max(0, (int) $r->checked_in - (int) $r->checked_out),
        ])->values()->toArray();
    }
}
