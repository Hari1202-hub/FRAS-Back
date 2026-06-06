<?php

namespace App\Models;

use App\Concerns\SerializesDatesInAppTimezone;
use Illuminate\Database\Eloquent\Model;

/**
 * Application base model. All models extend this so their dates serialize in
 * the app timezone (Asia/Dubai) via SerializesDatesInAppTimezone.
 */
class BaseModel extends Model
{
    use SerializesDatesInAppTimezone;
}
