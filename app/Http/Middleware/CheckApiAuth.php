<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    { 
        if (!Auth::guard('api')->check()) {
            return $this->sendapiError('Unauthorized access. Token missing or invalid.',401);
        }
        return $next($request);
    }
    public function sendapiError($message = '', $code = 400)
    {
        return response()->json([
            'status' => $code,
            'message' => $message,
        ], $code);
    }
}
