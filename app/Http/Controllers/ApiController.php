<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\AuditLogModel;
use App\Models\CheckinModel;
use App\Models\EntityModel;
use App\Models\EntrolledImageModel;
use App\Models\MasterValueModel;
use App\Models\PayloadLogModel;
use App\Models\ProjectLatLngModel;
use App\Models\ProjectModel;
use App\Models\RoleModel;
use App\Models\TplUserModel;
use App\Models\User;
use App\Models\UserProjectModel;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use App\Http\Middleware\CheckApiAuth;


class ApiController extends Controller
{
    public function dashboard(Request $request){
        $user = Auth::guard('api')->user();
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date_format:Y-m-d'],
        ]);
         if($validator->fails()){
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }
        else{
             $total_employees = TplUserModel::where('isactive',1)->where('id',$user->user_id)->where('created_at', '>=',$request->date)->count();
             $today_checkin   = CheckinModel::where('date', '>=',$request->date)->where('user_id',$user->user_id)->whereNotNull('checkin')->count();
             $today_checkout  = CheckinModel::where('date', '>=',$request->date)->where('user_id',$user->user_id)->whereNotNull('checkout')->count();

             $today_entrolled  = EntrolledImageModel::where('updated_at', '>=',$request->date)->where('empguid',$user->guid)->count();
             $project    =   ProjectModel::with('Entity')->where('isactive',true)->orderBy('id','desc')->get();

             $response = array('total_employees'=>$total_employees,'check_in_today'=>$today_checkin,'check_out_today'=>$today_checkout,'face_entrolled_today'=>$today_entrolled,'project'=>$project);
             return $this->sendResponse($response,'Dashboard Details.',200,$request,'dashboard');
        }
    }
    public function change_password(Request $request){
        $user = Auth::guard('api')->user();
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,0);
        }
        if (!Hash::check($request->current_password, $user->password)) {
            $error = 'Current password is incorrect';
            return $this->sendapiError($error,400);
        }
        $user->password = Hash::make($request->new_password);
        $user->save();
        return $this->sendResponse([],'Password changed successfully.',200,$request,'change password');
    }
    public function update_profile(Request $request){
        $user = Auth::guard('api')->user();
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:200',
            'email' => 'required|email',
            'mobile' => 'required|numeric|digits:10',
            'entity' => 'required',
            'category' => 'required',
            'classification' => 'required',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        $entities    =   EntityModel::where('guid',$request->entity)->first();
        if (!$entities) {
             $error = 'No Entity Found.';
            return $this->sendapiError($error,404);
        }
        $classification    =   MasterValueModel::where('guid',$request->classification)->where('master_key','CLASSIFICATION')->first();
        if (!$classification) {
             $error = 'No Classification Found.';
            return $this->sendapiError($error,404);
        }
        $category    =   MasterValueModel::where('guid',$request->category)->where('master_key','CATEGORY')->first();
        if (!$category) {
             $error = 'No Category Found.';
            return $this->sendapiError($error,404);
        }
        $user->email = $request->email;
        $user->save();
        $tpl_user = TplUserModel::find($user->user_id);
        $tpl_user->email                =   $request->email; 
        $tpl_user->name                 =   $request->name; 
        $tpl_user->mobile               =   $request->mobile; 
        $tpl_user->entity_id            =   $entities->id; 
        $tpl_user->classification_code  =   $classification->code; 
        $tpl_user->category_code        =   $category->code; 
        $tpl_user->save();
        return $this->sendResponse([],'Profile Updated successfully.',200,$request,'update profile');
    }
    public function get_role(Request $request){
        $role   =   RoleModel::orderBy('id','desc')->get();
        return $this->sendResponse($role,'',200,$request,'get role');
    }
    public function create_role(Request $request){
        $user = Auth::guard('api')->user();
        $validator = Validator::make($request->all(), [
            'code' => ['required','min:2','max:200','unique:tbl_role,rolecode'],
            'name' => ['required','min:2','max:40'],
            'mobilePermissions' => 'required_without:webPermissions',
            'webPermissions' => 'required_without:mobilePermissions',
        ]);
         if($validator->fails()){
            $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }
        else{
            $mobile_permission = !empty($request->mobilePermissions)?explode(',',$request->mobilePermissions):array();
 
            $web_permission = !empty($request->webPermissions)?explode(',',$request->webPermissions):array();

            $role                       =   new RoleModel();
            $role->guid                 =   Str::uuid();
            $role->rolecode             =   $request->code;
            $role->rolename             =   $request->name;
            $role->roledesc             =   (!empty($request->description))?$request->description:'';
            $role->mobile_permission    =   json_encode($mobile_permission);
            $role->web_permission       =   json_encode($web_permission);
            $role->createdby            =   $user->id;
            $role->updatedby            =   $user->id;
            $role->save();
            return $this->sendResponse($role,'Role created successfully.',200,$request,'create role');
        }
    }
    public function update_role(Request $request){
        $user = Auth::guard('api')->user();
        $id = (!empty($request->id))?$request->id:'';
        $validator = Validator::make($request->all(), [
            'id' => ['required'],
            'code' => ['required','min:2','max:200',Rule::unique('tbl_role','rolecode')->where(function ($query) use ($id) {
                $query->where('guid','<>', $id);
                })],
            'name' => ['required','min:2','max:40'],
            'mobilePermissions' => 'required_without:webPermissions',
            'webPermissions' => 'required_without:mobilePermissions',
        ]);
         if($validator->fails()){
            $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        else{
            $mobile_permission = !empty($request->mobilePermissions)?explode(',',$request->mobilePermissions):array();
 
            $web_permission = !empty($request->webPermissions)?explode(',',$request->webPermissions):array();

            $role     =   RoleModel::where('guid',$request->id);
            $role =   $role->first();
            if (!$role) {
                $error = 'No Data Found.';
                return $this->sendapiError($error,404);
            }

            //$role                       =   RoleModel::find($request->id);
            $role->roledesc             =   (!empty($request->description))?$request->description:'';
            $role->mobile_permission    =   json_encode($mobile_permission);
            $role->web_permission       =   json_encode($web_permission);
            $role->updatedby            =   $user->id;
            $role->save();
            return $this->sendResponse($role,'Role updated successfully.',200,$request,'update role');
        }
    }
    public function delete_role(Request $request){
        $role     =   RoleModel::where('guid',$request->id);
        $role_all =   $role->get();
        if ($role_all->isEmpty()) {
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        $role->delete();
        return $this->sendResponse([],'Role deleted successfully.',200,$request,'delete role');
    }
    public function get_projects(Request $request){
        $user = Auth::guard('api')->user();
        $user_id = $user->user_id;
        if(!empty($request->latitude) && !empty($request->longitude)){
            $porject['project_lat_lng']    =   ProjectModel::getProjectsWithinRadius($user_id,$request->latitude,$request->longitude);
            $porject['all_projects']    =   ProjectModel::with('Entity','UserProject','ProjectLatLng')->where('isactive',true)->whereHas('UserProject', function ($query) use ($user_id) {
                $query->where('user_id', $user_id);
            })->orderBy('id','desc')->get();

        }
        else{
            $porject['all_projects']    =   ProjectModel::with(['Entity','UserProject','ProjectLatLng'])->where('isactive',true)->whereHas('UserProject', function ($query) use ($user_id) {
                $query->where('user_id', $user_id);
            })->orderBy('id','desc')->get();
        }
         return $this->sendResponse($porject,'',200,$request,'get projects');
    }
    public function web_get_projects(Request $request){
        $porject    =   ProjectModel::with(['Entity','ProjectLatLng', 'UserProject.User'])->orderBy('id','desc')->get();
         return $this->sendResponse($porject,'',200,$request,'get projects');
    }
    public function get_categories(Request $request){
        $entities    =   MasterValueModel::orderBy('description','asc')->where('master_key','CATEGORY')->get();
         return $this->sendResponse($entities,'',200,$request,'get categories');
    }
    public function get_classifications(Request $request){
        $classifications    =   MasterValueModel::orderBy('description','asc')->where('master_key','CLASSIFICATION')->get();
        return $this->sendResponse($classifications,'',200,$request,'get classifications');
    }
    public function get_entities(Request $request){
        $entities    =   EntityModel::orderBy('entityname','asc')->get();
         return $this->sendResponse($entities,'',200,$request,'get entities');
    }
    public function update_project(Request $request){
        $validator = Validator::make($request->all(), [
            'project_id' => 'required',
            'latitude' => 'required',
            'longitude' => 'required',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        $project            =   ProjectModel::where('guid',$request->project_id)->first();
        if(empty($project)){
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        if(!empty($request->address)){
            $project->location_longname = $request->address;
            $project->location_shotname = $request->address;
            $project->save();
        }
        ProjectLatLngModel::where('project_id',$project->id)->delete();
        $project_lats   =   explode(',',$request->latitude);
        $project_lngs   =   explode(',',$request->longitude);
        if(!empty($project_lats)){
            foreach($project_lats as $key=>$cur_lat){
                if(!empty($cur_lat)){
                    $project_lat_lng                =   new ProjectLatLngModel();
                    $project_lat_lng->project_id    =   $project->id;
                    $project_lat_lng->latitude      =   $cur_lat;
                    $project_lat_lng->longitude     =   $project_lngs[$key];
                    $project_lat_lng->save();
                }
            }
        }
        return $this->sendResponse([],'Project updated successfully.',200,$request,'update project');

    }


    public function removeProjectLocation(Request $request)
{
    $validator = Validator::make($request->all(), [
        'project_id' => 'required',
    ]);

    if ($validator->fails()) {
        $validation_error = validation_api_errors_message($validator->errors()->messages());
        return $this->sendapiError($validation_error, 400);
    }

    $project = ProjectModel::where('guid', $request->project_id)->first();

    if (empty($project)) {
        return $this->sendapiError('No Data Found.', 404);
    }

    // 🔥 Remove address (optional but recommended)
    $project->location_longname = null;
    $project->location_shotname = null;
    $project->save();

    // 🔥 Delete all polygon coordinates
    ProjectLatLngModel::where('project_id', $project->id)->delete();

    return $this->sendResponse(
        [],
        'Project location removed successfully.',
        200,
        $request,
        'remove project location'
    );
}

    public function create_project(Request $request){
       // $pojects                   = json_decode($request->project);
        $responseData = [
            'inserted' => [],
            'errors' => [],
        ];
        $pojects                   = $request->project;
        
        try{
            if(!empty($pojects)){
                foreach($pojects as $index => $projectData){
                    $validator = Validator::make((array)$projectData, [
                        'entity'     => 'required|string',
                        'id'  => 'required|string|max:100',
                        'name'       => 'required|string|max:100',
                        'location'   => 'nullable|string',
                        'startDate'  => 'required|date',
                        'endDate'    => 'required|date|after_or_equal:startDate',
                        'status'=>'required',
                        'reference_id'=>'required'
                    ]);

                    if ($validator->fails()) {
                        $responseData['errors'][] = [
                            'row' => $index + 1,
                            'errors' => $validator->errors(),
                        ];
                        continue; // Skip this project and move to the next
                    }else{
                    
                        $entity              =   EntityModel::where('entityname',$projectData['entity'])->first();

                        if(empty($entity)){
                            $entity                 =   new EntityModel();
                            $entity->guid           =   Str::uuid(10);
                            $entity->entityname     =   $projectData['entity'];
                            $entity->isactive       =   true;
                            $entity->save();
                        }
                        $check_project              =   ProjectModel::where('unique_id',$projectData['reference_id'])->first();
                        if(empty($check_project)){
                            $project                =   new ProjectModel();
                            $cur_project           =   ProjectModel::where('projectid',$projectData['id'])->first();
                            if(!empty($cur_project)){
                                continue;
                            }
                        }
                        else{
                            $project                =   ProjectModel::find($check_project->id);
                            $cur_project           =   ProjectModel::where('projectid',$projectData['id'])->where('id','!=',$check_project->id)->first();
                            if(!empty($cur_project)){
                                continue;
                            }
                        }
                        $location = [];
                        /* if(!empty($projectData['location'])){
                            $encodedLocation = urlencode($projectData['location']);
                            $url = "https://nominatim.openstreetmap.org/search?q=$encodedLocation&format=json&limit=1";
                            $context = stream_context_create([
                                            'http' => [
                                                'header' => "User-Agent: YourAppName/1.0 (youremail@example.com)\r\n"
                                            ]
                                        ]);
                            // Fetch the response
                            $response = file_get_contents($url,false,$context);
                            if(!empty($response)){
                                $location = json_decode($response, true);
                            }
                        } */
                        if(!empty($location) && !empty($location[0]['lat']) && !empty($location[0]['lon'])){                  
                            $latitude = $location[0]['lat'];
                            $longitude = $location[0]['lon'];
                            $geometry = "POINT($longitude $latitude)";
                        }       
                        else{
                            $latitude  = '';
                            $longitude = '';
                            $geometry  = '';
                        }                     
                        $project->guid              =   Str::uuid(10);
                        $project->projectid         =   $projectData['id'];
                        $project->entity_id         =   $entity->id;
                        $project->projectname       =   $projectData['name'];
                        
                        $project->location_longname =   (!empty($projectData['location']))?$projectData['location']:'';
                        $project->location_shotname =   $projectData['location'];
                        /* if(!empty($location)){
                            $project->geog              =   $geometry;
                            $project->latitude          =   $latitude;
                            $project->longitude         =   $longitude;
                        } */
                        $project->startdate             =   date('Y-m-d',strtotime($projectData['startDate']));
                        $project->enddate               =   date('Y-m-d',strtotime($projectData['endDate']));
                        $project->unique_id             =   $projectData['reference_id'];
                        $project->isactive              =   (strtolower($projectData['status'])=='active')?true:false;
                        $project->save();
                    }
                }
            }
            else{
                $user                       =   Auth::guard('api')->user();
                $audit_log                  =   new AuditLogModel();
                $audit_log->guid            =   Str::uuid(10);
                $audit_log->eventtype       =   'POST';
                $audit_log->eventmodule     =   'Create Project';
                $audit_log->auditlog_desc   =   'Invalid or Incorrect Json';
                $audit_log->from_userid     =   $user->id;
                $audit_log->isauto          =   true;
                $audit_log->date            =   date('Y-m-d');
                $audit_log->reference       =   'Josn Error';
                $audit_log->save();
                
            }
        }catch(Exception $e){
            $user                       =   Auth::guard('api')->user();
            $audit_log                  =   new AuditLogModel();
            $audit_log->guid            =   Str::uuid(10);
            $audit_log->eventtype       =   'POST';
            $audit_log->eventmodule     =   'Create Project';
            $audit_log->auditlog_desc   =   $e->getMessage();
            $audit_log->from_userid     =   $user->id;
            $audit_log->to_userid       =   '';
            $audit_log->isauto          =   true;
            $audit_log->date            =   date('Y-m-d');
            $audit_log->reference       =   $e->getMessage();
            $audit_log->save();
        }
        return $this->sendResponse([],'Project created successfully.',200,$request,'create project');
    }
    public function delete_project(Request $request){
        $project     =   ProjectModel::where('guid',$request->id);
        $project_all =   $project->get();
        if ($project_all->isEmpty()) {
             $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        foreach($project_all as $project_1){
            $upd_project     =  ProjectModel::find($project_1->id);
            if(!empty($upd_project)){
                $upd_project->isactive =  false;
                $upd_project->save();
            }
        }
        //$project->delete();
        return $this->sendResponse([],'Project deleted successfully.',200,$request,'delete project');
    }
    public function assign_project(Request $request){
        $user_id = (!empty($request->user_id))?$request->user_id:'';
        if(empty($request->assigned_id)){
            $validator = Validator::make($request->all(), [
                'user_id' => 'required',
                'project_id' => ['required',Rule::unique('tbl_user_project','project_id')->where(function ($query) use ($user_id) {
                    $query->where('user_id', $user_id);
                    })]
            ]);
        }
        else{
            $assigned_id = $request->assigned_id;
            $validator = Validator::make($request->all(), [
                'user_id' => 'required',
                'project_id' => ['required',Rule::unique('tbl_user_project','project_id')->where(function ($query) use ($user_id,$assigned_id) {
                    $query->where('user_id', $user_id);
                    $query->where('id','<>', $assigned_id);
                    })]
            ]);
        }
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        if(empty($request->assigned_id)){
            $user_project           = new UserProjectModel();
            $user_project->user_id  = $request->user_id;
        }
        else{
            $user_project           = UserProjectModel::find($request->assigned_id);
            if(empty($user_project)){
                $error = 'No Data Found.';
                return $this->sendapiError($error,404);
            }
        }
        $user_project->project_id   = $request->project_id;
        $user_project->save();
        return $this->sendResponse([],'Project assigned successfully.',200,$request,'assign project');
    }
    public function get_assigned_projects(Request $request){
        $validator = Validator::make($request->all(), [
            'user_id' => 'required',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        $user_project               = UserProjectModel::with(['Project','Project.Entity'])->where('user_id',$request->user_id)->get();
        return $this->sendResponse($user_project,'',200,$request,'Get assigned project');
    }
    public function delete_assigned_project(Request $request){
        $validator = Validator::make($request->all(), [
            'assign_id' => 'required',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        $user_project               = UserProjectModel::find($request->assign_id);
        if(empty($user_project)){
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        $user_project->delete();
        return $this->sendResponse([],'Assigned Project Deleted Successfully.',200,$request,'Delete assigned project');
    }
    public function show_assigned_project(Request $request){
        $validator = Validator::make($request->all(), [
            'assign_id' => 'required',
        ]);
        if ($validator->fails()) {
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
        }
        $user_project               = UserProjectModel::find($request->assign_id);
        if(empty($user_project)){
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }
        return $this->sendResponse($user_project,'Show Assigned Project Successfully.',200,$request,'Show assigned project');
    }
    public function get_payload(Request $request){
         $validator = Validator::make($request->all(), [
            'api' => ['required'],
        ]);
         if($validator->fails()){
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation',$validation_error, 400);
        }
        $length = $request->length ?? 100;
        $all_payload = PayloadLogModel::where('api',$request->api);
        
        $all_payload = $all_payload->orderBy('id','desc')->paginate($length);

        $all_payload->getCollection()->transform(function ($item) {
            $item->request = json_decode($item->request, true);
            $item->response = json_decode($item->response, true);
            return $item;
        });        
        return $this->sendResponse(['payloads'=>$all_payload],'Payload List',200,$request,'get payload');
    }
    public function add_payload(Request $request){
        return $this->sendResponse([],'Payload Log Added Successfully.',200,$request,'add payload');

    }
	
	
	public function importProjectCsv(Request $request)
    {
        $projects = $request->input('data');

        if (!is_array($projects)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid JSON format'
            ], 422);
        }

        $total    = count($projects);
        $inserted = 0;
        $updated  = 0;

        \DB::beginTransaction();

        try {

            foreach ($projects as $projectData) {

                // REQUIRED FIELDS
                if (
                    empty($projectData['projectId']) ||
                    empty($projectData['name']) ||
                    empty($projectData['reference_id'])
                ) {
                    continue;
                }

                $projectId   = trim($projectData['projectId']);
                $name        = trim($projectData['name']);
                $referenceId = trim($projectData['reference_id']);
                $location    = trim($projectData['location'] ?? '');
                $status      = strtolower(trim($projectData['status'] ?? 'active'));

                // ==================================================
                // ENTITY
                // ==================================================
                $entityName = trim($projectData['entity'] ?? '');

                $entity = EntityModel::whereRaw('LOWER(entityname) = ?', [strtolower($entityName)])->first();

                if (!$entity && $entityName != '') {
                    $entity = new EntityModel();
                    $entity->guid = Str::uuid();
                    $entity->entityname = $entityName;
                    $entity->isactive = true;
                    $entity->save();
                }

                $entityId = $entity ? $entity->id : null;

                // ==================================================
                // CHECK EXISTING PROJECT (by reference_id)
                // ==================================================
                $existingProject = ProjectModel::where('unique_id', $referenceId)->first();

                // Prevent duplicate projectId for different reference
                $duplicateProjectId = ProjectModel::where('projectid', $projectId)
                    ->when($existingProject, fn($q) => $q->where('id', '!=', $existingProject->id))
                    ->first();

                if ($duplicateProjectId) {
                    continue;
                }

                // ==================================================
                // CREATE
                // ==================================================
                if (!$existingProject) {

                    $project = new ProjectModel();
                    $project->guid        = Str::uuid();
                    $project->projectid   = $projectId;
                    $project->unique_id   = $referenceId;
                    $project->projectname = $name;
                    $project->entity_id   = $entityId;
                    $project->location_longname = $location;
                    $project->location_shotname = $location;
                    $project->startdate   = date('Y-m-d', strtotime($projectData['startDate']));
                    $project->enddate     = date('Y-m-d', strtotime($projectData['endDate']));
                    $project->isactive    = $status === 'active';
                    $project->save();

                    $inserted++;
                }
                // ==================================================
                // UPDATE
                // ==================================================
                else {

                    $project = $existingProject;

                    $project->projectid   = $projectId;
                    $project->projectname = $name;
                    $project->entity_id   = $entityId;
                    $project->location_longname = $location;
                    $project->location_shotname = $location;
                    $project->startdate   = date('Y-m-d', strtotime($projectData['startDate']));
                    $project->enddate     = date('Y-m-d', strtotime($projectData['endDate']));
                    $project->isactive    = $status === 'active';
                    $project->save();

                    $updated++;
                }

                // ==================================================
                // HANDLE COORDINATES (Polygon)
                // ==================================================
                if (!empty($projectData['coordinates'])) {

                    // Delete old boundary
                    ProjectLatLngModel::where('project_id', $project->id)->delete();

                    $coordinatePairs = explode('|', $projectData['coordinates']);

                    $bulkInsert = [];

                    foreach ($coordinatePairs as $pair) {

                        $latLng = explode(',', $pair);

                        if (count($latLng) == 2) {

                            $bulkInsert[] = [
                                'project_id' => $project->id,
                                'latitude'   => trim($latLng[0]),
                                'longitude'  => trim($latLng[1]),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                    }

                    if (!empty($bulkInsert)) {
                        ProjectLatLngModel::insert($bulkInsert);
                    }
                }
            }

            \DB::commit();
        } catch (\Throwable $e) {

            \DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status'        => 'success',
            'total_projects' => $total,
            'inserted'      => $inserted,
            'updated'       => $updated
        ]);
    }
}
