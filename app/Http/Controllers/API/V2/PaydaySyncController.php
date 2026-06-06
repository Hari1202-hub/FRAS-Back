<?php

namespace App\Http\Controllers\API\V2;

use App\Services\PaydayHcmService;
use Illuminate\Http\Request;

class PaydaySyncController extends BaseController
{
    /**
     * GET|POST /api/v2/payday/sync
     *
     * Triggers a push of pending check-in/out punches to Payday HCM.
     * Intended to be called by an external scheduler (e.g. every 1 hour).
     *
     * Auth: a shared secret via the `X-Payday-Secret` header, or `?secret=`.
     * Fails closed if PAYDAY_SYNC_SECRET is not configured.
     */
    public function sync(Request $request, PaydayHcmService $service)
    {
        $secret   = (string) config('payday.sync_secret');
        $provided = (string) ($request->header('X-Payday-Secret')
            ?? $request->query('secret')
            ?? $request->input('secret'));

        if ($secret === '' || !hash_equals($secret, $provided)) {
            return $this->error('Unauthorized.', 401);
        }

        $summary = $service->sync('http');

        return $this->success($summary, 'Payday attendance sync completed.');
    }
}
