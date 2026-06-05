<?php

namespace App\Http\Controllers\API\V2;

use App\Http\Controllers\Controller;
use App\Models\PayloadLogModel;
use App\Models\TplUserModel;
use Illuminate\Http\Request;

abstract class BaseController extends Controller
{
    protected function success($data, string $message = 'Success', int $status = 200, ?Request $request = null, string $api = ''): \Illuminate\Http\JsonResponse
    {
        $response = [
            'success' => true,
            'status'  => $status,
            'message' => $message,
            'data'    => $data,
        ];

        if ($request && set_log()) {
            $log           = new PayloadLogModel();
            $log->request  = json_encode($request->all());
            $log->response = json_encode($response);
            $log->api      = 'v2/' . $api;
            $log->save();
        }

        return response()->json($response, $status);
    }

    protected function paginated($paginator, string $message = 'Success', int $status = 200): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => true,
            'status'  => $status,
            'message' => $message,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'next_page'    => $paginator->nextPageUrl(),
                'prev_page'    => $paginator->previousPageUrl(),
            ],
        ], $status);
    }

    protected function error(string $message, int $status = 400, array $errors = []): \Illuminate\Http\JsonResponse
    {
        $response = [
            'success' => false,
            'status'  => $status,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    protected function validationError(array $errors): \Illuminate\Http\JsonResponse
    {
        return $this->error('Validation failed.', 422, $errors);
    }

    protected function notFound(string $message = 'Resource not found.'): \Illuminate\Http\JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * Returns auth context for the current request.
     * is_super_admin = true  → no entity restriction
     * entity_id              → scope all queries to this entity (BIGINT)
     * emp_guid               → tbl_user.guid of the logged-in employee
     */
    protected function authContext(): array
    {
        $login = auth('api')->user();

        if (!$login || $login->user_id == 0) {
            return ['is_super_admin' => true, 'entity_id' => null, 'emp_guid' => null];
        }

        $profile = TplUserModel::find($login->user_id);

        return [
            'is_super_admin' => false,
            'entity_id'      => $profile?->entity_id,
            'emp_guid'       => $profile?->guid,
        ];
    }

    protected function resolveImage(TplUserModel $staff): ?string
    {
        $path = $staff->image ?? optional($staff->faceEnrolled)->image ?? null;

        if (!$path) return null;

        // Python FRAS saves under uploads/ — prefix with images/ so the
        // webapi serves it from public/images/uploads/
        if (str_starts_with($path, 'uploads/')) {
            $path = "images/$path";
        }

        return asset($path);
    }
}
