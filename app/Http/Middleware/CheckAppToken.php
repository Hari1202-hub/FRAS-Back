<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AppClientModel;

class CheckAppToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return $this->deny('Access token missing. Provide Authorization: Bearer <token>');
        }

        $client = AppClientModel::where('is_active', true)->get()
            ->first(fn($c) => $c->verifyToken($token));

        if (!$client) {
            return $this->deny('Invalid or unrecognised token.');
        }

        if ($client->isTokenExpired()) {
            return $this->deny('Token has expired. Request a new token via POST /api/v2/app/auth/token');
        }

        // Stamp last_used_at (no need to fail the request if this errors)
        $client->timestamps = false;
        $client->last_used_at = now();
        $client->save();
        $client->timestamps = true;

        // Attach client to request for use in controllers if needed
        $request->attributes->set('app_client', $client);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');

        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        // Also allow X-App-Token header as fallback
        return $request->header('X-App-Token') ?: null;
    }

    private function deny(string $message): Response
    {
        return response()->json([
            'success' => false,
            'status' => 401,
            'message' => $message,
        ], 401);
    }
}
