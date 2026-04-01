<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\ApiAttendaceController;
use App\Http\Controllers\ApiEmployeeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubActivityController;
use Tymon\JWTAuth\Http\Middleware\Authenticate as JwtAuthenticate;


Route::post('forgot_password', [AuthController::class, 'forgot_password']);
Route::post('login', [AuthController::class, 'login']);
Route::post('reset_password', [AuthController::class, 'resetPassword']);

Route::post('token', [AuthController::class, 'get_token'])->name('token');
Route::post('web_forgot_password', [AuthController::class, 'web_forgot_password']);
Route::post('add_payload', [ApiController::class, 'add_payload'])->name('add_payload');
Route::get('export_enrolled_csv', [ApiEmployeeController::class, 'exportEnrolledCSV'])->name('export_enrolled_csv');
Route::get('export_not_enrolled_csv', [ApiEmployeeController::class, 'exportNotEnrolledCSV'])->name('export_not_enrolled_csv');
Route::get('export_enrolled', [ApiEmployeeController::class, 'exportEnrolledImages'])->name('export_enrolled');
Route::get('export_not_enrolled', [ApiEmployeeController::class, 'NotexportEnrolledImages'])->name('export_not_enrolled');



Route::post('add_enrolled_payload', [ApiEmployeeController::class, 'add_enrolled_payload'])->name('add_enrolled_payload');
Route::post('list_enrolled_payload', [ApiEmployeeController::class, 'list_enrolled_payload'])->name('list_enrolled_payload');

Route::get('export_csv', [ApiEmployeeController::class, 'exportCsv'])->name('export_csv');
Route::post('import_csv', [ApiEmployeeController::class, 'importCsv'])->name('import_csv');

Route::post('importProjectCsv', [ApiController::class, 'importProjectCsv'])->name('projects.excel.import');


