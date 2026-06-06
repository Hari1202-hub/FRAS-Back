<?php

namespace App\Concerns;

use DateTimeInterface;
use Illuminate\Support\Carbon;

/**
 * Serializes all Eloquent date/datetime attributes (created_at, updated_at,
 * and any datetime casts) as wall-clock time in the application timezone
 * (Asia/Dubai). This guarantees every datetime returned by the API renders in
 * UAE time on the client, regardless of the client's own timezone.
 *
 * The value is emitted without a timezone suffix (e.g. "2026-06-06T10:00:00"),
 * so the frontend displays the exact Dubai wall-clock value as-is.
 */
trait SerializesDatesInAppTimezone
{
    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)
            ->setTimezone(config('app.timezone'))
            ->format('Y-m-d\TH:i:s');
    }
}
