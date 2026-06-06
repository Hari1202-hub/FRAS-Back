<?php

return [

    // ── Payday HCM endpoints ────────────────────────────────────────────────
    'auth_url' => env('PAYDAY_AUTH_URL', 'https://hcm.paydaysuite.com/PdyExtInterface/extauthenticate'),
    'push_url' => env('PAYDAY_PUSH_URL', 'https://hcm.paydaysuite.com/PdyExtInterface/SaveDatasExternal'),

    // ── Credentials / constants (shared by Payday). Set these in .env — never
    //    commit the real values. See the integration doc for the values. ───────
    'api_key'       => env('PAYDAY_API_KEY', ''),
    'client_secret' => env('PAYDAY_CLIENT_SECRET', ''),
    'module'        => env('PAYDAY_MODULE', ''),
    'action'        => env('PAYDAY_ACTION', 'add'),

    // Shared secret the external cron caller must present (header X-Payday-Secret
    // or ?secret=). MUST be set in .env — the endpoint fails closed when empty.
    'sync_secret' => env('PAYDAY_SYNC_SECRET', ''),

    // ── Throttling / batching (protects both servers) ───────────────────────
    'batch_size'    => (int) env('PAYDAY_BATCH_SIZE', 50),    // punches per HTTP request
    'throttle_ms'   => (int) env('PAYDAY_THROTTLE_MS', 300),  // pause between batches
    'max_per_run'   => (int) env('PAYDAY_MAX_PER_RUN', 1000), // hard cap per sync run
    'lookback_days' => (int) env('PAYDAY_LOOKBACK_DAYS', 3),  // only consider recent records
    'http_timeout'  => (int) env('PAYDAY_HTTP_TIMEOUT', 20),
    'http_retries'  => (int) env('PAYDAY_HTTP_RETRIES', 2),
];
