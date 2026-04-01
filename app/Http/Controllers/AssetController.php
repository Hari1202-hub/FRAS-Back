<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\ActivityModel;
use App\Models\AssetModel;
use App\Models\ProjectModel;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function index(Request $request){
        $activity   =   AssetModel::with('AssetType')->where('isactive',true)->get()->map(function ($item) {
                $item->asset_type_name = $item->AssetType->name;  
            return $item;
        });
        return $this->sendResponse($activity,'Asset List',200,$request,'asset list');
    }
}
