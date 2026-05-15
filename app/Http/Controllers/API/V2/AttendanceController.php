<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\CheckinModel;

class AttendanceController extends BaseController
{
    private const COOLDOWN_SECONDS = 10;

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

        $authUser = Auth::guard('api')->user();
        $date     = date('Y-m-d', strtotime($request->date_time));
        $time     = date('H:i:s',  strtotime($request->date_time));

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
        $record->project_id      = $request->project   ?? '';
        $record->checkin_lat     = $request->latitude  ?? '';
        $record->checkin_lang    = $request->longitude ?? '';
        $record->attendance_type = '';
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
     * Closes the most recent open check-in for the employee (any project / role).
     */
    public function checkOut(Request $request)
    {
        $validator = $this->attendanceValidator($request);
        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $time = date('H:i:s', strtotime($request->date_time));

        // Cooldown: block if the same employee checked out within the last N seconds.
        $last = CheckinModel::where('emp_id', $request->empguid)
            ->whereNotNull('checkout')
            ->orderBy('updated_at', 'desc')
            ->first();

        if ($last && $last->updated_at->diffInSeconds(now()) < self::COOLDOWN_SECONDS) {
            return $this->error('Please wait a moment before checking out again.', 429);
        }

        // Close the most recent open check-in — no role or project filter.
        $record = CheckinModel::where('emp_id', $request->empguid)
            ->whereNull('checkout')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$record) {
            return $this->error('No active check-in found.', 404);
        }

        $record->checkout            = $time;
        $record->checkout_project_id = $request->project   ?? '';
        $record->checkout_lat        = $request->latitude  ?? '';
        $record->checkout_lang       = $request->longitude ?? '';
        $record->checkout_image      = $this->saveBlob($request->blob, 'checkout');
        $record->save();

        $record->worked_hours = $this->calcWorkedHours($record->checkin, $record->checkout);

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
            'project'   => 'nullable|string',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'blob'      => 'nullable|string',
        ]);
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
