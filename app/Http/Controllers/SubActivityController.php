<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\ActivityModel;
use App\Models\ProjectModel;
use App\Models\SubactivityModel;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Carbon\Carbon;

class SubActivityController extends Controller
{
    public function index(Request $request){
        $validator = Validator::make($request->all(), [
            'project_id' => ['required'],
            'activity_id' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $activity   =   SubactivityModel::with(['Activity','Project'])->whereHas('Project', function ($query) use ($request) {
                $query->where('projectid', $request->project_id );
            })->whereHas('Activity', function ($query) use ($request) {
                $query->where('activity_id', $request->activity_id );
            })->where('isactive',true)->get()->map(function ($item) {
                $item->project_name = $item->Project->projectname;  
                $item->activity_name = $item->Activity->activity_name;  
                return $item;
            });
        return $this->sendResponse($activity,'Sub Activity List',200,$request,'sub activity list');
    }
}
