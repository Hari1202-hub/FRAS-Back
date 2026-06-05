<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\CheckinModel;
use App\Models\TplUserModel;
use App\Models\RolesAttendanceLogicModel;

class AttendanceController extends BaseController
{
    private const COOLDOWN_SECONDS = 10;

    /** Timezone all attendance times are stored in (UAE). */
    private const STORE_TIMEZONE = 'Asia/Dubai';

    // =========================================================================
    // CHECK-IN
    // =========================================================================

    /**
     * POST /api/v2/attendance/checkin
     *
     * Body: empguid, date_time (Y-m-d H:i:s), project?, latitude?, longitude?, blob?
     */
    public function checkIn(Request $request)
    {
        $validator = $this->attendanceValidator($request);
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $authUser      = Auth::guard('api')->user();
        [$date, $time] = $this->parseDateTimeToDubai($request->date_time, $request->timezone, $request);

        // Resolve role attendance logic:
        // Priority 1 — role_id explicitly passed in the request body
        // Priority 2 — logged-in performing user's own role(s)
        $logic          = $this->resolveRoleLogic($request->role_id ? (string) $request->role_id : null, $authUser->user_id);
        $attendanceType = $logic?->AttendanceTypes?->attendance_type ?? '';

        if ($logic) {
            if ($logic->project_required && empty($request->project)) {
                return $this->error('Project is required for check-in based on the role configuration.', 422);
            }
            if ($logic->location_required && (!$request->filled('latitude') || !$request->filled('longitude'))) {
                return $this->error('Location (latitude & longitude) is required for check-in based on the role configuration.', 422);
            }
        }

        // Cooldown: block if the same employee checked in within the last N seconds.
        $last = CheckinModel::where('emp_id', $request->empguid)
            ->whereNotNull('checkin')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($last && $last->created_at->diffInSeconds(now()) < self::COOLDOWN_SECONDS) {
            return $this->error('Please wait a moment before checking in again.', 429);
        }

        $record                  = new CheckinModel();
        $record->guid            = Str::uuid();
        $record->checkin         = $time;
        $record->date            = $date;
        $record->emp_id          = $request->empguid;
        $record->user_id         = $authUser->user_id;
        $record->project_id      = $request->project ?? '';
        $record->checkin_lat     = $request->filled('latitude')  ? $request->latitude  : null;
        $record->checkin_lang    = $request->filled('longitude') ? $request->longitude : null;
        $record->attendance_type = $attendanceType;
        $record->checkin_image   = $this->saveBlob($request->blob, 'checkin');
        $record->save();

        return $this->success($record, 'Checked in successfully.', 200, $request, 'attendance/checkin');
    }

    // =========================================================================
    // CHECK-OUT
    // =========================================================================

    /**
     * POST /api/v2/attendance/checkout
     *
     * Body: empguid, date_time (Y-m-d H:i:s), project?, latitude?, longitude?, blob?
     */
    public function checkOut(Request $request)
    {
        $validator = $this->attendanceValidator($request);
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $authUser      = Auth::guard('api')->user();
        [$date, $time] = $this->parseDateTimeToDubai($request->date_time, $request->timezone, $request);

        // Resolve role attendance logic — same priority as check-in
        $logic          = $this->resolveRoleLogic($request->role_id ? (string) $request->role_id : null, $authUser->user_id);
        $attendanceType = $logic?->AttendanceTypes?->attendance_type ?? '';

        if ($logic) {
            if ($logic->project_required && empty($request->project)) {
                return $this->error('Project is required for check-out based on the role configuration.', 422);
            }
            if ($logic->location_required && (!$request->filled('latitude') || !$request->filled('longitude'))) {
                return $this->error('Location (latitude & longitude) is required for check-out based on the role configuration.', 422);
            }
        }

        // Cooldown: block if the same employee checked out within the last N seconds.
        $last = CheckinModel::where('emp_id', $request->empguid)
            ->whereNotNull('checkout')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($last && $last->created_at->diffInSeconds(now()) < self::COOLDOWN_SECONDS) {
            return $this->error('Please wait a moment before checking out again.', 429);
        }

        $record                  = new CheckinModel();
        $record->guid            = Str::uuid();
        $record->checkout        = $time;
        $record->date            = $date;
        $record->emp_id          = $request->empguid;
        $record->user_id         = $authUser->user_id;
        $record->project_id      = $request->project ?? '';
        $record->checkout_lat    = $request->filled('latitude')  ? $request->latitude  : null;
        $record->checkout_lang   = $request->filled('longitude') ? $request->longitude : null;
        $record->attendance_type = $attendanceType;
        $record->checkout_image  = $this->saveBlob($request->blob, 'checkout');
        $record->save();

        return $this->success($record, 'Checked out successfully.', 200, $request, 'attendance/checkout');
    }