// Protected routes using JWT (auth:api)
Route::middleware('check.api.auth')->group(function () {

    Route::post('activity_list', [ActivityController::class, 'index']);
    Route::post('asset_list', [AssetController::class, 'index']);
    Route::post('create_activity', [ActivityController::class, 'create_activity']);
    Route::post('me', [AuthController::class, 'me']);
    Route::post('dashboard', [ApiController::class, 'dashboard']);

    Route::post('attendancetypes', [ApiAttendaceController::class, 'get_attendance_type'])->name('attendancetypes');
    Route::post('create_attendance_type', [ApiAttendaceController::class, 'create_attendance_type'])->name('create_attendance_type');
    Route::post('delete_attendance_type', [ApiAttendaceController::class, 'delete_attendance_type'])->name('delete_attendance_type');


    Route::post('bulk_attendance', [ApiAttendaceController::class, 'bulk_attendance'])->name('bulk_attendance');

    Route::post('bulk_checkin', [ApiAttendaceController::class, 'bulk_checkin'])->name('bulk_checkin');
    Route::post('bulk_checkout', [ApiAttendaceController::class, 'bulk_checkout'])->name('bulk_checkout');

    Route::post('check_in_out', [ApiAttendaceController::class, 'check_in_out'])->name('check_in_out');
    Route::post('web_check_in_out', [ApiAttendaceController::class, 'web_check_in_out'])->name('web_check_in_out');
    Route::post('get_checked_in', [ApiAttendaceController::class, 'get_checked_in'])->name('get_checked_in');
    Route::post('get_checked_out', [ApiAttendaceController::class, 'get_checked_out'])->name('get_checked_out');



    Route::post('create_role_attendance_logic', [ApiAttendaceController::class, 'create_role_attendance_logic'])->name('create_role_attendance_logic');
    Route::post('delete_role_attendance_logic', [ApiAttendaceController::class, 'delete_role_attendance_logic'])->name('delete_role_attendance_logic');
    Route::post('edit_role_attendance_logic', [ApiAttendaceController::class, 'edit_role_attendance_logic'])->name('edit_role_attendance_logic');
    Route::post('get_role_attendance_logic', [ApiAttendaceController::class, 'get_role_attendance_logic'])->name('get_role_attendance_logic');
    Route::post('update_role_attendance_logic', [ApiAttendaceController::class, 'update_role_attendance_logic'])->name('update_role_attendance_logic');
    Route::post('update_attendance_type', [ApiAttendaceController::class, 'update_attendance_type'])->name('update_attendance_type');
 
    Route::post('change_password', [ApiController::class, 'change_password'])->name('change_password');
    Route::post('projects', [ApiController::class, 'get_projects'])->name('get_projects');
    Route::post('web_get_projects', [ApiController::class, 'web_get_projects'])->name('web_get_projects');
    Route::post('create_project', [ApiController::class, 'create_project'])->name('create_project');
    Route::post('delete_project', [ApiController::class, 'delete_project'])->name('delete_project');
    Route::post('get_assigned_projects', [ApiController::class, 'get_assigned_projects'])->name('get_assigned_projects');
    Route::post('delete_assigned_project', [ApiController::class, 'delete_assigned_project'])->name('delete_assigned_project');
    Route::post('assign_project', [ApiController::class, 'assign_project'])->name('assign_project');
    Route::post('show_assigned_project', [ApiController::class, 'show_assigned_project'])->name('show_assigned_project');
    Route::post('get_payload', [ApiController::class, 'get_payload'])->name('get_payload');
    Route::post('remove-project-location', [ApiController::class, 'removeProjectLocation']);

    Route::post('categories', [ApiController::class, 'get_categories'])->name('categories');
    Route::post('classifications', [ApiController::class, 'get_classifications'])->name('classifications');

    Route::post('create_role', [ApiController::class, 'create_role'])->name('create_role');
    Route::post('delete_role', [ApiController::class, 'delete_role'])->name('delete_role');
    Route::post('entities', [ApiController::class, 'get_entities'])->name('entities');
    Route::post('roles', [ApiController::class, 'get_role'])->name('roles');
    Route::post('update_role', [ApiController::class, 'update_role'])->name('update_role');
    Route::post('update_profile', [ApiController::class, 'update_profile'])->name('update_profile');
    Route::post('update_project', [ApiController::class, 'update_project'])->name('update_project');

    Route::post('assign_role', [ApiEmployeeController::class, 'assign_role'])->name('assign_role');
    Route::post('web_assign_role', [ApiEmployeeController::class, 'web_assign_role'])->name('web_assign_role');
    Route::post('create_employee', [ApiEmployeeController::class, 'create_employee'])->name('create_employee');


    Route::post('employees', [ApiEmployeeController::class, 'index'])->name('employees');
    Route::post('web_employees', [ApiEmployeeController::class, 'web_employees'])->name('web_employees');
    Route::post('employeeDetails', [ApiEmployeeController::class, 'employee_details'])->name('employeeDetails');
    Route::post('getallvectors', [ApiEmployeeController::class, 'getallvectors'])->name('getallvectors');
    Route::post('get_user_role', [ApiEmployeeController::class, 'get_user_role'])->name('get_user_role');

    Route::post('history', [ApiEmployeeController::class, 'history'])->name('history');
    Route::post('web_history', [ApiEmployeeController::class, 'web_history'])->name('web_history');
    Route::post('saveentrolledimage', [ApiEmployeeController::class, 'saveentrolledimage'])->name('saveentrolledimage');
    Route::post('removeEnrolledFace', [ApiEmployeeController::class, 'removeEnrolledImage']);
    Route::post('multipleSaveentrolledimage', [ApiEmployeeController::class, 'multipleSaveentrolledimage'])->name('multipleSaveentrolledimage');
    Route::post('generatebulkvector', [ApiEmployeeController::class, 'generatebulkvector'])->name('saveentrolledimage');
    Route::post('reports', [ApiEmployeeController::class, 'reports'])->name('reports');
    Route::post('web_reports', [ApiEmployeeController::class, 'web_reports'])->name('web_reports');
    Route::post('web_report_day_details', [ApiEmployeeController::class, 'web_report_day_details']);

    Route::post('sub_activity_list', [SubActivityController::class, 'index']);

    
    Route::post('web_reset_password', [ApiEmployeeController::class, 'web_reset_password'])->name('web_reset_password');
    
    
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);

    Route::post('sync_face_logs', [ApiAttendaceController::class, 'sync_face_logs']);
    Route::post('/user-checkin-checkout', [ApiAttendaceController::class, 'syncPunch']);

});