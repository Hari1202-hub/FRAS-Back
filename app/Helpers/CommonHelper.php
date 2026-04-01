<?php
use Illuminate\Support\Facades\Auth;
use App\Models\SettingModel;
function checkauth(){
  $user = auth('api')->user();
  if (empty($user)) {
      return 0;
  }
  return 1;
}
function validation_api_errors_message($error_messages){
  $error_msg = '';
  $req_error = [];
  if(!empty($error_messages)){
      $i =0;
      foreach($error_messages as $key=>$messages){
          if (empty($req_error) || $req_error != $messages[0]){
              $error_msg .= $messages[0].',';
              $req_error[$i] = $messages;
              $i++;
          }
      }
  }
 return $validation_error = array('error_msg'=>$error_msg);
}
function set_smtp(){
  Config::set('mail.mailers.smtp.host', 'smtp.gmail.com');
  Config::set('mail.mailers.smtp.port','587');
  Config::set('mail.mailers.smtp.encryption', 'tls');
  Config::set('mail.mailers.smtp.username', 'kumarphp29@gmail.com');
  Config::set('mail.mailers.smtp.password', 'cqjj gsaa giju dopi');
}
function set_log(){
 return true;
}