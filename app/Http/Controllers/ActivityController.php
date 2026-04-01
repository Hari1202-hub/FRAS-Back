<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\ActivityModel;
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


class ActivityController extends Controller
{
    public function index(Request $request){
        $validator = Validator::make($request->all(), [
            'project_id' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $activity   =   ActivityModel::with('Project')->whereHas('Project', function ($query) use ($request) {
                $query->where('projectid', $request->project_id );
            })->where('isactive',true)->get()->map(function ($item) {
                $item->project_name = $item->Project->projectname;  
            return $item;
        });
        return $this->sendResponse($activity,'Activity List',200,$request,'activity list');
    }
    public function create_activity(Request $request){
        $activities   = $request->activities;
        $responseData = [
            'inserted' => [],
            'errors' => [],
        ];
        try{
            if(!empty($activities)){ 
                foreach($activities as $index=>$activityData){
                    $validator = Validator::make((array)$activityData, [
                                    'id'             => 'required',
                                    'project'        => 'required',
                                    'activity_type'  => 'required',
                                    'activity_desc'  => 'required',
                                    'unit'           => 'required',
                                    'qty'            => 'required|numeric',
                                    'start_date'     => 'required',
                                    'end_date'     => 'required',
                                    'status'         => 'required',
                                    'reference_id'   => 'required',
                                ]);

                    if ($validator->fails()) {
                        $responseData['errors'][] = [
                            'row' => $index + 1,
                            'errors' => $validator->errors(),
                        ];
                        continue; 
                    }
                    else{
                        
                        $check_activity      =   ActivityModel::where('ref_activity_id',$activityData['reference_id'])->first();
                        $check_project      =   ProjectModel::where('projectid',$activityData['project'])->first();
                        
                        if(!empty($check_project)){
                            if(empty($check_activity)){
                            
                                $activity                   =   new ActivityModel();
                                $activity->guid             =   Str::uuid(10);
                                $activity->ref_activity_id  =   $activityData['reference_id'];
                                
                                $activity->projectid        =   $check_project->id;
                                $activity->activity_type    =   $check_project->activity_type;
                                $activity->activity_description =   $activityData['activity_desc'];
                                $activity->unit             =   $activityData['unit'];
                                $activity->qty              =   $activityData['qty'];
                                $activity->startdate        =   date('Y-m-d',strtotime($activityData['start_date']));
                                $activity->enddate          =   date('Y-m-d',strtotime($activityData['end_date']));
                                $activity->status           =   $activityData['status'];
                                $activity->save();
                            }
                            else{

                                $activity                   =   ActivityModel::find($check_activity->id);
                                
                                $activity->projectid        =   $check_project->id;
                                $activity->activity_type    =   $check_project->activity_type;
                                $activity->activity_description =   $activityData['activity_desc'];
                                $activity->unit             =   $activityData['unit'];
                                $activity->qty              =   $activityData['qty'];
                                $activity->startdate        =   date('Y-m-d',strtotime($activityData['start_date']));
                                $activity->enddate          =   date('Y-m-d',strtotime($activityData['end_date']));
                                $activity->status           =   $activityData['status'];
                                $activity->save();
                            }
                        }
                    }
                }
            }
            else{
                $user                       =   Auth::guard('api')->user();
                $audit_log                  =   new AuditLogModel();
                $audit_log->guid            =   Str::uuid(10);
                $audit_log->eventtype       =   'POST';
                $audit_log->eventmodule     =   'Create Activitiy';
                $audit_log->auditlog_desc   =   'Invalid or Incorrect Json';
                $audit_log->from_userid     =   $user->id;
                $audit_log->to_userid       =   '';
                $audit_log->isauto          =   true;
                $audit_log->date            =   date('Y-m-d');
                $audit_log->reference       =   'Josn Error';
                $audit_log->save();
            }
        }
        catch(Exception $e){
            $user                       =   Auth::guard('api')->user();
            $audit_log                  =   new AuditLogModel();
            $audit_log->guid            =   Str::uuid(10);
            $audit_log->eventtype       =   'POST';
            $audit_log->eventmodule     =   'Create Activitiy';
            $audit_log->auditlog_desc   =   $e->getMessage();
            $audit_log->from_userid     =   $user->id;
            $audit_log->to_userid       =   '';
            $audit_log->isauto          =   true;
            $audit_log->date            =   date('Y-m-d');
            $audit_log->reference       =   $e->getMessage();
            $audit_log->save();
        }
        return $this->sendResponse([],'Activity created successfully.',200,$request,'create activity');
    }
}
