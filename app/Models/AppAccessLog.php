<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppAccessLog extends Model
{
    public $timestamps = false;

    protected $table    = 'tbl_app_access_logs';
    protected $fillable = [
        'client_id', 'client_name', 'endpoint', 'method',
        'ip_address', 'user_agent', 'response_status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
