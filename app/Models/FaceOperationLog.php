<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaceOperationLog extends BaseModel
{
    protected $fillable = [
        'session_id',
        'action_type',
        'event_time',
        'log_payload',
        'sync_status',
    ];

    protected $casts = [
        'log_payload' => 'array',
        'event_time'  => 'datetime',
        'sync_status' => 'boolean',
    ];
}
