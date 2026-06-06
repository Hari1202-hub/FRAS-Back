<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Push pending check-in/out punches to Payday HCM every hour.
// Requires Laravel's scheduler to be running (a single `* * * * * php artisan
// schedule:run` system cron). The external HTTP endpoint is an alternative.
Schedule::command('payday:push-attendance')
    ->hourly()
    ->withoutOverlapping();
