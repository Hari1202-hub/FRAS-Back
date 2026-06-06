<?php

namespace App\Services;

use App\Models\PaydayPunchLog;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pushes FRAS check-in / check-out punches to Payday HCM.
 *
 * Flow: authenticate (cached JWT) → collect pending punches → push in throttled
 * batches → log every punch in payday_punch_logs. A cache lock prevents
 * overlapping runs (hourly cron + manual trigger).
 */
class PaydayHcmService
{
    private const LOCK_KEY  = 'payday:sync';
    private const TOKEN_KEY = 'payday:token';

    /**
     * Run a full sync. Returns a summary array.
     */
    public function sync(string $trigger = 'manual'): array
    {
        $lock = Cache::lock(self::LOCK_KEY, 600);

        if (!$lock->get()) {
            return ['locked' => true, 'message' => 'A Payday sync is already running.'];
        }

        $summary = [
            'trigger'   => $trigger,
            'collected' => 0,
            'pushed'    => 0,
            'failed'    => 0,
            'skipped'   => 0,
            'batches'   => 0,
        ];

        try {
            $punches = $this->collectPunches();
            $summary['collected'] = count($punches);

            if (empty($punches)) {
                $summary['message'] = 'No pending punches to push.';
                return $summary;
            }

            // Drop punches we can't push (no employee number / project code).
            $sendable = [];
            foreach ($punches as $p) {
                if (empty($p->empno) || empty($p->empprojectcode)) {
                    $this->logPunch($p, null, 'skipped', null, 'Missing empno or project code.');
                    $summary['skipped']++;
                    continue;
                }
                $sendable[] = $p;
            }

            $batchSize  = max(1, (int) config('payday.batch_size'));
            $throttleMs = max(0, (int) config('payday.throttle_ms'));

            foreach (array_chunk($sendable, $batchSize) as $batch) {
                $summary['batches']++;

                $payload = array_map(fn ($p) => $this->buildPayload($p), $batch);
                [$ok, $resp] = $this->postPunches($payload);

                foreach ($batch as $i => $p) {
                    $this->logPunch($p, $payload[$i], $ok ? 'success' : 'failed', $resp);
                }

                $ok ? $summary['pushed'] += count($batch)
                    : $summary['failed'] += count($batch);

                // Throttle between batches so we don't hammer the Payday server.
                if ($throttleMs > 0) {
                    usleep($throttleMs * 1000);
                }
            }

            return $summary;
        } finally {
            $lock->release();
        }
    }

    /**
     * Collect pending punches (check-ins and check-outs not yet successfully
     * pushed), newest-bounded by the lookback window and capped per run.
     *
     * @return array<int,\stdClass>
     */
    protected function collectPunches(): array
    {
        $cutoff = now()->subDays((int) config('payday.lookback_days'))->toDateString();
        $max    = max(1, (int) config('payday.max_per_run'));

        $query = function (string $punchStatus, string $timeCol) use ($cutoff) {
            return DB::table('tbl_user_checin_checkout as c')
                ->join('tbl_user as u', DB::raw('u.guid::text'), '=', DB::raw('c.emp_id::text'))
                ->join('tbl_userlogin as ul', 'ul.user_id', '=', 'u.id')
                ->leftJoin('tbl_project as p', DB::raw('p.guid::text'), '=', DB::raw('c.project_id::text'))
                ->leftJoin('payday_punch_logs as l', function ($j) use ($punchStatus) {
                    $j->on('l.checkin_id', '=', 'c.id')
                      ->where('l.punchstatus', '=', $punchStatus)
                      ->where('l.status', '=', 'success');
                })
                ->whereNotNull("c.$timeCol")
                ->where('c.date', '>=', $cutoff)
                ->whereNull('l.id')
                ->orderBy('c.id')
                ->selectRaw(
                    "c.id as checkin_id, ? as punchstatus, ul.emp_id as empno, "
                    . "p.projectid as empprojectcode, c.date as d, c.$timeCol as t",
                    [$punchStatus]
                );
        };

        $checkins  = $query('0', 'checkin')->limit($max)->get();
        $remaining = max(0, $max - $checkins->count());
        $checkouts = $remaining > 0 ? $query('1', 'checkout')->limit($remaining)->get() : collect();

        return $checkins->concat($checkouts)->all();
    }

