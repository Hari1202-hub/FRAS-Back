<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use App\Models\EntrolledImageModel;
use App\Models\TplUserModel;
use App\Models\User;

class AppVectorController extends BaseController
{
    /**
     * Cache TTL: 30 minutes.
     * Shares the same cache store as VectorController so both benefit
     * when enrollment events bust the cache via POST vectors/invalidate.
     */
    private const CACHE_TTL = 1800;
    private const CACHE_KEY = 'v2_vectors';   // intentionally same key as VectorController

    // =========================================================================
    // GET /api/v2/app/vectors
    // =========================================================================

    /**
     * Paginated list of all vectors for the Python face-recognition backend.
     *
     * Authenticated via app token (CheckAppToken middleware).
     *
     * Query params:
     *   since    – Y-m-d  only vectors updated on/after this date (default: all)
     *   per_page – int    max records per page (default 100, max 500)
     *   page     – int    page number (default 1)
     *   no_cache – 1      bypass the cache for this request
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

        $since   = $request->since   ?? '1970-01-01';
        $perPage = (int) ($request->per_page ?? 100);
        $page    = (int) ($request->page    ?? 1);
        $noCache = (int) ($request->no_cache ?? 0);

        $cacheKey = self::CACHE_KEY . "_{$since}_{$perPage}_{$page}";

        if ($noCache) {
            Cache::forget($cacheKey);
        }

        $result = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($since, $perPage, $page) {
            return $this->buildVectorPage($since, $perPage, $page);
        });

        // Identify the calling app client for audit/logging
        $client = $request->attributes->get('app_client');

        return response()->json([
            'success'    => true,
            'status'     => 200,
            'message'    => 'Vectors fetched.',
            'app_client' => optional($client)->name,
            'cached'     => !$noCache,
            'data'       => $result['data'],
            'meta'       => $result['meta'],
        ], 200);
    }

    // =========================================================================
    // GET /api/v2/app/vectors/{staffId}
    // =========================================================================

    /**
     * Single staff vector by emp_id or staff GUID.
     * Cached individually.
     */
    public function show(Request $request, string $staffId)
    {
        $cacheKey = self::CACHE_KEY . "_single_{$staffId}";

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($staffId) {
            return $this->resolveVector($staffId);
        });

        if (!$data) {
            return $this->notFound("No vector found for staff '{$staffId}'.");
        }

        return $this->success($data, 'Vector fetched.');
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private function buildVectorPage(string $since, int $perPage, int $page): array
    {
        $query = EntrolledImageModel::with('User')
            ->whereDate('updated_at', '>=', $since)
            ->whereNotNull('vector');

        $total    = $query->count();
        $lastPage = (int) ceil($total / max($perPage, 1));
        $offset   = ($page - 1) * $perPage;

        $items = $query->orderBy('updated_at', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get()
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

    private function resolveVector(string $staffId): ?array
    {
        // Try by staff GUID first
        $enrollment = EntrolledImageModel::where('empguid', $staffId)->first();

        // Fallback: look up by emp_id
        if (!$enrollment) {
            $loginUser = User::where('emp_id', $staffId)->first();
            if ($loginUser) {
                $enrollment = EntrolledImageModel::where('empguid', $loginUser->guid)->first();
            }
        }

        return $enrollment ? $this->formatVector($enrollment) : null;
    }

    private function formatVector(EntrolledImageModel $enrollment): ?array
    {
        $tplUser   = TplUserModel::where('guid', $enrollment->empguid)->first();
        $loginUser = $enrollment->User;

        return [
            'staff_guid' => $enrollment->empguid,
            'staff_id'   => optional($loginUser)->emp_id   ?? '',
            'name'       => optional($tplUser)->name        ?? '',
            'image_url'  => !empty($enrollment->image) ? asset($enrollment->image) : '',
            'vector'     => $enrollment->vector,
            'vectors'    => $enrollment->vectors,
            'updated_at' => optional($enrollment->updated_at)->toIso8601String(),
        ];
    }
}
