<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use App\Models\EntrolledImageModel;
use App\Models\TplUserModel;

class VectorController extends BaseController
{
    /**
     * Cache TTL in seconds (30 minutes).
     * Vectors change only on enrollment events, so 30 min is safe.
     */
    private const CACHE_TTL = 1800;

    /**
     * Cache key prefix.
     */
    private const CACHE_KEY = 'v2_vectors';

    /**
     * List all vectors for the Python face-recognition backend.
     *
     * Query params:
     *   since      – Y-m-d (only vectors updated on/after this date)
     *   per_page   – default 100
     *   page       – default 1
     *   no_cache   – 1 to bypass cache
     *
     * Returns: staff_id (emp_id), staff_guid, name, image_url, vector, vectors
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'since'    => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:1|max:500',
            'page'     => 'nullable|integer|min:1',
            'no_cache' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $since    = $request->since ?? '1970-01-01';
        $perPage  = (int) ($request->per_page ?? 100);
        $page     = (int) ($request->page ?? 1);
        $noCache  = (int) ($request->no_cache ?? 0);

        $cacheKey = self::CACHE_KEY . "_{$since}_{$perPage}_{$page}";

        if ($noCache) {
            Cache::forget($cacheKey);
        }

        $result = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($since, $perPage, $page) {
            return $this->fetchVectors($since, $perPage, $page);
        });

        return response()->json([
            'success'    => true,
            'status'     => 200,
            'message'    => 'Vectors fetched.',
            'cached'     => !$noCache,
            'data'       => $result['data'],
            'meta'       => $result['meta'],
        ], 200);
    }

    /**
     * Get the vector for a single staff member by their emp_id or GUID.
     * Route param: staffId = emp_id (e.g. EMP001) or staff GUID
     */
    public function show(string $staffId)
    {
        $cacheKey = self::CACHE_KEY . "_single_{$staffId}";

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($staffId) {
            $enrollment = EntrolledImageModel::where('empguid', $staffId)->first();

            if (!$enrollment) {
                // Try lookup via User emp_id
                $user = \App\Models\User::where('emp_id', $staffId)->first();
                if ($user) {
                    $enrollment = EntrolledImageModel::where('empguid', $user->guid)->first();
                }
            }

            if (!$enrollment) return null;

            return $this->formatVector($enrollment);
        });

        if (!$data) {
            return $this->notFound('No vector found for this staff member.');
        }

        return $this->success($data, 'Vector fetched.');
    }

    /**
     * Invalidate the vector cache.
     * Called after enrollment create / update / delete events.
     *
     * Body (optional): { staff_id } to invalidate only one staff entry.
     */
    public function invalidateCache(Request $request)
    {
        if ($request->filled('staff_id')) {
            $staffId = $request->staff_id;
            Cache::forget(self::CACHE_KEY . "_single_{$staffId}");
        }

        // Flush all paged caches by tagging is preferred, but since tags need
        // Redis/Memcached, we use a version key pattern compatible with file/db cache.
        Cache::put(self::CACHE_KEY . '_version', time(), self::CACHE_TTL * 48);

        return $this->success([], 'Vector cache invalidated.', 200, $request, 'vectors/invalidate');
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function fetchVectors(string $since, int $perPage, int $page): array
    {
        $query = EntrolledImageModel::with('User')
            ->whereDate('updated_at', '>=', $since)
            ->whereNotNull('vector');

        $total     = $query->count();
        $lastPage  = (int) ceil($total / $perPage);
        $offset    = ($page - 1) * $perPage;

        $items = $query->skip($offset)->take($perPage)->get()
            ->map(fn($e) => $this->formatVector($e))
            ->filter()
            ->values();

        return [
            'data' => $items,
            'meta' => [
                'current_page' => $page,
                'last_page'    => $lastPage,
                'per_page'     => $perPage,
                'total'        => $total,
            ],
        ];
    }

    private function formatVector(EntrolledImageModel $enrollment): array
    {
        $tplUser = TplUserModel::where('guid', $enrollment->empguid)->first();
        $loginUser = $enrollment->User;

        return [
            'staff_guid'  => $enrollment->empguid,
            'staff_id'    => optional($loginUser)->emp_id ?? '',
            'name'        => optional($tplUser)->name ?? '',
            'image_url'   => !empty($enrollment->image) ? asset($enrollment->image) : '',
            'vector'      => $enrollment->vector,
            'vectors'     => $enrollment->vectors,
            'updated_at'  => $enrollment->updated_at,
        ];
    }
}