    /**
     * Build a single Payday punch payload from a collected row.
     */
    protected function buildPayload(\stdClass $p): array
    {
        // Stored times are already Asia/Dubai wall-clock; just reformat.
        $punchdate = Carbon::parse($p->d . ' ' . $p->t)->format('d-m-Y H:i:s');

        return [
            'client_secret'  => config('payday.client_secret'),
            'module'         => config('payday.module'),
            'action'         => config('payday.action'),
            'empno'          => (string) $p->empno,
            'punchdate'      => $punchdate,
            'punchstutus'    => (string) $p->punchstatus, // spelling used in the API sample body
            'punchstatus'    => (string) $p->punchstatus, // spelling used in the field definitions
            'empprojectcode' => (string) $p->empprojectcode,
        ];
    }

    /**
     * POST a batch of punches. Re-authenticates once on a 401. Never throws.
     *
     * @return array{0:bool,1:?Response}
     */
    protected function postPunches(array $payload): array
    {
        try {
            $resp = $this->send($payload);

            if ($resp->status() === 401) {
                Cache::forget(self::TOKEN_KEY); // token likely expired (2-min lifetime)
                $resp = $this->send($payload);
            }

            $status = strtolower((string) $resp->json('status', ''));
            $code   = (string) $resp->json('statuscode', $resp->status());
            $ok     = $resp->successful() && (str_starts_with($status, 'suc') || $code === '200');

            if (!$ok) {
                Log::warning('Payday push batch failed', ['status' => $resp->status(), 'body' => $resp->body()]);
            }

            return [$ok, $resp];
        } catch (\Throwable $e) {
            Log::error('Payday push batch error', ['error' => $e->getMessage()]);
            return [false, null];
        }
    }

    protected function send(array $payload): Response
    {
        return Http::timeout((int) config('payday.http_timeout'))
            ->retry((int) config('payday.http_retries'), 500, throw: false)
            ->withToken($this->token())
            ->acceptJson()
            ->post(config('payday.push_url'), $payload);
    }

    /**
     * Get a Payday JWT, cached just under its 2-minute lifetime.
     */
    protected function token(): string
    {
        return Cache::remember(self::TOKEN_KEY, now()->addSeconds(100), function () {
            $resp = Http::timeout((int) config('payday.http_timeout'))
                ->withHeaders(['API_KEY' => config('payday.api_key')])
                ->acceptJson()
                ->post(config('payday.auth_url'), [
                    'client_secret' => config('payday.client_secret'),
                ]);

            $token = $resp->json('data.usertoken');

            if (!$resp->successful() || empty($token)) {
                Log::error('Payday authentication failed', ['status' => $resp->status(), 'body' => $resp->body()]);
                throw new \RuntimeException('Payday authentication failed.');
            }

            return $token;
        });
    }

    /**
     * Upsert the per-punch log row (keyed by checkin_id + punchstatus).
     */
    protected function logPunch(\stdClass $p, ?array $payload, string $status, ?Response $resp = null, ?string $message = null): void
    {
        $log = PaydayPunchLog::firstOrNew([
            'checkin_id'  => $p->checkin_id,
            'punchstatus' => $p->punchstatus,
        ]);

        $log->empno            = $p->empno;
        $log->empprojectcode   = $p->empprojectcode;
        $log->punchdate        = $payload['punchdate'] ?? $log->punchdate;
        $log->request_payload  = $payload;
        $log->status           = $status;
        $log->response_status  = $resp ? (string) $resp->json('status', '') : null;
        $log->response_code    = $resp ? (string) $resp->json('statuscode', $resp->status()) : null;
        $log->response_message = $message ?? ($resp ? (string) $resp->json('message', '') : null);
        $log->response_body    = $resp ? mb_substr((string) $resp->body(), 0, 5000) : null;
        $log->attempts         = ($log->attempts ?? 0) + 1;
        $log->synced_at        = $status === 'success' ? now() : $log->synced_at;
        $log->save();
    }
}
