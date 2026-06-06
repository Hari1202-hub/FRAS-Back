<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLogModel extends BaseModel
{
    public $timestamps = false;
    protected $table    = 'tbl_auditlog';
    protected $fillable = ['guid','eventtype','eventmodule','auditlog_desc','from_userid','to_userid','isauto','date','reference'];
}
