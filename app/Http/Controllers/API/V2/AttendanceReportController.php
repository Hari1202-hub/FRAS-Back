<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\CheckinModel;
use App\Models\TplUserModel;
use App\Models\User;

class AttendanceReportController extends BaseController
{
    /**
     * Paginated attendance report for a date range / filters.
     *
     * Query params:
     *   date            – Y-m-d (default today)
     *   from            – Y-m-d (overrides date, requires 'to')
     *   to              – Y-m-d
     *   entity          – entity id
     *   category        – category code
     *   classification  – classification code
     *   project         – project id/guid
     *   search_emp      – emp_id partial
     *   search_name     – name partial
     *   per_page        – default 25
     *   page            – default 1
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'           => 'nullable|date_format:Y-m-d',
            'from'           => 'nullable|date_format:Y-m-d',
            'to'             => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'entity'         => 'nullable',
            'category'       => 'nullable|string',
            'classification' => 'nullable|string',
            'project'        => 'nullable',
            'search_emp'     => 'nullable|string',
            'search_name'    => 'nullable|string',
            'per_page'       => 'nullable|integer|min:1',
            'page'           => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $date    = $request->date ?? date('Y-m-d');
        $perPage = (int) ($request->per_page ?? 25);
        $page    = (int) ($request->page ?? 1);

        $query = DB::table('tbl_user as u')
            ->leftJoin('tbl_userlogin as ul', 'ul.user_id', '=', 'u.id')
            ->leftJoin('tbl_user_checin_checkout as c', function ($join) use ($request, $date) {
                $join->on(DB::raw('c.emp_id::text'), '=', DB::raw('u.guid::text'));

                if ($request->filled('from') && $request->filled('to')) {
                    $join->whereRaw('c.date::date BETWEEN ? AND ?', [$request->from, $request->to]);
                } else {
                    $join->whereRaw('c.date::date = ?', [$date]);
                }
            })
            ->leftJoin('tbl_project as p', fn($j) => $j->on(DB::raw('p.id::text'), '=', DB::raw('c.project_id::text')))
            ->leftJoin('tbl_mastervalue as cat', 'cat.code', '=', 'u.category_code')
            ->leftJoin('tbl_mastervalue as cls', 'cls.code', '=', 'u.classification_code')
            ->leftJoin('tbl_entity as e', fn($j) => $j->on(DB::raw('e.id::text'), '=', DB::raw('u.entity_id::text')))
            ->where('u.isactive', true)
            ->where('u.id', '<>', 1);

        if ($request->filled('entity') && $request->entity !== 'all') {
            $query->whereRaw('u.entity_id::text = ?', [$request->entity]);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('u.category_code', $request->category);
        }

        if ($request->filled('classification') && $request->classification !== 'all') {
            $query->where('u.classification_code', $request->classification);
        }

        if ($request->filled('project') && $request->project !== 'all') {
            $query->whereRaw('c.project_id::text = ?', [$request->project]);
        }

        if ($request->filled('search_emp')) {
            $query->where('ul.emp_id', 'ILIKE', '%' . $request->search_emp . '%');
        }

        if ($request->filled('search_name')) {
            $query->where('u.name', 'ILIKE', '%' . $request->search_name . '%');
        }

        $query->selectRaw("
            DISTINCT ON (u.guid)
            u.guid          AS emp_guid,
            u.name          AS employee_name,
            ul.emp_id       AS emp_id,
            e.entityname,
            cat.description AS category,
            cls.description AS classification,
            p.projectname,
            c.date,
            c.checkin,
            c.checkout,
            c.checkin_lat,
            c.checkin_lang,
            c.checkout_lat,
            c.checkout_lang,
            CASE
                WHEN c.checkout IS NOT NULL
                THEN TO_CHAR((c.checkout - c.checkin), 'HH24:MI:SS')
                ELSE NULL
            END AS worked_hours,
            CASE
                WHEN c.emp_id IS NULL   THEN 'Absent'
                WHEN c.checkout IS NULL THEN 'Checked-In Only'
                ELSE 'Present'
            END AS attendance_status
        ")
        ->orderBy('u.guid')
        ->orderBy('c.id', 'desc');

        $reports = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'status'  => 200,
            'message' => 'Attendance report fetched.',
            'data'    => $reports->items(),
            'meta'    => [
                'current_page' => $reports->currentPage(),
                'last_page'    => $reports->lastPage(),
                'per_page'     => $reports->perPage(),
                'total'        => $reports->total(),
            ],
        ]);
    }

    /**
     * Individual staff attendance history.
     *
     * Query params:
     *   emp_id   – staff GUID (required)
     *   date     – specific date filter (Y-m-d)
     *   from     – date range start
     *   to       – date range end
     *   per_page – default 25
     */
    public function history(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'emp_id'   => 'required|string',
            'date'     => 'nullable|date_format:Y-m-d',
            'from'     => 'nullable|date_format:Y-m-d',
            'to'       => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'per_page' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $user = User::where('guid', $request->emp_id)->first();
        if (!$user) return $this->notFound('Staff member not found.');

        $perPage   = (int) ($request->per_page ?? 25);
        $transform = fn($rec) => $this->appendWorkedHours($rec);

        $base = CheckinModel::with(['Project', 'User', 'UserLogin'])
            ->where('user_id', $user->user_id);

        if ($request->filled('date')) {
            $base->whereDate('date', $request->date);
        } elseif ($request->filled('from') && $request->filled('to')) {
            $base->whereBetween('date', [$request->from, $request->to]);
        }

        $today     = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();

        $allPaged       = (clone $base)->orderBy('id', 'desc')->paginate($perPage)->through($transform);
        $todayPaged     = (clone $base)->whereDate('date', $today)->orderBy('id', 'desc')->paginate($perPage)->through($transform);
        $yesterdayPaged = (clone $base)->whereDate('date', $yesterday)->orderBy('id', 'desc')->paginate($perPage)->through($transform);
        $last7Paged     = (clone $base)->whereBetween('date', [Carbon::today()->subDays(6)->toDateString(), $today])->orderBy('id', 'desc')->paginate($perPage)->through($transform);
        $last30Paged    = (clone $base)->whereBetween('date', [Carbon::today()->subDays(29)->toDateString(), $today])->orderBy('id', 'desc')->paginate($perPage)->through($transform);

        $fmt = fn($p) => [
            'data'         => $p->items(),
            'current_page' => $p->currentPage(),
            'last_page'    => $p->lastPage(),
            'per_page'     => $p->perPage(),
            'total'        => $p->total(),
        ];

        return $this->success([
            'all'       => $fmt($allPaged),
            'today'     => $fmt($todayPaged),
            'yesterday' => $fmt($yesterdayPaged),
            'last_7_days'  => $fmt($last7Paged),
            'last_30_days' => $fmt($last30Paged),
        ], 'History fetched.', 200, $request, 'reports/history');
    }