    // =========================================================================
    // LISTING
    // =========================================================================

    /**
     * GET /api/v2/attendance/checked-in
     * All records that have a checkin for a given date.
     *
     * Query params: date (default today), emp_id, project, per_page
     */
    public function checkedIn(Request $request)
    {
        $validator = $this->listValidator($request);
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $date      = $request->date ?? date('Y-m-d');
        $paginator = $this->buildListQuery($date, $request, checkinOnly: true)
            ->orderBy('checkin', 'desc')
            ->paginate((int) ($request->per_page ?? 25));

        return $this->paginated($paginator, "Check-in records for {$date}.");
    }

    /**
     * GET /api/v2/attendance/checked-out
     * Records that have a checkin but are still waiting for checkout.
     *
     * Query params: date (default today), emp_id, project, per_page
     */
    public function checkedOut(Request $request)
    {
        $validator = $this->listValidator($request);
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $date      = $request->date ?? date('Y-m-d');
        $paginator = $this->buildListQuery($date, $request, checkinOnly: false)
            ->whereNull('checkout')
            ->orderBy('checkin', 'desc')
            ->paginate((int) ($request->per_page ?? 25));

        $paginator->getCollection()->transform(function ($rec) {
            $rec->worked_hours = $this->calcWorkedHours($rec->checkin, $rec->checkout);
            return $rec;
        });

        return $this->paginated($paginator, "Pending check-outs for {$date}.");
    }

    // =========================================================================
    // SHARED PRIVATE LOGIC
    // =========================================================================

    /**
     * Common validator for checkin / checkout POST bodies.
     */
    private function attendanceValidator(Request $request): \Illuminate\Validation\Validator
    {
        return Validator::make($request->all(), [
            'empguid'   => 'required|string',
            'date_time' => 'required|date_format:Y-m-d H:i:s',
            // NOTE: intentionally not using the strict `timezone` rule. An unknown
            // or misspelled id (e.g. "Asia/Kolkatha") must NOT reject the request;
            // it is normalized / safely handled in parseDateTimeToDubai().
            'timezone'  => 'nullable|string',
            'role_id'   => 'nullable|string',
            'project'   => 'nullable|string',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'blob'      => 'nullable|string',
        ]);
    }

    /**
     * Parse a naive "Y-m-d H:i:s" string into the device's source timezone,
     * then forcefully convert it to Asia/Dubai (UAE) and return [date, time].
     *
     * Source timezone resolution order:
     *   1. The `timezone` field in the request body (if valid).
     *   2. The timezone of the device's IP address (geo lookup).
     *   3. Asia/Dubai — the value is stored unchanged.
     */
    private function parseDateTimeToDubai(string $dateTimeStr, ?string $clientTz, Request $request): array
    {
        $targetTz = new \DateTimeZone(self::STORE_TIMEZONE);

        // 1. Body timezone first, 2. fall back to IP-derived timezone,
        // 3. finally treat the wall-clock time as already being UAE time.
        $sourceTz = $this->resolveTimezone($clientTz)
            ?: $this->timezoneFromIp($request->ip())
            ?: $targetTz;

        $dt = \DateTime::createFromFormat('Y-m-d H:i:s', $dateTimeStr, $sourceTz);

        if (!$dt) {
            // Fallback: parse leniently in the source timezone.
            try {
                $dt = new \DateTime($dateTimeStr, $sourceTz);
            } catch (\Exception $e) {
                $dt = new \DateTime('now', $targetTz);
            }
        }

        // Always store in UAE timezone, regardless of where it was captured.
        $dt->setTimezone($targetTz);

        return [$dt->format('Y-m-d'), $dt->format('H:i:s')];
    }

