<?php

namespace App\Models;

class PaydayPunchLog extends BaseModel
{
    protected $table = 'payday_punch_logs';

    protected $fillable = [
        'checkin_id',
        'punchstatus',
        'empno',
        'empprojectcode',
        'punchdate',
        'request_payload',
        'status',
        'response_status',
        'response_code',
        'response_message',
        'response_body',
        'attempts',
        'synced_at',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'synced_at'       => 'datetime',
    ];
}
