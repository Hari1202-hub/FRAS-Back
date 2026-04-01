<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\AttendaceTypeModel;
use App\Models\CheckinModel;
use App\Models\ProjectModel;
use App\Models\RolesAttendanceLogicModel;
use App\Models\RoleModel;
use App\Models\TplUserModel;
use App\Models\User;
use App\Models\UserRoleModel;
use App\Models\FaceOperationLog;


use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use DateTime;

class ApiAttendaceController extends Controller
{
    public function get_attendance_type(Request $request){
        $attendance_types   =   AttendaceTypeModel::orderBy('id','desc')->get();
        $transformed = $attendance_types->map(function ($item) {
                return [
                    'id'              => $item->id,
                    'guid'            => $item->guid,
                    'attendance_type' => $item->attendance_type,
                    'description'     => $item->description,
                    'isactive'        => $item->isactive ? 'Active' : 'Inactive',
                    'created_at'      => $item->created_at,
                    'updated_at'      => $item->updated_at,
                ];
            });
        return $this->sendResponse($transformed,'',200,$request,'attendace type');
    }
    public function create_attendance_type(Request $request){
        $user = Auth::guard('api')->user();
        $validator = Validator::make($request->all(), [
            'attendance_type' => ['required','min:3','max:100','unique:tbl_attendance_type,attendance_type'],
            'description' => ['required','min:3','max:200'],
            'status' => ['required'],

        ]);
         if($validator->fails()){
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }
        else{
            $attendance_type                    =   new AttendaceTypeModel();
            $attendance_type->guid              =   Str::uuid();
            $attendance_type->attendance_type   =   $request->attendance_type;
            $attendance_type->description       =   $request->description;
            $attendance_type->isactive          =   ($request->status=='Active')?true:false;
            $attendance_type->save();
            $attendance_type->isactive          =   $request->status?'Active':'Inactive';
            return $this->sendResponse($attendance_type,'Attendance Type created successfully.',200,$request,'create attendance type');
        }
    }
    public function update_attendance_type(Request $request){
        $user = Auth::guard('api')->user();
        $id = $request->id;
        $validator = Validator::make($request->all(), [
            'id' => ['required'],
             'attendance_type' => ['required','min:3','max:100',Rule::unique('tbl_attendance_type','attendance_type')->where(function ($query) use ($id) {
                $query->where('id','<>', $id);
                })],
            'description' => ['required','min:3','max:200'],
            'status' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }
        else{

            $attendance_type     =   AttendaceTypeModel::where('guid',$request->id);
            $attendance_type =   $attendance_type->first();
            if (!$attendance_type) {
                $error = 'No Data Found.';
                return $this->sendapiError($error,404);
            }


           // $attendance_type                    =   AttendaceTypeModel::find($id);
            $attendance_type->guid              =   Str::uuid();
            $attendance_type->attendance_type   =   $request->attendance_type;
            $attendance_type->description       =   $request->description;
            $attendance_type->isactive          =   ($request->status=='Active')?true:false;
            $attendance_type->save();
            $attendance_type->isactive          =   $request->status?'Active':'Inactive';
            return $this->sendResponse($attendance_type,'Attendance Type updated successfully.',200,$request,'update attendance type');
        }
    }
    public function delete_attendance_type(Request $request){
        $attendance_type   =   AttendaceTypeModel::where('guid',$request->id);
        $attendance_type_all =   $attendance_type->get();
        if ($attendance_type_all->isEmpty()) {
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        $attendance_type->delete();
        return $this->sendResponse([],'Attendance Type deleted successfully.',200,$request,'delete attendance type');
    }
    public function bulk_attendance(Request $request){
        $selected_employees =  $request->selectedEmployees;
        $importdata         =  $request->data;
        $cur_user = Auth::guard('api')->user();
        if(!empty($importdata)){
            foreach($importdata as $cur_data){
                if(in_array($cur_data['Employee_ID'],$selected_employees)){
                    
                    $user = User::where('emp_id',$cur_data['Employee_ID'])->first();
                    $project = ProjectModel::where('projectid',$cur_data['Project_ID'])->first();
                    if(!empty($user->id) && !empty($project->guid)){
                        $cur_data['Check_In_24hours_format']       =   $this->convertToRailwayTime($cur_data['Check_In_24hours_format']);
                        $cur_data['Check_Out_24hours_format']      =   $this->convertToRailwayTime($cur_data['Check_Out_24hours_format']);
                        $check_in                   =   CheckinModel::where('date',date('Y-m-d', strtotime($cur_data['Date_dd_mm_yyyy'])))->where('checkin',$cur_data['Check_In_24hours_format'])->where('checkout',$cur_data['Check_Out_24hours_format'])->first();
                        if(empty($check_in)){
                            $check_in               =   new CheckinModel();
                        }
                        $check_in->guid             =   Str::uuid(10);
                        $check_in->checkin          =   date('H:i:s', strtotime($cur_data['Check_In_24hours_format']));
                        $check_in->checkout         =   date('H:i:s', strtotime($cur_data['Check_Out_24hours_format']));
                        $check_in->user_id          =   $cur_user->user_id;
                        $check_in->emp_id           =   $user->guid;
                        $check_in->project_id       =   $project->guid;
                        $check_in->date             =   date('Y-m-d', strtotime($cur_data['Date_dd_mm_yyyy']));
                        $check_in->checkin          =   $cur_data['Check_In_24hours_format'];
                        $check_in->checkout         =   $cur_data['Check_Out_24hours_format'];
                        $check_in->attendance_type  =   $cur_data['Attendance_Type'];
                        $check_in->save();
                    }
                }
            }
             return $this->sendResponse([],'Attendance marked successfully.',200,$request,'bulk attendance');
        }
    }
    private function convertToRailwayTime($timeInput) {
        // Create DateTime object from input
        $time = new DateTime($timeInput);
        
        // Format the time in 24-hour format (HH:mm)
        return $time->format("H:i");
    }

    
	    public function bulk_checkin(Request $request)
    {
        $importdata = $request->employees;
        $cur_user   = Auth::guard('api')->user();

        $response = [
            'synced_ids' => [],
            'failed_ids' => [],
            'errors'     => [],
            'total'      => 0,
            'synced'     => 0,
            'failed'     => 0,
        ];

        if (!empty($importdata)) {

            $response['total'] = count($importdata);

            foreach ($importdata as $cur_data) {

                try {

                    if (empty($cur_data['Employee_ID']) || empty($cur_data['Role_Id'])) {
                        throw new \Exception('Employee_ID or Role_Id missing');
                    }

                    $user = User::where('guid', $cur_data['Employee_ID'])->first();
                    if (!$user) {
                        throw new \Exception('Employee not found');
                    }

                    $get_role = RoleModel::where('guid', $cur_data['Role_Id'])->first();
                    if (!$get_role) {
                        throw new \Exception('Role not found');
                    }

                    // Load role logic only once
                    $check_role_login = RolesAttendanceLogicModel::where('role_id', $get_role->id)->first();

                    $project = null;
                    if (!empty($cur_data['Project'])) {
                        $project = ProjectModel::where('guid', $cur_data['Project'])->first();
                    }

                    if (
                        (!empty($check_role_login->project_required) &&
                            $check_role_login->project_required &&
                            empty($project))
                    ) {
                        throw new \Exception('Project required but not provided');
                    }

                    $attendance_type = $this->get_attendace_type();

                    $check_in = new CheckinModel();
                    $check_in->guid            = (string) \Str::uuid();
                    $check_in->checkin         = $cur_data['Check_In'];
                    $check_in->user_id         = $cur_user->user_id;
                    $check_in->emp_id          = $user->guid;
                    $check_in->project_id      = $project->guid ?? '';
                    $check_in->date            = date('Y-m-d', strtotime($cur_data['Date']));
                    $check_in->attendance_type = $attendance_type;
                    $check_in->checkin_lat     = $cur_data['Latitude'] ?? '';
                    $check_in->checkin_lang    = $cur_data['Longitude'] ?? '';
                    $check_in->save();

                    // Success tracking
                    $response['synced_ids'][] = $cur_data['Employee_ID'];
                } catch (\Exception $e) {

                    $response['failed_ids'][] = $cur_data['Employee_ID'] ?? 'unknown';

                    $response['errors'][] = [
                        'id'    => $cur_data['Employee_ID'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            $response['synced'] = count($response['synced_ids']);
            $response['failed'] = count($response['failed_ids']);

            return $this->sendResponse(
                $response,
                'Bulk attendance processed.',
                200,
                $request,
                'bulk checkin'
            );
        }

        return $this->sendResponse([], 'No data provided.', 400, $request, 'bulk checkin');
    }



    public function bulk_checkout(Request $request)
    {
        $importdata = $request->employees;
        $cur_user   = Auth::guard('api')->user();

        $response = [
            'synced_ids' => [],
            'failed_ids' => [],
            'errors'     => [],
            'total'      => 0,
            'synced'     => 0,
            'failed'     => 0,
        ];

        if (!empty($importdata)) {

            $response['total'] = count($importdata);

            foreach ($importdata as $cur_data) {

                try {

                    if (
                        empty($cur_data['Employee_ID']) ||
                        empty($cur_data['Project']) ||
                        empty($cur_data['Role_Id'])
                    ) {
                        throw new \Exception('Required fields missing');
                    }

                    $user = User::where('guid', $cur_data['Employee_ID'])->first();
                    if (!$user) {
                        throw new \Exception('Employee not found');
                    }

                    $project = ProjectModel::where('guid', $cur_data['Project'])->first();
                    if (!$project) {
                        throw new \Exception('Project not found');
                    }

                    $get_role = RoleModel::where('guid', $cur_data['Role_Id'])->first();
                    if (!$get_role) {
                        throw new \Exception('Role not found');
                    }

                    $check_role_login = RolesAttendanceLogicModel::where('role_id', $get_role->id)->first();

                    if (
                        (!empty($check_role_login->project_required) &&
                            $check_role_login->project_required &&
                            empty($project))
                    ) {
                        throw new \Exception('Project required but not provided');
                    }

                    $check_out = CheckinModel::where('date', date('Y-m-d', strtotime($cur_data['Date'])))
                        ->where('emp_id', $user->guid)
                        ->whereNull('checkout')
                        ->first();

                    if (!$check_out) {
                        throw new \Exception('No active check-in found for checkout');
                    }

                    // Update checkout
                    $check_out->checkout       = $cur_data['Check_Out'];
                    $check_out->emp_id         = $user->guid;
                    $check_out->project_id     = $project->guid ?? '';
                    $check_out->date           = date('Y-m-d', strtotime($cur_data['Date']));
                    $check_out->checkout_lat   = $cur_data['Latitude'] ?? '';
                    $check_out->checkout_lang  = $cur_data['Longitude'] ?? '';
                    $check_out->save();

                    $response['synced_ids'][] = $cur_data['Employee_ID'];
                } catch (\Exception $e) {

                    $response['failed_ids'][] = $cur_data['Employee_ID'] ?? 'unknown';

                    $response['errors'][] = [
                        'id'    => $cur_data['Employee_ID'] ?? 'unknown',
                        'error' => $e->getMessage()
                    ];
                }
            }

            $response['synced'] = count($response['synced_ids']);
            $response['failed'] = count($response['failed_ids']);

            return $this->sendResponse(
                $response,
                'Bulk checkout processed.',
                200,
                $request,
                'bulk checkout'
            );
        }

        return $this->sendResponse([], 'No data provided.', 400, $request, 'bulk checkout');
    }
    
	
	
    private function get_attendace_type(){
        $cur_user = Auth::guard('api')->user();
        $attendance_type    =    '';
        $user_roles     = UserRoleModel::with(['Roles','Roles.AttendanceLogic','Roles.AttendanceLogic.AttendanceTypes'])->where('user_id',$cur_user->user_id)->get();
        if($user_roles->isNotEmpty()){
            $user_roles_array = $user_roles->toArray();
            foreach($user_roles_array as $user_role_1){
                if(!empty($user_role_1['roles']['attendance_logic']['attendance_types']['attendance_type'])){
                    $attendance_type    .=  $user_role_1['roles']['attendance_logic']['attendance_types']['attendance_type'].',';
                }
            } 
        }
        return $attendance_type = (!empty($attendance_type))?rtrim($attendance_type,','):'';
    }
	
	    public function check_in_out(Request $request)
    {
        $project_required = 0;

        /* -----------------------------------------
       BASIC VALIDATION (role required always)
    ------------------------------------------*/
        $validator = Validator::make($request->all(), [
            'type'      => ['required', 'in:checkin,checkout'],
            'empguid'   => ['required'],
            'date_time' => ['required', 'date_format:Y-m-d H:i:s'],
            'role_id'   => ['required'],
            'project'   => ['required'],
        ]);

        if ($validator->fails()) {
            return $this->sendError('validation', [
                'errors' => $validator->errors()->messages()
            ], 400);
        }

        /* -----------------------------------------
       ROLE CHECK
    ------------------------------------------*/
        $get_role = RoleModel::where('guid', $request->role_id)->first();
        if (!$get_role) {
            return $this->sendapiError('No Role Found.', 404);
        }

        /* -----------------------------------------
       EMPLOYEE CHECK
    ------------------------------------------*/
        $user = TplUserModel::where('guid', $request->empguid)->first();
        if (!$user) {
            return $this->sendapiError('No Employee Found.', 404);
        }

        $user_id = $user->id;

        $check_user_role = UserRoleModel::where('user_id', $user_id)
            ->where('role_id', $get_role->id)
            ->first();

        if (!$check_user_role) {
            return $this->sendapiError('Employee does not have this role.', 404);
        }

        /* -----------------------------------------
       ROLE ATTENDANCE LOGIC
    ------------------------------------------*/
        $check_role_login = RolesAttendanceLogicModel::where('role_id', $get_role->id)->first();

        if ($check_role_login) {

            if ($check_role_login->project_required) {
                $project_required = 1;

                $project = ProjectModel::where('guid', $request->project)->first();
                if (!$project) {
                    return $this->sendapiError('No Project Found.', 404);
                }
            }

            if ($check_role_login->location_required) {
                if (empty($request->latitude) || empty($request->longitude)) {
                    return $this->sendapiError('Latitude and Longitude are required.', 400);
                }
            }
        }

        $cur_user = Auth::guard('api')->user();
        $attendance_date = date('Y-m-d', strtotime($request->date_time));
        $attendance_time = date('H:i:s', strtotime($request->date_time));

        /* =========================================
       CHECK-IN
    =========================================*/
        if ($request->type == 'checkin') {

            // Check if already checked in (open record exists)
            $existing = CheckinModel::where('date', $attendance_date)
                ->where('emp_id', $request->empguid)
                ->when($project_required, function ($q) use ($request) {
                    $q->where('project_id', $request->project);
                })
                ->whereNull('checkout')
                ->first();

            if ($existing) {
                return $this->sendapiError('Already checked in. Please checkout first.', 400);
            }

            $check_in = new CheckinModel();
            $check_in->guid             = Str::uuid();
            $check_in->checkin          = $attendance_time;
            $check_in->date             = $attendance_date;
            $check_in->emp_id           = $request->empguid;
            $check_in->user_id          = $cur_user->user_id;
            $check_in->project_id       = $request->project;
            $check_in->checkin_lat      = $request->latitude ?? '';
            $check_in->checkin_lang     = $request->longitude ?? '';
            $check_in->attendance_type  = $this->get_attendace_type();
            $check_in->save();

            return $this->sendResponse([], 'Checked In Successfully', 200, $request, 'check in');
        }

        /* =========================================
            CHECK-OUT
        =========================================*/ else {

            $check_out = CheckinModel::where('date', $attendance_date)
                ->where('emp_id', $request->empguid)
                ->when($project_required, function ($q) use ($request) {
                    $q->where('project_id', $request->project);
                })
                ->whereNull('checkout')
                ->first();

            if (!$check_out) {
                return $this->sendapiError('No active check-in found.', 400);
            }

            $check_out->checkout              = $attendance_time;
            $check_out->checkout_project_id   = $request->project ?? '';
            $check_out->checkout_lat          = $request->latitude ?? '';
            $check_out->checkout_lang         = $request->longitude ?? '';
            $check_out->save();

            return $this->sendResponse($check_out, 'Checked Out Successfully', 200, $request, 'check out');
        }
    }
	
    public function web_check_in_out(Request $request){
        $cur_user = Auth::guard('api')->user();
        $project_required = 0;
        if(empty($request->role_id)){
            $validator = Validator::make($request->all(), [
                'type' => ['required','in:checkin,checkout'],
                'empguid' => ['required'],
                'date_time' => ['required', 'date_format:Y-m-d H:i:s'],
                'project'=>['required'],
            ]);
        }
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        
        if($request->type=='checkin'){
            $check_in = CheckinModel::where('date',date('Y-m-d',strtotime($request->date_time)))->where('emp_id',$request->empguid)->whereNull('checkin')->first();

            if(empty($check_in)){
                $check_in       = new CheckinModel();
                $check_in->guid = Str::uuid(10);
            }
            $prev_check_in = CheckinModel::where('date',date('Y-m-d',strtotime($request->date_time)))->where('emp_id',$request->empguid)->whereNull('checkout')->first();
            if(!empty($prev_check_in)){
                $prev_check_in->checkout = date('H:i:s', strtotime($request->date_time));
                $prev_check_in->save();
            }
            $attendance_type        = $this->get_attendace_type();
            
            $check_in->checkin      = date('H:i:s', strtotime($request->date_time));
            $check_in->date         = date('Y-m-d', strtotime($request->date_time));
            $check_in->emp_id       = $request->empguid;
            $check_in->user_id      = $cur_user->user_id;
            $check_in->project_id   = $request->project;
            $check_in->checkin_lat  = (!empty($request->latitude))?$request->latitude:'';
            $check_in->checkin_lang = (!empty($request->longitude))?$request->longitude:'';
            $check_in->attendance_type=   $attendance_type;
            $check_in->save();
            return $this->sendResponse([],'Checked In Successfully',200,$request,'check in');
        }
        else{
            if(!empty($project_required)){
                $check_out = CheckinModel::where('date',date('Y-m-d',strtotime($request->date_time)))->where('emp_id',$request->empguid)->where('project_id',$request->project)->whereNull('checkout')->first();
            }
            else{
                $check_out = CheckinModel::where('date',date('Y-m-d',strtotime($request->date_time)))->where('emp_id',$request->empguid)->whereNull('checkout')->first();

            }
            if(empty($check_out->id)){
                $check_out          = new CheckinModel();
                $check_out->guid    = Str::uuid(10);
            }
            $check_out->checkout    = date('H:i:s', strtotime($request->date_time));
            $check_out->date        = date('Y-m-d', strtotime($request->date_time));
            $check_out->emp_id      = $request->empguid;
            $check_out->user_id     = $cur_user->id;
            $check_out->checkout_project_id  = (!empty($request->project))?$request->project:'';
            $check_out->checkout_lat  = (!empty($request->latitude))?$request->latitude:'';
            $check_out->checkout_lang = (!empty($request->longitude))?$request->longitude:'';
            $check_out->save();
            return $this->sendResponse($check_out,'Checked Out Successfully',200,$request,'check out');
            
        }
    }
    public function get_checked_in(Request $request){
         $validator = Validator::make($request->all(), [
            'date' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $date = $request->date;
        $length = $request->length ?? 100;
        $all_user = TplUserModel::with(['User','Roles','Entities','Classifications','Categories','Checkin','Project']);
        if(!empty($request->name) && (empty($request->emp_id) || $request->name!=$request->emp_id)){
            $all_user = $all_user->where('name','like','%'.$request->name);
        }
        if(!empty($request->emp_id)){
            $all_user = $all_user->whereHas('User', function ($query) use ($request) {
                $query->where('emp_id', $request->emp_id );
            });
        }
        if(!empty($request->classification) && $request->classification!='all'){
            $all_user = $all_user->whereHas('Classifications', function ($query) use ($request) {
                $query->where('code',$request->classification );
            });
        }
        if(!empty($request->category) && $request->category!='all'){
            $all_user = $all_user->whereHas('Categories', function ($query) use ($request) {
                $query->where('code', $request->category);
            });
        }
        if(!empty($request->entity) && $request->entity!='all'){
             $all_user = $all_user->whereHas('Entities', function ($query) use ($request) {
                $query->where('guid', 'like', '%' . $request->entity . '%');
            });
        }
        $all_user = $all_user->where('isactive',true)->whereDoesntHave('Checkin', function($q) use ($date) {
                                        $q->whereDate('date', date('Y-m-d',strtotime($date)));
                                    });
        $total_count = $all_user->count();
        $all_user = $all_user->paginate($length);
        $last_page = $all_user->lastPage();
        $all_user = $all_user->map(function ($item) use ($date){
            if(!empty($item->image)){
                $item->image = asset($item->image);  
            }
            $check_in = CheckinModel::where('date',date('Y-m-d',strtotime($date)))->where('emp_id',$item->guid)->whereNotNull('checkin')->where('checkin', '!=', '00:00:00')->first();
            if(!empty($check_in->id)){
                $item->check_in_status = 'checkedin';
            }
            else{
                $item->check_in_status = 'Not Checked In';

            }
            return $item;
        });
        return $this->sendResponse(['employees'=>$all_user,'last_page' => $last_page,'total_count' => $total_count],'Employees List',200,$request,'checked in list');
    }
    public function get_checked_out(Request $request){
         $validator = Validator::make($request->all(), [
            'date' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $date = $request->date;
        $all_user = TplUserModel::with(['User','Roles','Entities','Classifications','Categories','Checkin','Project']);
        if(!empty($request->name) && (empty($request->emp_id) || $request->name!=$request->emp_id)){
            $all_user = $all_user->where('name','like','%'.$request->name);
        }
        if(!empty($request->emp_id)){
            $all_user = $all_user->whereHas('User', function ($query) use ($request) {
                $query->where('emp_id', $request->emp_id );
            });
        }
        if(!empty($request->classification) && $request->classification!='all'){
            $all_user = $all_user->whereHas('Classifications', function ($query) use ($request) {
                $query->where('code',$request->classification );
            });
        }
        if(!empty($request->category) && $request->category!='all'){
            $all_user = $all_user->whereHas('Categories', function ($query) use ($request) {
                $query->where('code', $request->category);
            });
        }
        if(!empty($request->entity) && $request->entity!='all'){
             $all_user = $all_user->whereHas('Entities', function ($query) use ($request) {
                $query->where('guid', 'like', '%' . $request->entity . '%');
            });
        }
        $all_user = $all_user->where('isactive',true)->whereHas('Checkin', function ($query) use ($request) {
                    $query->where('date', date('Y-m-d',strtotime($request->date) ));
                    $query->whereNotNull('checkin');
                    $query->whereNull('checkout');
                    
                });
        $length = $request->length ?? 100;
        $total_count = $all_user->count();
        $all_user = $all_user->paginate($length);
        $last_page = $all_user->lastPage();
        $all_user = $all_user->map(function ($item) use ($date){
           
            $check_in = CheckinModel::where('date',date('Y-m-d',strtotime($date)))->where('emp_id',$item->guid)->whereNotNull('checkin')->first();
            if(!empty($check_in->id)){
                $item->check_in_status = $check_in->checkin;
                return $item;
            }
            
        });
        return $this->sendResponse(['employees'=>$all_user,'last_page' => $last_page,'total_count' => $total_count],'Employees List',200,$request,'checked out list');
    }
    public function get_role_attendance_logic(Request $request){
        $attendance_logic   =   RolesAttendanceLogicModel::with(['Roles','AttendanceTypes'])->orderBy('id','desc')->get();
        return $this->sendResponse($attendance_logic,'Role Attendace Logic',200,$request,'role attendance logic list');
    }
    public function edit_role_attendance_logic(Request $request){
        $validator = Validator::make($request->all(), [
            'guid' => ['required'],
        ]);
        if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $attendance_logic   =   RolesAttendanceLogicModel::with(['Roles','AttendanceTypes'])->where('guid',$request->guid)->first();
        if(empty($attendance_logic)){
            $error = 'No Attendance Logic Found.';
            return $this->sendapiError($error,404);
        }
        return $this->sendResponse($attendance_logic,'Role Attendace Logic',200,$request,'role attendance logic detail');
    }
    public function update_role_attendance_logic(Request $request){
        $validator = Validator::make($request->all(), [
            'role_id' => ['required'],
            'attendance_type' => ['required'],
            'project_required' => ['required'],
            'location_required' => ['required'],
            'comment_required' => ['required'],
            'guid'=>['required']
        ]);
        if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $attendance_logic   =   RolesAttendanceLogicModel::where('guid',$request->guid)->first();
        if(empty($attendance_logic)){
            $error = 'No Attendance Logic Found.';
            return $this->sendapiError($error,404);
        }
        $role = RoleModel::where('guid',$request->role_id)->first();
        if(!$role){
            $error = 'No Role Found.';
            return $this->sendapiError($error,404);
        }
        $attendance_type = AttendaceTypeModel::where('guid',$request->attendance_type)->first();
        if(!$attendance_type){
            $error = 'No Attendance Type Found.';
            return $this->sendapiError($error,404);
        }
        /* $check_attendance_logic = RolesAttendanceLogicModel::where('role_id',$role->id)->first();
        if(!empty($check_attendance_logic)){
            $error = 'Role Already Exist.';
            return $this->sendapiError($error,400);
        } */
        $attendance_logic->role_id              =   $role->id;
        $attendance_logic->attendace_type_id    =   $attendance_type->id;
        $attendance_logic->project_required     =   $request->project_required==1?true:false;
        $attendance_logic->location_required    =   $request->location_required==1?true:false;
        $attendance_logic->comment_required     =   $request->comment_required==1?true:false;
        $attendance_logic->default_comment      =   $request->default_comment?$request->default_comment:'';
        $attendance_logic->description          =   $request->description?$request->description:'';
        $attendance_logic->save();
        return $this->sendResponse($attendance_logic,'Attendance Logic Updated Successfully.',200,$request,'update role attendance logic detail');
    }
    public function delete_role_attendance_logic(Request $request){
        $validator = Validator::make($request->all(), [
            'guid' => ['required'],
        ]);
        if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $attendance_logic   =   RolesAttendanceLogicModel::where('guid',$request->guid)->first();
        if(empty($attendance_logic)){
            $error = 'No Attendance Logic Found.';
            return $this->sendapiError($error,404);
        }
        $attendance_logic ->delete();
        return $this->sendResponse([],'Role Attendace Logic Deleted Successfully.',200,$request,'delete role attendace logic');
    }
    public function create_role_attendance_logic(Request $request){
       $validator = Validator::make($request->all(), [
            'role_id' => ['required'],
            'attendance_type' => ['required'],
            'project_required' => ['required'],
            'location_required' => ['required'],
            'comment_required' => ['required'],
        ]);
        if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $role = RoleModel::where('guid',$request->role_id)->first();
        if(!$role){
            $error = 'No Role Found.';
            return $this->sendapiError($error,404);
        }
        $attendance_type = AttendaceTypeModel::where('guid',$request->attendance_type)->first();
        if(!$attendance_type){
            $error = 'No Attendance Type Found.';
            return $this->sendapiError($error,404);
        }
        $check_attendance_logic = RolesAttendanceLogicModel::where('role_id',$role->id)->first();
        if(!empty($check_attendance_logic)){
            $error = 'Role Already Exist.';
            return $this->sendapiError($error,400);
        }
        $attendance_logic                       =   new RolesAttendanceLogicModel();
        $attendance_logic->role_id              =   $role->id;
        $attendance_logic->guid                 =   Str::uuid();
        $attendance_logic->attendace_type_id    =   $attendance_type->id;
        $attendance_logic->project_required     =   ($request->project_required && $request->project_required==1)?true:false;
        $attendance_logic->location_required    =   ($request->location_required && $request->location_required==1)?true:false;
        $attendance_logic->comment_required     =   ($request->comment_required && $request->comment_required==1)?true:false;
        $attendance_logic->default_comment      =   $request->default_comment?$request->default_comment:'';
        $attendance_logic->description          =   $request->description?$request->description:'';
        $attendance_logic->save();
        return $this->sendResponse($attendance_logic,'Attendance Logic Created Successfully.',200,$request,'create role attendace logic');

    }
	
	
	    public function sync_face_logs(Request $request)
    {
		
		\Log::error('API HIT');
		\Log::error($request->all());
		
        $request->validate([
            'logs' => 'required|array|max:500',
            'logs.*.session_id' => 'required|string',
            'logs.*.action_type' => 'required|in:checkin,checkout,enrollment',
            'logs.*.event_time' => 'nullable|date',
            'logs.*.log_payload' => 'required|array',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'status' => 401,
                'message' => 'Unauthorized'
            ], 401);
        }

        $stored = [];
        $skipped = [];

        \DB::beginTransaction();

        try {

            foreach ($request->logs as $log) {

                // Prevent duplicate retry insert
                $exists = FaceOperationLog::where('session_id', $log['session_id'])->exists();

                if ($exists) {
                    $skipped[] = $log['session_id'];
                    continue;
                }

                FaceOperationLog::create([
                    'user_id'     => $user->id, // 🔥 Store auth user
                    'session_id'  => $log['session_id'],
                    'action_type' => $log['action_type'],
                    'event_time'  => $log['event_time'] ?? now(),
                    'log_payload' => $log['log_payload'], // make sure model casts to array/json
                    'sync_status' => 1,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);

                $stored[] = $log['session_id'];
            }

            \DB::commit();

            return response()->json([
                'status' => 200,
                'stored_count' => count($stored),
                'skipped_count' => count($skipped),
            ]);
        } catch (\Exception $e) {

            \DB::rollBack();

            return response()->json([
                'status' => 500,
                'message' => 'Sync failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
	
	
public function syncPunch(Request $request)
{
    $cur_user = Auth::guard('api')->user();

    try {

        \Log::info('SYNC REQUEST:', $request->all());

        // ✅ Validation
        $request->validate([
            'guid'               => 'required|string',
            'emp_id'             => 'required|string',
            'date'               => 'required|date',
            'checkin_time'       => 'nullable',
            'checkout_time'      => 'nullable',
            'checkin_is_manual'  => 'nullable|integer',
            'checkout_is_manual' => 'nullable|integer',
            'checkin_image'      => 'nullable|image',
            'checkout_image'     => 'nullable|image',
        ]);

        $user = User::where('guid', $request->emp_id)->first();

        if (!$user) {
            throw new \Exception('Employee not found');
        }

        // ✅ Upload Images
        $checkinImagePath = null;
        $checkoutImagePath = null;

        if ($request->hasFile('checkin_image')) {
            $file = $request->file('checkin_image');
            $filename = 'checkin_' . time() . '.' . $file->getClientOriginalExtension();
            $checkinImagePath = $file->storeAs('manual_attendance', $filename, 'public');
        }

        if ($request->hasFile('checkout_image')) {
            $file = $request->file('checkout_image');
            $filename = 'checkout_' . time() . '.' . $file->getClientOriginalExtension();
            $checkoutImagePath = $file->storeAs('manual_attendance', $filename, 'public');
        }

        // =====================================================
        // 🟢 CASE 1: CHECK-IN → ALWAYS CREATE NEW
        // =====================================================
        if (!empty($request->checkin_time)) {

            // 🚫 Prevent duplicate rapid check-in (optional safety)
            $recentCheckin = CheckinModel::where('emp_id', $request->emp_id)
                ->where('checkin', '>=', now()->subMinutes(1))
                ->orderBy('checkin', 'desc')
                ->first();

            if ($recentCheckin) {
                return $this->sendResponse(
                    $recentCheckin,
                    'Duplicate check-in ignored.',
                    200,
                    $request,
                    'sync punch'
                );
            }

            $attendance = new CheckinModel();
            $attendance->guid        = $request->guid;
            $attendance->user_id     = $cur_user->user_id;
            $attendance->emp_id      = $request->emp_id;
            $attendance->project_id  = $request->project_id ?? '';
            $attendance->date        = date('Y-m-d', strtotime($request->date));
            $attendance->attendance_type = $this->get_attendace_type();

            $attendance->checkin           = date('Y-m-d H:i:s', strtotime($request->checkin_time));
            $attendance->checkin_lat       = $request->checkin_lat ?? '';
            $attendance->checkin_lang      = $request->checkin_lang ?? '';
            $attendance->checkin_is_manual = $request->checkin_is_manual ?? 0;
            $attendance->checkin_image     = $checkinImagePath;

            $attendance->save();

            return $this->sendResponse(
                $attendance,
                'Check-in created successfully.',
                200,
                $request,
                'sync punch'
            );
        }

        // =====================================================
        // 🟡 CASE 2: CHECK-OUT
        // =====================================================
        if (!empty($request->checkout_time)) {

            // 🔍 Find latest OPEN check-in
            $attendance = CheckinModel::where('emp_id', $request->emp_id)
                ->whereDate('date', $request->date)
                ->whereNotNull('checkin')
                ->whereNull('checkout')
                ->orderBy('checkin', 'desc')
                ->first();

            if ($attendance) {
                // ✅ Attach checkout to existing record
                $attendance->checkout           = date('Y-m-d H:i:s', strtotime($request->checkout_time));
                $attendance->checkout_lat       = $request->checkout_lat ?? '';
                $attendance->checkout_lang      = $request->checkout_lang ?? '';
                $attendance->checkout_is_manual = $request->checkout_is_manual ?? 0;

                if ($checkoutImagePath) {
                    $attendance->checkout_image = $checkoutImagePath;
                }

                $attendance->save();

                return $this->sendResponse(
                    $attendance,
                    'Checkout attached successfully.',
                    200,
                    $request,
                    'sync punch'
                );
            }

            // ❗ No open check-in → standalone checkout
            $attendance = new CheckinModel();
            $attendance->guid        = $request->guid;
            $attendance->user_id     = $cur_user->user_id;
            $attendance->emp_id      = $request->emp_id;
            $attendance->project_id  = $request->project_id ?? '';
            $attendance->date        = date('Y-m-d', strtotime($request->date));
            $attendance->attendance_type = $this->get_attendace_type();

            $attendance->checkout           = date('Y-m-d H:i:s', strtotime($request->checkout_time));
            $attendance->checkout_lat       = $request->checkout_lat ?? '';
            $attendance->checkout_lang      = $request->checkout_lang ?? '';
            $attendance->checkout_is_manual = $request->checkout_is_manual ?? 0;
            $attendance->checkout_image     = $checkoutImagePath;

            $attendance->save();

            return $this->sendResponse(
                $attendance,
                'Standalone checkout created.',
                200,
                $request,
                'sync punch'
            );
        }

        // =====================================================
        // 🔴 INVALID REQUEST
        // =====================================================
        throw new \Exception('Invalid punch data');

    } catch (\Exception $e) {

        \Log::error('SYNC ERROR:', ['error' => $e->getMessage()]);

        return $this->sendResponse(
            [],
            $e->getMessage(),
            400,
            $request,
            'sync punch'
        );
    }
}
}
