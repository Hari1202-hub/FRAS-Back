<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\AppClientModel;
use App\Models\AppAccessLog;

class AppAuthController extends BaseController
{
    // =========================================================================
    // PUBLIC — called by the external application
    // =========================================================================

    /**
     * POST /api/v2/app/auth/token
     *
     * Exchange client_id + client_secret for a time-limited access token.
     * Token TTL defaults to 24 hours; pass ttl_hours to override (max 168 = 7 days).
     *
     * Body: { client_id, client_secret, ttl_hours? }
     */
    public function token(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id'     => 'required|string',
            'client_secret' => 'required|string',
            'ttl_hours'     => 'nullable|integer|min:1|max:168',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $client = AppClientModel::where('client_id', $request->client_id)
            ->where('is_active', true)
            ->first();

        if (!$client || !$client->verifySecret($request->client_secret)) {
            // Intentionally vague to prevent enumeration
            return $this->error('Invalid client credentials.', 401);
        }

        $ttlHours = (int) ($request->ttl_hours ?? 24);
        $rawToken = $client->issueToken($ttlHours);

        return $this->success([
            'access_token' => $rawToken,
            'token_type'   => 'bearer',
            'expires_in'   => $ttlHours * 3600,
            'expires_at'   => now()->addHours($ttlHours)->toIso8601String(),
        ], 'Token issued successfully. Store it securely — it will not be shown again.');
    }

    // =========================================================================
    // PROTECTED — called by admin (main JWT auth) to manage app clients
    // =========================================================================

    /**
     * GET /api/v2/app/clients
     *
     * List all registered application clients.
     */
    public function listClients()
    {
        $clients = AppClientModel::orderBy('created_at', 'desc')->get()->map(function ($c) {
            return [
                'uuid'             => $c->uuid,
                'name'             => $c->name,
                'client_id'        => $c->client_id,
                'is_active'        => $c->is_active,
                'has_active_token' => !empty($c->access_token) && !$c->isTokenExpired(),
                'token_expires_at' => optional($c->token_expires_at)->toIso8601String(),
                'last_used_at'     => optional($c->last_used_at)->toIso8601String(),
                'created_at'       => $c->created_at->toIso8601String(),
            ];
        });

        return $this->success($clients, 'App clients fetched.');
    }

    /**
     * POST /api/v2/app/clients
     *
     * Register a new application client.
     * Returns the raw client_secret ONCE — store it securely, it cannot be retrieved again.
     *
     * Body: { name, client_id }
     */
    public function createClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:100',
            'client_id' => 'required|string|max:100|unique:tbl_app_clients,client_id',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $rawSecret = Str::random(48);

        $client = AppClientModel::create([
            'uuid'          => Str::uuid(),
            'name'          => $request->name,
            'client_id'     => $request->client_id,
            'client_secret' => Hash::make($rawSecret),
            'is_active'     => true,
        ]);

        return $this->success([
            'uuid'          => $client->uuid,
            'name'          => $client->name,
            'client_id'     => $client->client_id,
            'client_secret' => $rawSecret,   // shown ONCE — never retrievable again
        ], 'App client created. Save the client_secret now — it will not be shown again.', 201, $request, 'app/clients/create');
    }

    /**
     * PUT /api/v2/app/clients/{uuid}
     *
     * Update a client name or active status.
     *
     * Body: { name?, is_active? }
     */
    public function updateClient(Request $request, string $uuid)
    {
        $client = AppClientModel::where('uuid', $uuid)->first();

        if (!$client) {
            return $this->notFound('App client not found.');
        }

        $validator = Validator::make($request->all(), [
            'name'      => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        if ($request->filled('name'))       $client->name      = $request->name;
        if ($request->has('is_active'))     $client->is_active = (bool) $request->is_active;
        $client->save();

        return $this->success([
            'uuid'      => $client->uuid,
            'name'      => $client->name,
            'client_id' => $client->client_id,
            'is_active' => $client->is_active,
        ], 'App client updated.', 200, $request, 'app/clients/update');
    }

    /**
     * POST /api/v2/app/clients/{uuid}/rotate-secret
     *
     * Generate a new client_secret and revoke the current access token.
     * Returns the new raw secret ONCE.
     */
    public function rotateSecret(string $uuid)
    {
        $client = AppClientModel::where('uuid', $uuid)->first();

        if (!$client) {
            return $this->notFound('App client not found.');
        }

        $rawSecret = Str::random(48);

        $client->client_secret = Hash::make($rawSecret);
        $client->revokeToken();    // also clears access_token + token_expires_at

        return $this->success([
            'client_id'     => $client->client_id,
            'client_secret' => $rawSecret,
        ], 'Secret rotated and existing token revoked. Save the new client_secret now.');
    }

    /**
     * DELETE /api/v2/app/clients/{uuid}
     *
     * Permanently delete (or deactivate) an app client.
     */
    public function deleteClient(string $uuid)
    {
        $client = AppClientModel::where('uuid', $uuid)->first();

        if (!$client) {
            return $this->notFound('App client not found.');
        }

        $client->delete();

        return $this->success([], 'App client deleted.');
    }

    // =========================================================================
    // PROTECTED — App access logs
    // =========================================================================

    /**
     * GET /api/v2/app/logs
     *
     * Paginated access log for all app-token requests.
     *
     * Query params:
     *   client_id – filter by client_id string
     *   from      – Y-m-d start date
     *   to        – Y-m-d end date
     *   per_page  – default 50
     */
    public function listLogs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from'     => 'nullable|date_format:Y-m-d',
            'to'       => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $query = AppAccessLog::orderBy('created_at', 'desc');

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $perPage   = (int) ($request->per_page ?? 50);
        $paginator = $query->paginate($perPage);

        return $this->paginated($paginator, 'App access logs fetched.');
    }
}
