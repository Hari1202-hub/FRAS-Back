<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ResetPassword;
use App\Models\TplUserModel;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;

use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        
        if (!filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
            $credentials['emp_id'] = $request->email;
            $credentials['password'] = $request->password;
          
        }else{
            $credentials = $request->only('email', 'password');
        }
        if (! $token = JWTAuth::attempt($credentials)) {
            return $this->sendjwtError('Unauthorized','', 401);
        }
        $user_id =  auth('api')->user()->user_id;
        $all_user = TplUserModel::with(['User','Roles','Roles.AttendanceLogic','Entities','Classifications','Categories','ProjectLatLngs'])->find($user_id);
        //JWTAuth::setToken($token);
        //$refreshToken = JWTAuth::refresh();
        $result = ['access_token' => $token,
                    //'refresh_token' => $refreshToken,
                    'token_type' => 'bearer',
                    'data'=>$all_user,
                    'expires_in' => auth()->factory()->getTTL() * 1440
                  ];
        return $this->sendResponse($result,'Logged In Successfully.',200,$request,'login');
    }
    

    public function get_token(Request $request){
         $validator = Validator::make($request->all(), [
            'api_key' => ['required'],
            'api_value' => ['required'],
        ]);

        if($validator->fails()){
            $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,422);
        }
         $credentials['email']      = base64_decode($request->api_key);
         $credentials['password']   = base64_decode($request->api_value);
         if (! $token = JWTAuth::attempt($credentials)) {
            $validation_error[] = 'Invalid Api Key or Value';
            return $this->sendapiError($validation_error,401);
        }
         $result = ['access_token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL() * 60
                  ];
        return $this->sendResponse($result,'Token generated Successfully.',200,$request,'get token');
    }

    public function me(Request $request)
    {
        $auth = $this->check_auth();
        if (!empty($auth)) {
            abort($auth); // still returns HTTP error in a web context
        }
        $user_id =  auth('api')->user()->user_id;
        $all_user = TplUserModel::with(['User','Roles','Entities','Classifications','Categories'])->find($user_id);
        return $this->sendResponse($all_user,'',200,$request,'profile');
    }
    //logout
    public function logout()
    {
        auth()->logout();

        return response()->json([ 'status'=>1,'message' => 'Logged out Successfully']);
    }

    // Refresh Session
    public function refresh()
    {
        $result = ['access_token' => auth()->refresh(),
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL() * 60
                  ];
        return $this->sendResponse($result,'',200,$request,'refresh token');
    }
    public function web_forgot_password(Request $request)
    {
         $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found'], 404);
        }
        
        

        // Generate token
        $token = Str::random(64);

        // Store token in password_resets table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Prepare reset link (frontend URL)
        $resetLink = url("/resetpassword?token=$token&email=" . urlencode($user->email));

        $data = [
            'name' => $user->name,
            'email' => $user->email,
            'link' => $resetLink,
        ];

        set_smtp();
        $smtpUsername = Config::get('mail.mailers.smtp.username');
        $email = $user->email;

        try {
            Mail::send('web_forgot_password', $data, function ($mailMessage) use ($email, $smtpUsername) {
                $mailMessage->from($smtpUsername)->to($email)
                            ->subject('Reset Your Password');
            });
            return $this->sendResponse($data,'Password reset link sent!');

        } catch (\Exception $e) {
            echo $e->getMessage();
            return response()->json(['message' => 'Failed to send email'], 500);
        }
    }
    public function forgot_password(Request $request)
    {
         $validator = Validator::make($request->all(), [
            'email' => ['required','email'],
        ]);
        if($validator->fails()){
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }

        // Generate token
        $token = Str::random(64);

        // Store in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email' => $user->email,
                'token' => bcrypt($token),
                'created_at' => Carbon::now()
            ]
        );

         $data['token'] = $token;
        set_smtp();
        $smtpUsername = Config::get('mail.mailers.smtp.username');
        $email = $user->email;
        try {
            Mail::send('forgot_password', $data, function ($mailMessage) use($email,$smtpUsername) {
                $mailMessage->from($smtpUsername)->to($email)
                        ->subject('Forgot Password');
            });
        } catch (Exception $e) {
            Log::error('Failed to send forgot password email: ' . $e->getMessage());
        }

        $result =[
            'email' => $user->email,
            'token' => $token  // This is raw token (not the hashed one)
                ];
         return $this->sendResponse($result,'Please check your mail get token and reset your password.',200,$request,'forgot password');
    }
    public function resetPassword(Request $request)
    {
         $validator = Validator::make($request->all(), [
            'email' => ['required','email'],
            'token' => ['required'],
            'password' => ['required','confirmed','min:6'],
        ]);
        if($validator->fails()){
           $validation_error = validation_api_errors_message($validator->errors()->messages());
            return $this->sendapiError($validation_error,400);
            exit;
        }

        $record = ResetPassword::where('email', $request->email)->first();

        if (!$record || !\Hash::check($request->token, $record->token)) {
            $error = 'Invalid Email or expired token';
            return $this->sendapiError($error,404);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            $error = 'No Data Found.';
            return $this->sendapiError($error,404);
        }

        $user->password = bcrypt($request->password);
        $user->save();

        // Delete the token after success
       ResetPassword::where('email', $request->email)->delete();

        return $this->sendResponse([],'Password has been reset successfully',200,$request,'reset password');
    }
}