    /**
     * Turn a timezone id string into a valid DateTimeZone, or null if it is
     * empty / not a real IANA id. Never throws.
     */
    private function resolveTimezone(?string $tz): ?\DateTimeZone
    {
        if ($tz === null || trim($tz) === '') {
            return null;
        }

        $tz = trim($tz);

        // Verify against the real IANA list so bad ids never reach the
        // DateTimeZone constructor (which would throw "invalid timezone id").
        if (!in_array($tz, \DateTimeZone::listIdentifiers(), true)) {
            return null;
        }

        try {
            return new \DateTimeZone($tz);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Resolve the timezone of a device from its IP address using a geo lookup.
     * Result is cached per-IP for a day. Returns null for private/reserved IPs
     * or when the lookup fails. Never throws.
     */
    private function timezoneFromIp(?string $ip): ?\DateTimeZone
    {
        // No public geo data exists for missing / private / reserved addresses
        // (e.g. localhost, 192.168.x, 10.x), so skip the lookup entirely.
        if (!$ip || !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }

        $tzId = Cache::remember("ip_timezone:{$ip}", now()->addDay(), function () use ($ip) {
            try {
                $resp = Http::timeout(3)->get("http://ip-api.com/json/{$ip}", [
                    'fields' => 'status,timezone',
                ]);

                if ($resp->ok() && $resp->json('status') === 'success') {
                    return $resp->json('timezone'); // e.g. "Asia/Kolkata"
                }
            } catch (\Throwable $e) {
                Log::warning('IP timezone lookup failed', ['ip' => $ip, 'error' => $e->getMessage()]);
            }

            return null;
        });

        return $this->resolveTimezone($tzId);
    }

    /**
     * Common validator for list (GET) endpoints.
     */
    private function listValidator(Request $request): \Illuminate\Validation\Validator
    {
        return Validator::make($request->all(), [
            'date'     => 'nullable|date',
            'emp_id'   => 'nullable|string',
            'project'  => 'nullable|string',
            'per_page' => 'nullable|integer|min:1',
        ]);
    }

    /**
     * Build the base query for checkin listing with shared filters.
     */
    private function buildListQuery(string $date, Request $request, bool $checkinOnly): \Illuminate\Database\Eloquent\Builder
    {
        $query = CheckinModel::with(['Project', 'User', 'UserLogin'])
            ->whereDate('date', $date)
            ->whereNotNull('checkin');

        if ($request->filled('emp_id')) {
            $query->where('emp_id', $request->emp_id);
        }

        if ($request->filled('project')) {
            $query->where('project_id', $request->project);
        }

        return $query;
    }

    /**
     * Calculate worked hours between two time strings.
     */
    private function calcWorkedHours(?string $in, ?string $out): string
    {
        if (!$in || !$out) return '';

        try {
            return (new \DateTime($out))->diff(new \DateTime($in))->format('%H:%I:%S');
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Resolve the role attendance logic to apply for this attendance action.
     *
     * Priority:
     *   1. role_id explicitly passed in the request — direct lookup on tbl_role_attendance_logic.
     *   2. Logged-in performing user's own roles (first role that has a logic entry).
     *
     * The employee being checked in is NOT used — the timekeeper/admin performing
     * the attendance drives which rules apply.
     */
    private function resolveRoleLogic(?string $roleId, int $performingUserId): ?RolesAttendanceLogicModel
    {
        // Priority 1: explicit role_id from request — accepts integer id or UUID guid
        if ($roleId) {
            $query = RolesAttendanceLogicModel::with('AttendanceTypes');

            if (is_numeric($roleId)) {
                $query->where('role_id', (int) $roleId);
            } else {
                // UUID guid — join through tbl_role to resolve
                $query->whereHas('Roles', fn($q) => $q->where('guid', $roleId));
            }

            $logic = $query->first();
            if ($logic) {
                return $logic;
            }
        }

        // Priority 2: performing user's own assigned roles
        $performer = TplUserModel::with(['Roles.AttendanceLogic.AttendanceTypes'])
            ->find($performingUserId);

        if (!$performer) {
            return null;
        }

        foreach ($performer->Roles as $role) {
            if ($role->AttendanceLogic) {
                return $role->AttendanceLogic;
            }
        }

        return null;
    }

    /**
     * Decode a base64 blob and persist it to public storage.
     * Accepts raw base64 or a data-URI (data:image/jpeg;base64,...).
     * Returns the stored relative path, or null if the input is empty / invalid.
     */
    private function saveBlob(?string $blob, string $prefix): ?string
    {
        if (!$blob) return null;

        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $blob);
        $bytes  = base64_decode($base64, strict: true);

        if ($bytes === false) return null;

        $filename = $prefix . '_' . time() . '_' . Str::random(8) . '.jpg';
        $path     = 'manual_attendance/' . $filename;

        Storage::disk('public')->put($path, $bytes);

        return $path;
    }
}
