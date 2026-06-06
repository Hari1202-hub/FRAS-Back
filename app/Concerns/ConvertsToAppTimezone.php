<?php

namespace App\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Converts a naive "Y-m-d H:i:s" wall-clock string captured on a client device
 * into the application timezone (Asia/Dubai), so attendance times are always
 * stored in UAE time regardless of where they were recorded.
 *
 * Source timezone is resolved in priority order:
 *   1. The timezone explicitly sent by the client (if a valid IANA id).
 *   2. The timezone of the device's IP address (geo lookup, cached per-IP).
 *   3. Asia/Dubai — the value is then stored unchanged.
 */
trait ConvertsToAppTimezone
{
    /**
     * @return array{0:string,1:string} [date (Y-m-d), time (H:i:s)] in app tz.
     */
    protected function parseToAppTimezone(string $dateTimeStr, ?string $clientTz, Request $request): array
    {
        $targetTz = new \DateTimeZone(config('app.timezone'));

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

        // Always store in the app timezone, regardless of where it was captured.
        $dt->setTimezone($targetTz);

        return [$dt->format('Y-m-d'), $dt->format('H:i:s')];
    }

    /**
     * Turn a timezone id string into a valid DateTimeZone, or null if it is
     * empty / not a real IANA id. Never throws.
     */
    protected function resolveTimezone(?string $tz): ?\DateTimeZone
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
    protected function timezoneFromIp(?string $ip): ?\DateTimeZone
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
}
