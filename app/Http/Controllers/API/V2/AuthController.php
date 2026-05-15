<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Carbon\Carbon;
use JWTAuth;
use App\Models\User;
use App\Models\TplUserModel;
use App\Models\RoleModel;
use App\Models\ResetPassword;

class AuthController extends BaseController
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $credentials = filter_var($request->email, FILTER_VALIDATE_EMAIL)
            ? ['email' => $request->email, 'password' => $request->password]
            : ['emp_id' => $request->email, 'password' => $request->password];

        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->error('Invalid credentials.', 401);
        }

        $loginUser = auth('api')->user();

        // Super admin has no employee profile (user_id = 0).
        if ($loginUser->user_id == 0) {
            $adminRole = RoleModel::where('rolecode', 'SUP')->first();

            return $this->success([
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => auth()->factory()->getTTL() * 60,
                'user'         => [
                    'id'       => null,
                    'name'     => 'Super Admin',
                    'email'    => $loginUser->email,
                    'emp_id'   => $loginUser->emp_id,
                    'is_admin' => true,
                    'roles'    => $adminRole ? [$adminRole] : [],
                ],
            ], 'Logged in successfully.', 200, $request, 'auth/login');
        }

        $profile = TplUserModel::with([
            'User', 'Roles', 'Roles.AttendanceLogic',
            'Entities', 'Classifications', 'Categories', 'ProjectLatLngs',
            'faceEnrolled',
        ])->find($loginUser->user_id);

        if (!$profile) {
            return $this->error('Employee profile not found.', 404);
        }

        $profile->image = $this->resolveImage($profile);

        return $this->success([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60,
            'user'         => $profile,
        ], 'Logged in successfully.', 200, $request, 'auth/login');
    }

    public function logout()
    {
        auth()->logout();
        return $this->success([], 'Logged out successfully.');
    }

    public function refresh()
    {
        try {
            $token = auth()->refresh();
        } catch (\Exception $e) {
            return $this->error('Token refresh failed. Please login again.', 401);
        }

        return $this->success([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60,
        ], 'Token refreshed.');
    }

    public function me(Request $request)
    {
        $loginUser = auth('api')->user();

        if ($loginUser->user_id == 0) {
            $adminRole = RoleModel::where('rolecode', 'SUP')->first();

            return $this->error('This ID is only for web end.', 403);
        }

        $profile = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'faceEnrolled'])->find($loginUser->user_id);

        if (!$profile) {
            return $this->error('Employee profile not found.', 404);
        }

        $profile->image = $this->resolveImage($profile);

        return $this->success($profile, 'Profile fetched.', 200, $request, 'auth/me');
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->notFound('Email not found.');
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['email' => $user->email, 'token' => bcrypt($token), 'created_at' => Carbon::now()]
        );

        try {
            set_smtp();
            $smtpUsername = Config::get('mail.mailers.smtp.username');
            $data         = ['token' => $token];

            Mail::send('forgot_password', $data, function ($mail) use ($user, $smtpUsername) {
                $mail->from($smtpUsername)->to($user->email)->subject('Password Reset Request');
            });
        } catch (\Exception $e) {
            // Token still valid — email failure should not block response
        }

        return $this->success(
            ['email' => $user->email, 'token' => $token],
            'Reset token sent to email.',
            200,
            $request,
            'auth/forgot-password'
        );
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'                 => 'required|email',
            'token'                 => 'required',
            'password'              => 'required|confirmed|min:6',
            'password_confirmation' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $record = ResetPassword::where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return $this->error('Invalid or expired token.', 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->notFound('User not found.');
        }

        $user->password = bcrypt($request->password);
        $user->save();

        ResetPassword::where('email', $request->email)->delete();

        return $this->success([], 'Password reset successfully.', 200, $request, 'auth/reset-password');
    }
}
