<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Models\PayloadLogModel;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Send a general success response.
     *
     * @param mixed $result
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendResponse($result, $message, $code = 200, Request $request,$api='')
    {
        $result_data = array('status' => $code,'data' => $result,'message' => $message);
        
        if(set_log()){
            $paylod_log             =   new PayloadLogModel();
            $paylod_log->request    =   (!empty($request->all()))?json_encode($request->all()):'';
            $paylod_log->response   =   (!empty($result_data))?json_encode($result_data):'';
            $paylod_log->api        =   $api;
            $paylod_log->save();
        }
        return response()->json([
            'status' => $code,
            'data' => $result,
            'message' => $message,
        ], $code);
    }

    /**
     * Send a general error response.
     *
     * @param string $error
     * @param array $errorMessages
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'status' => $code,
            'message' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['data'] = $errorMessages;
        }

        return response()->json($response, $code);
    }

    /**
     * Send a JWT-style success response.
     *
     * @param mixed $result
     * @param string $msg
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendjwtResponse($result, $msg)
    {
        return response()->json([
            'data' => $result,
            'msg' => $msg,
        ], 200);
    }

    /**
     * Send a JWT-style error response.
     *
     * @param string $error
     * @param array $errorMessages
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendjwtError($error, $errorMessages = [], $code = 400)
    {
        $response = [
            'msg' => $error,
        ];

        if (!empty($errorMessages)) {
            $response['data'] = $errorMessages;
        }

        return response()->json($response, $code);
    }

    /**
     * Send an API-style success response.
     *
     * @param string $message
     * @param string $log
     * @param string $transfereename
     * @param string $calibergauge
     * @param string $quantity
     * @param string $apptype
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendapiResponse($message, $log = '', $transfereename = '', $calibergauge = '', $quantity = '', $apptype = '')
    {
        return response()->json([
            'status' => 1,
            'message' => $message,
        ], 200);
    }

    /**
     * Send an API-style error response.
     *
     * @param string $errorMessages
     * @param int $code
     * @param string $log
     * @param string $transfereename
     * @param string $calibergauge
     * @param string $quantity
     * @param string $apptype
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendapiError($errorMessages, $code = 400, $log = '', $transfereename = '', $calibergauge = '', $quantity = '', $apptype = '')
    {
        return json_encode([
            'status' => 400,
            'message' => $errorMessages,
        ], $code);
    }
    protected function check_auth(){
        $auth = checkauth();
        if(empty($auth) || $auth==0){
            return $this->sendError('Unauthorized', [], 401);
        }
        return 0;
    }
}
