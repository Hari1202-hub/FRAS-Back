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

        $from    = $request->from ?? ($request->date ?? Carbon::now('Asia/Dubai')->format('Y-m-d'));
        $to      = $request->to   ?? $from;
        $perPage = (int) ($request->per_page ?? 25);
        $page    = (int) ($request->page    ?? 1);

        // Pre-aggregate attendance rows (checkin + checkout are separate rows)
        // per (emp_guid × date) so we get first check-in and last check-out correctly.
        $attSub = DB::table('tbl_user_checin_checkout as c')
            ->whereRaw("c.date BETWEEN ? AND ?", [$from, $to])
            ->selectRaw("
                c.emp_id                                                           AS emp_guid,
                c.date                                                             AS att_date,
                MIN(CASE WHEN c.checkin  IS NOT NULL THEN c.project_id END)        AS project_id,
                MIN(c.checkin)                                                     AS checkin,
                MAX(c.checkout)                                                    AS checkout,
                MIN(CASE WHEN c.checkin  IS NOT NULL THEN c.checkin_lat   END)     AS checkin_lat,
                MIN(CASE WHEN c.checkin  IS NOT NULL THEN c.checkin_lang  END)     AS checkin_lang,
                MAX(CASE WHEN c.checkout IS NOT NULL THEN c.checkout_lat  END)     AS checkout_lat,
                MAX(CASE WHEN c.checkout IS NOT NULL THEN c.checkout_lang END)     AS checkout_lang,
                COALESCE(NULLIF(MAX(CASE WHEN c.checkin IS NOT NULL THEN c.attendance_type END),''),'Regular') AS attendance_type
            ")
            ->groupBy('c.emp_id', 'c.date');

        $query = DB::table('tbl_user as u')
            ->leftJoin('tbl_userlogin as ul', 'ul.user_id', '=', 'u.id')
            ->leftJoinSub($attSub, 'att', DB::raw('att.emp_guid::text'), '=', DB::raw('u.guid::text'))
            ->leftJoin('tbl_project as p', DB::raw('p.guid::text'), '=', DB::raw('att.project_id::text'))
            ->leftJoin('tbl_mastervalue as cat', function ($j) {
                $j->on('cat.code', '=', 'u.category_code')->whereRaw("cat.master_key = 'CATEGORY'");
            })
            ->leftJoin('tbl_mastervalue as cls', function ($j) {
                $j->on('cls.code', '=', 'u.classification_code')->whereRaw("cls.master_key = 'CLASSIFICATION'");
            })
            ->leftJoin('tbl_entity as e', DB::raw('e.id::text'), '=', DB::raw('u.entity_id::text'))
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
            $query->whereRaw('att.project_id::text = ?', [$request->project]);
        }
        if ($request->filled('search_emp')) {
            $query->where('ul.emp_id', 'ILIKE', '%' . $request->search_emp . '%');
        }
        if ($request->filled('search_name')) {
            $query->where('u.name', 'ILIKE', '%' . $request->search_name . '%');
        }

        $query->selectRaw("
            u.guid                 AS emp_guid,
            u.name                 AS employee_name,
            ul.emp_id              AS emp_id,
            e.entityname,
            cat.description        AS category,
            cls.description        AS classification,
            p.projectid            AS project_code,
            p.projectname,
            att.att_date           AS date,
            att.checkin,
            att.checkout,
            att.checkin_lat,
            att.checkin_lang,
            att.checkout_lat,
            att.checkout_lang,
            att.attendance_type,
            CASE
                WHEN att.checkout IS NOT NULL AND att.checkin IS NOT NULL
                THEN TO_CHAR(
                    CASE
                        WHEN att.checkout >= att.checkin
                        THEN (att.checkout - att.checkin)
                        ELSE (att.checkout - att.checkin + INTERVAL '24 hours')
                    END, 'HH24:MI:SS')
                ELSE NULL
            END AS worked_hours,
            CASE
                WHEN att.checkin IS NULL AND att.checkout IS NULL THEN 'Absent'
                WHEN att.checkout IS NULL                         THEN 'Checked-In Only'
                ELSE 'Present'
            END AS attendance_status
        ")
        ->orderByRaw('u.name ASC, att.att_date ASC');

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

        $records = DB::table('tbl_user_checin_checkout as c')
            ->leftJoin('tbl_project as p', DB::raw('p.guid::text'), '=', DB::raw('c.project_id::text'))
            ->where('c.emp_id', $request->emp_id)
            ->whereDate('c.date', $request->date)
            ->orderBy('c.created_at', 'asc')
            ->select([
                'c.id', 'c.checkin', 'c.checkout',
                'c.checkin_lat', 'c.checkin_lang',
                'c.checkout_lat', 'c.checkout_lang',
                'c.checkin_image', 'c.checkout_image',
                'c.attendance_type', 'c.created_at',
                'p.projectid as project_code', 'p.projectname',
            ])
            ->get()
            ->map(function ($rec) {
                $rec->event_type   = $rec->checkin  ? ($rec->checkout ? 'Both' : 'Check-In')  : 'Check-Out';
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

    /**
     * Facial Recognition Report.
     *
     * Returns one row per (employee × project × date × attendance_type),
     * with the FIRST check-in and LAST check-out for that group and
     * duration in decimal hours (rounded to 2 dp).
     *
     * Query params:
     *   from           – Y-m-d  (default today)
     *   to             – Y-m-d  (default = from)
     *   entity         – entity id
     *   project        – project id or guid
     *   timekeeper     – emp_id partial match
     *   employee_id    – emp_id partial match
     *   classification – classification code
     *   status         – attendance_type value (e.g. Regular, Sick, Official Duty)
     *   per_page       – default 50
     *   page           – default 1
     */
    public function facialRecognition(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'from'           => 'nullable|date_format:Y-m-d',
            'to'             => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'entity'         => 'nullable',
            'project'        => 'nullable',
            'timekeeper'     => 'nullable|string',
            'employee_id'    => 'nullable|string',
            'classification' => 'nullable|string',
            'status'         => 'nullable|string',
            'per_page'       => 'nullable|integer|min:1|max:5000',
            'page'           => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $from    = $request->from    ?? Carbon::now('Asia/Dubai')->format('Y-m-d');
        $to      = $request->to      ?? $from;
        $perPage = (int) ($request->per_page ?? 50);
        $page    = (int) ($request->page    ?? 1);

        // ── Level 1: aggregate raw attendance rows per (emp × project × date) ──────
        // Checkin and checkout are separate rows in the table.
        // Timekeeper and attendance_type come from the checkin row (where checkin IS NOT NULL).
        $innerSub = DB::table('tbl_user_checin_checkout as c')
            ->whereRaw('c.date BETWEEN ? AND ?', [$from, $to])
            ->selectRaw("
                c.emp_id,
                c.project_id,
                c.date,
                MIN(c.checkin)  AS first_checkin,
                MAX(c.checkout) AS last_checkout,
                MIN(CASE WHEN c.checkin IS NOT NULL THEN c.user_id END) AS timekeeper_user_id,
                COALESCE(
                    NULLIF(MAX(CASE WHEN c.checkin IS NOT NULL THEN c.attendance_type END), ''),
                    'Regular'
                ) AS status
            ")
            ->groupBy('c.emp_id', 'c.project_id', 'c.date');

        // ── Level 2: join dimension tables onto the pre-aggregated result ──────────
        $q = DB::table(DB::raw("({$innerSub->toSql()}) AS agg"))
            ->mergeBindings($innerSub)
            ->join('tbl_user as u', DB::raw('u.guid::text'), '=', DB::raw('agg.emp_id::text'))
            ->join('tbl_userlogin as ul', 'ul.user_id', '=', 'u.id')
            ->join('tbl_project as p', DB::raw('p.guid::text'), '=', DB::raw('agg.project_id::text'))
            ->join('tbl_entity as e', DB::raw('e.id::text'), '=', DB::raw('p.entity_id::text'))
            ->leftJoin('tbl_mastervalue as cls', function ($j) {
                $j->on('cls.code', '=', 'u.classification_code')
                  ->whereRaw("cls.master_key = 'CLASSIFICATION'");
            })
            ->leftJoin('tbl_user as tk', 'tk.id', '=', 'agg.timekeeper_user_id')
            ->leftJoin('tbl_userlogin as tk_ul', 'tk_ul.user_id', '=', 'tk.id')
            ->where('u.isactive', true)
            ->where('u.id', '<>', 1);

        if ($request->filled('entity') && $request->entity !== 'all') {
            $q->whereRaw('p.entity_id::text = ?', [$request->entity]);
        }
        if ($request->filled('project') && $request->project !== 'all') {
            $q->whereRaw('(p.id::text = ? OR p.guid::text = ?)', [$request->project, $request->project]);
        }
        if ($request->filled('timekeeper')) {
            $q->where('tk_ul.emp_id', 'ILIKE', '%' . $request->timekeeper . '%');
        }
        if ($request->filled('employee_id')) {
            $q->where('ul.emp_id', 'ILIKE', '%' . $request->employee_id . '%');
        }
        if ($request->filled('classification') && $request->classification !== 'all') {
            $q->where('u.classification_code', $request->classification);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $q->where('agg.status', $request->status);
        }

        $q->selectRaw("
            e.entityname,
            p.projectid                        AS project_code,
            p.projectname,
            COALESCE(tk_ul.emp_id, '')         AS timekeeper_id,
            COALESCE(tk.name, '')              AS timekeeper_name,
            ul.emp_id                          AS employee_id,
            u.name                             AS employee_name,
            u.guid                             AS emp_guid,
            COALESCE(cls.description, '')      AS classification,
            agg.date                           AS report_date,
            agg.first_checkin,
            agg.last_checkout,
            CASE
                WHEN agg.last_checkout IS NOT NULL AND agg.first_checkin IS NOT NULL
                THEN ROUND(
                    CAST(
                        EXTRACT(EPOCH FROM (
                            CASE
                                WHEN agg.last_checkout >= agg.first_checkin
                                THEN (agg.last_checkout - agg.first_checkin)
                                ELSE (agg.last_checkout - agg.first_checkin + INTERVAL '24 hours')
                            END
                        )) / 3600.0
                    AS NUMERIC), 2)
                ELSE NULL
            END AS duration_hours,
            agg.status
        ")
        ->orderByRaw('agg.date ASC, e.entityname ASC, p.projectname ASC, ul.emp_id ASC');

        // GROUP BY queries need a wrapper subquery for accurate pagination count
        $total = DB::table(DB::raw("({$q->toSql()}) AS fr_sub"))
            ->mergeBindings($q)
            ->count();

        $items   = (clone $q)->skip(($page - 1) * $perPage)->take($perPage)->get();
        $lastPage = $total > 0 ? (int) ceil($total / $perPage) : 1;

        return response()->json([
            'success' => true,
            'status'  => 200,
            'message' => 'Facial recognition report fetched.',
            'data'    => $items,
            'meta'    => [
                'current_page' => $page,
                'last_page'    => max(1, $lastPage),
                'per_page'     => $perPage,
                'total'        => $total,
            ],
        ]);
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
