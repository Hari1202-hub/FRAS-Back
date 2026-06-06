<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResetPassword extends BaseModel
{
    protected $table    = 'password_reset_tokens';
    protected $fillable = ['email','token','created_at'];
}
