<?php

namespace App\Console\Commands;

use App\Services\PaydayHcmService;
use Illuminate\Console\Command;

class PushPaydayAttendance extends Command
{
    protected $signature = 'payday:push-attendance';

    protected $description = 'Push pending check-in/out punches to Payday HCM (run hourly).';

    public function handle(PaydayHcmService $service): int
    {
        $summary = $service->sync('cron');

        $this->info('Payday attendance sync: ' . json_encode($summary));

        return self::SUCCESS;
    }
}