    /**
     * Day-level detail for a staff member on a specific date.
     *
     * Query params: emp_id (GUID), date (Y-m-d)
     */
    public function dayDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'emp_id' => 'required|string',
            'date'   => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $records = DB::table('tbl_user_checin_checkout')
            ->where('emp_id', $request->emp_id)
            ->whereDate('date', $request->date)
            ->orderBy('checkin', 'asc')
            ->get([
                'id', 'checkin', 'checkout',
                'checkin_lat', 'checkin_lang',
                'checkout_lat', 'checkout_lang',
                'project_id', 'attendance_type', 'created_at',
            ])
            ->map(function ($rec) {
                $rec->worked_hours = ($rec->checkin && $rec->checkout)
                    ? $this->calcWorkedHours($rec->checkin, $rec->checkout)
                    : null;
                return $rec;
            });

        return $this->success([
            'date'    => $request->date,
            'emp_id'  => $request->emp_id,
            'records' => $records,
        ], 'Day details fetched.', 200, $request, 'reports/day-details');
    }

    /**
     * Quick attendance summary (counts) for a date.
     *
     * Query params: date (Y-m-d, default today)
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'   => 'nullable|date_format:Y-m-d',
            'entity' => 'nullable',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $date = $request->date ?? date('Y-m-d');

        $totalActive = TplUserModel::where('isactive', true)->where('id', '<>', 1)->count();
        $totalEnrolled = DB::table('tbl_entrolled_image')->count();
        $totalUnenrolled = $totalActive - $totalEnrolled;

        $checkedIn = DB::table('tbl_user_checin_checkout as c')
            ->whereDate('c.date', $date)
            ->whereNotNull('c.checkin')
            ->distinct('c.emp_id')
            ->count('c.emp_id');

        $checkedOut = DB::table('tbl_user_checin_checkout as c')
            ->whereDate('c.date', $date)
            ->whereNotNull('c.checkout')
            ->distinct('c.emp_id')
            ->count('c.emp_id');

        $absent      = $totalActive - $checkedIn;
        $stillInside = $checkedIn - $checkedOut;

        return $this->success([
            'date'            => $date,
            'total_active'    => $totalActive,
            'total_enrolled'  => $totalEnrolled,
            'total_unenrolled'=> max(0, $totalUnenrolled),
            'checked_in'      => $checkedIn,
            'checked_out'     => $checkedOut,
            'still_inside'    => max(0, $stillInside),
            'absent'          => max(0, $absent),
        ], 'Attendance summary.', 200, $request, 'reports/summary');
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function appendWorkedHours($item)
    {
        $item->worked_hours = $this->calcWorkedHours($item->checkin, $item->checkout);
        return $item->makeHidden(['user_id']);
    }

    private function calcWorkedHours(?string $in, ?string $out): string
    {
        if (!$in || !$out) return '';

        try {
            $inDt  = new \DateTime($in);
            $outDt = new \DateTime($out);
            return $outDt->diff($inDt)->format('%H:%I:%S');
        } catch (\Exception $e) {
            return '';
        }
    }
}
