<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V2\AuthController;
use App\Http\Controllers\API\V2\StaffController;
use App\Http\Controllers\API\V2\ProjectController;
use App\Http\Controllers\API\V2\AttendanceController;
use App\Http\Controllers\API\V2\EnrollmentController;
use App\Http\Controllers\API\V2\VectorController;
use App\Http\Controllers\API\V2\AttendanceReportController;
use App\Http\Controllers\API\V2\DashboardController;
use App\Http\Controllers\API\V2\AppAuthController;
use App\Http\Controllers\API\V2\AppVectorController;
use App\Http\Controllers\API\V2\TemplateController;
use App\Http\Controllers\API\V2\EntityController;

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
// Refresh accepts an expired JWT — must be outside the auth middleware
Route::post('auth/refresh', [AuthController::class, 'refresh']);

// ─── Protected Routes ─────────────────────────────────────────────────────────
Route::middleware('check.api.auth')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Entities
    Route::get('entities', [EntityController::class, 'index']);
    Route::post('entities', [EntityController::class, 'store']);
    Route::post('entities/import', [EntityController::class, 'import']);
    Route::get('entities/{guid}', [EntityController::class, 'show']);
    Route::put('entities/{guid}', [EntityController::class, 'update']);
    Route::delete('entities/{guid}', [EntityController::class, 'destroy']);

    // Staff
    Route::get('staff', [StaffController::class, 'index']);
    Route::post('staff', [StaffController::class, 'store']);
    Route::get('staff/all', [StaffController::class, 'listAll']);  // lightweight list for dropdowns
    Route::get('staff/enrolled', [StaffController::class, 'enrolled']);
    Route::get('staff/unenrolled', [StaffController::class, 'unenrolled']);
    Route::get('staff/{guid}', [StaffController::class, 'show']);
    Route::post('staff/assign-role', [StaffController::class, 'assignRole']);

    // Projects
    Route::get('projects', [ProjectController::class, 'index']);
    Route::post('projects', [ProjectController::class, 'store']);
    Route::get('projects/nearby', [ProjectController::class, 'nearby']);
    Route::get('projects/timekeeper-template', [ProjectController::class, 'timekeeperTemplate']);
    Route::post('projects/bulk-assign-timekeeper', [ProjectController::class, 'bulkAssignTimekeeper']);
    Route::get('projects/{guid}', [ProjectController::class, 'show']);
    Route::put('projects/{guid}', [ProjectController::class, 'update']);
    Route::delete('projects/{guid}', [ProjectController::class, 'destroy']);
    Route::post('projects/assign', [ProjectController::class, 'assignStaff']);
    Route::delete('projects/assign/{guid}', [ProjectController::class, 'removeStaff']);

    // Attendance (check-in + check-out share one controller)
    Route::post('attendance/checkin', [AttendanceController::class, 'checkIn']);
    Route::post('attendance/checkout', [AttendanceController::class, 'checkOut']);
    Route::get('attendance/checked-in', [AttendanceController::class, 'checkedIn']);
    Route::get('attendance/checked-out', [AttendanceController::class, 'checkedOut']);

    // Face Enrollment
    Route::post('enrollment', [EnrollmentController::class, 'store']);
    Route::post('enrollment/bulk', [EnrollmentController::class, 'bulkStore']);
    Route::delete('enrollment/{guid}', [EnrollmentController::class, 'destroy']);

    // Vectors (Python backend)
    Route::get('vectors', [VectorController::class, 'index']);
    Route::get('vectors/{staffId}', [VectorController::class, 'show']);
    Route::post('vectors/invalidate', [VectorController::class, 'invalidateCache']);

    // Import Templates
    Route::get('templates/employees', [TemplateController::class, 'employees']);
    Route::get('templates/projects', [TemplateController::class, 'projects']);
    Route::get('templates/attendance', [TemplateController::class, 'attendance']);
    Route::get('templates/entities', [TemplateController::class, 'entities']);

    // Attendance Reports
    Route::get('reports', [AttendanceReportController::class, 'index']);
    Route::get('reports/history', [AttendanceReportController::class, 'history']);
    Route::get('reports/day-details', [AttendanceReportController::class, 'dayDetails']);
    Route::get('reports/summary', [AttendanceReportController::class, 'summary']);
    Route::get('reports/facial-recognition', [AttendanceReportController::class, 'facialRecognition']);

    // ── App Client Management (admin only, main JWT) ──────────────────────────
    Route::get('app/clients', [AppAuthController::class, 'listClients']);
    Route::post('app/clients', [AppAuthController::class, 'createClient']);
    Route::put('app/clients/{uuid}', [AppAuthController::class, 'updateClient']);
    Route::post('app/clients/{uuid}/rotate-secret', [AppAuthController::class, 'rotateSecret']);
    Route::delete('app/clients/{uuid}', [AppAuthController::class, 'deleteClient']);

    // ── App Access Logs (admin only, main JWT) ────────────────────────────────
    Route::get('app/logs', [AppAuthController::class, 'listLogs']);
});

// ─── External App Routes (App Token auth) ────────────────────────────────────
Route::post('app/auth/token', [AppAuthController::class, 'token']);   // public — exchange credentials

Route::middleware('check.app.token')->group(function () {
    Route::get('app/vectors', [AppVectorController::class, 'index']);
    Route::get('app/vectors/{staffId}', [AppVectorController::class, 'show']);
});
