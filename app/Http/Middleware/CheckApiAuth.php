<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\AppClientModel;
use App\Models\AppAccessLog;

class CheckApiAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Primary: JWT guard (admin / user login via email+password).
        // Wrapped in try-catch because Tymon JWT throws when the token is not
        // a valid JWT format (e.g. when an app token is supplied instead).
        try {
            if (Auth::guard('api')->check()) {
                return $next($request);
            }
        } catch (\Throwable) {
            // Not a JWT — fall through to app token check below
        }

        // Fallback: App token (machine-to-machine via client_id + client_secret)
        $token = $this->extractBearerToken($request);

        if ($token) {
            $client = AppClientModel::where('is_active', true)->get()
                ->first(fn($c) => $c->verifyToken($token));

            if ($client && !$client->isTokenExpired()) {
                // Stamp last_used_at silently
                $client->timestamps = false;
                $client->last_used_at = now();
                $client->save();
                $client->timestamps = true;

                // Write access log — never block on failure
                try {
                    AppAccessLog::create([
                        'client_id'       => $client->client_id,
                        'client_name'     => $client->name,
                        'endpoint'        => $request->path(),
                        'method'          => $request->method(),
                        'ip_address'      => $request->ip(),
                        'user_agent'      => substr((string) $request->userAgent(), 0, 500),
                        'response_status' => 200,
                    ]);
                } catch (\Throwable) {}

                $request->attributes->set('app_client', $client);

                return $next($request);
            }
        }

        return $this->sendapiError('Unauthorized access. Token missing or invalid.', 401);
    }

    private function extractBearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');

        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return $request->header('X-App-Token') ?: null;
    }

    public function sendapiError($message = '', $code = 400)
    {
        return response()->json([
            'success' => false,
            'status'  => $code,
            'message' => $message,
        ], $code);
    }
}
