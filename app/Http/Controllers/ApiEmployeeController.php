<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\AuditLogModel;
use App\Models\CheckinModel;
use App\Models\EntityModel;
use App\Models\EntrolledImageModel;
use App\Models\EntrolledLog;
use App\Models\MasterValueModel;
use App\Models\PayloadLogModel;
use App\Models\ProjectModel;
use App\Models\RoleModel;
use App\Models\TplUserModel;
use App\Models\User;
use App\Models\UserRoleModel;
use App\Models\EnrolledPayloadModel;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EnrolledImagesExport;
use App\Exports\NotEnrolledImagesExport;
use Illuminate\Support\Facades\DB;

class ApiEmployeeController extends Controller
{
    public function index(Request $request)
    {

        $user = Auth::guard('api')->user();
        $all_user = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories'])->where('id', '<>', 1);

        if (!empty($request->name)) {
            $all_user = $all_user->where('name', 'like', '%' . $request->name . '%');
        }
        if (!empty($request->emp_id)) {
            $all_user = $all_user->whereHas('User', function ($query) use ($request) {
                $query->where('emp_id', $request->emp_id);
            })->orWhere('name', 'like', '%' . $request->emp_id . '%');
        }
        if (!empty($request->role)) {
            $all_user = $all_user->whereHas('Roles', function ($query) use ($request) {
                $query->where('guid', $request->role);
            });
        }
        if (isset($request->assigned_role)) {
            if ($request->assigned_role == 1) {
                $all_user = $all_user->whereHas('Roles', function ($query) use ($request) {
                    $query->whereNotNull('guid');
                });
            } else {

                $all_user = $all_user->whereDoesntHave('Roles');
            }
        }
        if (isset($request->status)) {
            if ($request->status == 1) {
                // $all_user = $all_user->where('isactive',true);
            } else {
                //$all_user = $all_user->where('isactive',false);
            }
        }
        if (isset($request->entrolled)) {
            if ($request->entrolled == 1) {
                $all_user = $all_user->where('isentrolled', true);
            } else {
                $all_user = $all_user->where('isentrolled', false);
            }
        }
        if (!empty($request->entity)) {
            $all_user = $all_user->whereHas('Entities', function ($query) use ($request) {
                $query->where('guid', 'like', '%' . $request->entity . '%');
            });
        }
        if (!empty($request->classification)) {
            $all_user = $all_user->whereHas('Classifications', function ($query) use ($request) {
                $query->where('code', $request->classification);
            });
        }
        if (!empty($request->category)) {
            $all_user = $all_user->whereHas('Categories', function ($query) use ($request) {
                $query->where('code', $request->category);
            });
        }
        $length = $request->length ?? 25; // Default to 25 if length is not provided

        $all_user = $all_user->orderBy('id', 'asc')->paginate($length)->map(function ($item) {
            if (!empty($item->image)) {
                $item->image = asset($item->image);
            }
            return $item;
        });
        return $this->sendResponse($all_user, 'Employees List', 200, $request, 'employee list');
    }
    public function web_employees(Request $request)
    {

        $user = Auth::guard('api')->user();
        $all_user = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'Project', 'faceEnrolled'])->where('isactive', true)->where('id', '<>', 1);

        if (!empty($request->name)) {
            $all_user = $all_user->where('name', 'ilike', '%' . $request->name . '%');
        }
        if (!empty($request->search)) {
            $all_user = $all_user->whereHas('User', function ($query) use ($request) {
                $query->where('emp_id', 'like', '%' . $request->search . '%');
            })->orWhere('name', 'ilike', '%' . $request->search . '%');
        }
        if (!empty($request->role)) {
            $all_user = $all_user->whereHas('Roles', function ($query) use ($request) {
                $query->where('guid', $request->role);
            });
        }
        if (isset($request->assigned_role)) {
            if ($request->assigned_role == 1) {
                $all_user = $all_user->whereHas('Roles', function ($query) use ($request) {
                    $query->whereNotNull('guid');
                });
            } else {

                $all_user = $all_user->whereDoesntHave('Roles');
            }
        }
        if (isset($request->status)) {
            if ($request->status == 1) {
                $all_user = $all_user->where('isactive', true);
            } else {
                $all_user = $all_user->where('isactive', false);
            }
        }
        if (!empty($request->entrolled)) {
            if ($request->entrolled == 1) {
                //$all_user = $all_user->where('isentrolled',true);
                $all_user   = $all_user->whereIn('guid', function ($query) {
                    $query->select('empguid')->from('tbl_entrolled_image');
                });
            } else {
                $all_user   = $all_user->whereNotIn('guid', function ($query) {
                    $query->select('empguid')->from('tbl_entrolled_image');
                });
            }
        }
        if (!empty($request->entity)) {
            $all_user = $all_user->where('entity_id', $request->entity);
        }
        if (!empty($request->classification)) {
            $all_user = $all_user->whereHas('Classifications', function ($query) use ($request) {
                $query->where('code', $request->classification);
            });
        }
        if (!empty($request->category)) {
            $all_user = $all_user->whereHas('Categories', function ($query) use ($request) {
                $query->where('code', $request->category);
            });
        }
        $length = $request->length ?? 25; // Default to 25 if length is not provided
        $page = $request->page ?? 1; // Default to page 1 if page is not provided

        // Calculate the skip and take values for pagination
        $skip = ($page - 1) * $length;
        $total_count = $all_user->count();

        $all_user = $all_user->orderBy('id', 'asc')->paginate($length);
        $last_page = $all_user->lastPage();
        $all_user = $all_user->map(function ($item) {
            if (!empty($item->image)) {
                $item->image = asset($item->image);
            }
            return $item;
        });
        $total_count = $total_count;
        return $this->sendResponse([
            'employees' => $all_user,
            'last_page' => $last_page,
            'total_count' => $total_count
        ], 'Employees List', 200, $request, 'website employee list');
    }
    public function employee_details(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => ['required'],
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        } else {
            $user = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories'])->where('guid', $request->employee_id)->first();
            if (!empty($user->image)) {
                $user->image = asset($user->image);
            }
            if (!empty($user->id)) {
                return $this->sendResponse($user, 'Employee Details', 200, $request, 'employee details');
            } else {
                return $this->sendError([], 'No Employee Found', 404);
            }
        }
    }

    public function create_employee(Request $request)
    {
        $employees     = $request->employee;
        $responseData = [
            'inserted' => [],
            'errors' => [],
        ];
        try {
            if (!empty($employees)) {
                foreach ($employees as $index => $employeeData) {
                    $validator = Validator::make((array)$employeeData, [
                        'id'         => 'required|string|max:10',
                        'name'           => 'required|string|max:40',
                        'entity'         => 'required',
                        'classification' => 'required',
                        'category'       => 'required',
                        'email'          => 'nullable|email',
                        'mobile'         => 'nullable|numeric',
                        'status'         => 'required',
                        'reference_id'   => 'required',
                    ]);

                    if ($validator->fails()) {
                        $responseData['errors'][] = [
                            'row' => $index + 1,
                            'errors' => $validator->errors(),
                        ];
                        continue;
                    } else {
                        $entity              =   EntityModel::where('entityname', $employeeData['entity'])->first();
                        $category            =   MasterValueModel::where('master_key', 'CATEGORY')->where('description', $employeeData['category'])->first();
                        $classification      =   MasterValueModel::where('master_key', 'CLASSIFICATION')->where('description', $employeeData['classification'])->first();

                        $check_employee      =   TplUserModel::where('unique_id', $employeeData['reference_id'])->first();
                        if (empty($entity)) {
                            $entity                 =   new EntityModel();
                            $entity->guid           =   Str::uuid(10);
                            $entity->entityname     =   $employeeData['entity'];
                            $entity->isactive       =   true;
                            $entity->save();
                        }
                        if (empty($category)) {
                            $category               =   new MasterValueModel();
                            $category->guid         =   Str::uuid(10);
                            $category->master_key   =   'CATEGORY';
                            $category->code         =   strtoupper(substr(trim($employeeData['category']), 0, 3));;
                            $category->description  =   $employeeData['category'];
                            $category->isactive     =   true;
                            $category->save();
                        }
                        if (empty($classification)) {
                            $classification               =   new MasterValueModel();
                            $classification->guid         =   Str::uuid(10);
                            $classification->master_key   =   'CLASSIFICATION';
                            $classification->code         =   strtoupper(substr(trim($employeeData['classification']), 0, 3));;
                            $classification->description  =   $employeeData['classification'];
                            $classification->isactive     =   true;
                            $classification->save();
                        }

                        if (empty($check_employee)) {
                            $check_email = TplUserModel::where('email', $employeeData['email'])->first();
                            $check_mobile = TplUserModel::where('mobile', $employeeData['mobile'])->first();

                            $check_user  = User::where('emp_id', $employeeData['id'])->first();

                            if ((!empty($check_email)) || !empty($check_user)) {
                                continue;
                            }
                            $user                       =   new TplUserModel();
                            $user->name                 =   $employeeData['name'];
                            $user->guid                 =   Str::uuid(10);
                            $user->unique_id            =   $employeeData['reference_id'];
                            if ((!empty($employeeData['email']) && !empty($check_email))) {
                                $user->email            =   $employeeData['email'];
                            }
                            if ((!empty($employeeData['mobile']) && !empty($check_mobile))) {
                                $user->mobile           =   $employeeData['mobile'];
                            }
                            $user->category_code        =   $category->code;
                            $user->classification_code  =   $classification->code;
                            $user->entity_id            =   $entity->id;
                            $user->loginmethod_code     =   'Employee Id';
                            $user->isactive             =   (strtolower($employeeData['status']) == 'active') ? true : false;
                            $user->save();

                            $user_login                 =   new User();
                            $user_login->guid           =   $user->guid;
                            if ((!empty($employeeData['email']) && !empty($check_email))) {
                                $user_login->email      =   $employeeData['email'];
                            } else {
                                $user_login->email      =   $employeeData['id'];
                            }
                            $user_login->user_id        =   $user->id;
                            $user_login->emp_id         =   $employeeData['id'];
                            $user_login->password       =   '123456';
                            $user_login->passcode       =   'TEST';
                            $user_login->defaultpassword =   1;
                            $user_login->isactive       =   (strtolower($employeeData['status']) == 'active') ? true : false;
                            $user_login->save();
                        } else {
                            $check_email = TplUserModel::where('email', $employeeData['email'])->where('id', '!=', $check_employee->id)->first();
                            $check_mobile = TplUserModel::where('mobile', $employeeData['mobile'])->where('id', '!=', $check_employee->id)->first();

                            $check_user  = User::where('emp_id', $employeeData['id'])->where('user_id', '!=', $check_employee->id)->first();

                            if ((!empty($check_email)) || !empty($check_user)) {
                                continue;
                            }

                            $user                       =   TplUserModel::find($check_employee->id);
                            $user->name                 =   $employeeData['name'];
                            if ((!empty($employeeData['email']) && !empty($check_email))) {
                                $user->email            =   $employeeData['email'];
                            }
                            if ((!empty($employeeData['mobile']) && !empty($check_mobile))) {
                                $user->mobile           =   $employeeData['mobile'];
                            }
                            $user->category_code        =   $category->code;
                            $user->classification_code  =   $classification->code;
                            $user->entity_id            =   $entity->id;
                            $user->isactive             =   (strtolower($employeeData['status']) == 'active') ? true : false;
                            $user->save();

                            $user_login                 =   User::where('user_id', $check_employee->id)->first();
                            if ((!empty($employeeData['email']) && !empty($check_email))) {
                                $user_login->email      =   $employeeData['email'];
                            } else {
                                $user_login->email      =   $employeeData['id'];
                            }
                            $user_login->user_id        =   $user->id;
                            $user_login->emp_id         =   $employeeData['id'];
                            $user_login->isactive       =   (strtolower($employeeData['status']) == 'active') ? true : false;
                            $user_login->save();
                        }
                    }
                }
            } else {
                $user                       =   Auth::guard('api')->user();
                $audit_log                  =   new AuditLogModel();
                $audit_log->guid            =   Str::uuid(10);
                $audit_log->eventtype       =   'POST';
                $audit_log->eventmodule     =   'Create Employee';
                $audit_log->auditlog_desc   =   'Invalid or Incorrect Json';
                $audit_log->from_userid     =   $user->id;
                $audit_log->to_userid       =   '';
                $audit_log->isauto          =   true;
                $audit_log->date            =   date('Y-m-d');
                $audit_log->reference       =   'Josn Error';
                $audit_log->save();
            }
        } catch (Exception $e) {
            $user                       =   Auth::guard('api')->user();
            $audit_log                  =   new AuditLogModel();
            $audit_log->guid            =   Str::uuid(10);
            $audit_log->eventtype       =   'POST';
            $audit_log->eventmodule     =   'Create Employee';
            $audit_log->auditlog_desc   =   $e->getMessage();
            $audit_log->from_userid     =   $user->id;
            $audit_log->to_userid       =   '';
            $audit_log->isauto          =   true;
            $audit_log->date            =   date('Y-m-d');
            $audit_log->reference       =   $e->getMessage();
            $audit_log->save();
        }
        return $this->sendResponse([], 'Employee created successfully.', 200, $request, 'create employee');
    }

    public function saveentrolledimage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empguid' => ['required'],
            'vector' => ['required'],
            'blob' => ['required'],
            'vectors' => ['nullable'],
            'createdby' => ['required']
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        }
        $user = TplUserModel::where('guid', $request->empguid)->first();
        if (!$user) {
            $error = 'No Employee Found.';
            return $this->sendapiError($error, 404);
        }
        $createduser = TplUserModel::where('guid', $request->createdby)->first();
        if (!$createduser) {
            $error = 'Created By Employee Not Found.';
            return $this->sendapiError($error, 404);
        }
        $createdby_id = $createduser->id;
        $blob = $request->input('blob');
        try {
            if (preg_match('/^data:image\/(\w+);base64,/', $blob, $type)) {
                $extension = strtolower($type[1]); // jpg, jpeg, png, gif, etc.
                $imageData = base64_decode(substr($blob, strpos($blob, ',') + 1));

                if ($imageData === false) {
                    return $this->sendapiError('Base64 decode failed.', 400);
                }

                if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                    return $this->sendapiError('Unsupported image type.', 422);
                }


                // Reject animated GIFs (optional)
                if ($extension === 'gif') {
                    $frames = substr_count($imageData, 'NETSCAPE2.0');
                    if ($frames > 0) return $this->sendapiError('Animated GIFs are not supported.', 422);
                }
                // Create image resource
                $image = imagecreatefromstring($imageData);
                if (!$image) {
                    return $this->sendapiError('Invalid image data.', 422);
                }

                // Handle EXIF rotation for JPEG
                if (in_array($extension, ['jpg', 'jpeg']) && function_exists('exif_read_data')) {
                    $tmpFile = tempnam(sys_get_temp_dir(), 'exif');
                    file_put_contents($tmpFile, $imageData);
                    $exif = @exif_read_data($tmpFile);
                    unlink($tmpFile);

                    if (!empty($exif['Orientation'])) {
                        switch ($exif['Orientation']) {
                            case 3:
                                $image = imagerotate($image, 180, 0);
                                break;
                            case 6:
                                $image = imagerotate($image, -90, 0);
                                break;
                            case 8:
                                $image = imagerotate($image, 90, 0);
                                break;
                        }
                    }
                }

                // Set file path
                $filename = Str::random(10) . '.' . $extension;
                $relativePath = 'images/' . $filename;
                $publicPath = public_path($relativePath);
                // Output buffer & compress based on format
                $success = false;
                $quality = 100;

                while ($quality >= 10) {
                    ob_start();
                    if (in_array($extension, ['jpg', 'jpeg'])) {
                        imagejpeg($image, null, $quality);
                    } elseif ($extension === 'png') {
                        $pngQuality = (int)((100 - $quality) / 10);
                        imagepng($image, null, $pngQuality);
                    } elseif ($extension === 'gif') {
                        imagegif($image);
                    }
                    $compressedImage = ob_get_clean();
                    file_put_contents($publicPath, $compressedImage);
                    if (strlen($compressedImage) <= 60 * 1024 || $extension === 'gif') {
                        $success = true;
                        break;
                    }

                    $quality -= 10;
                }

                imagedestroy($image);
            }

            $check_entrolled = EntrolledImageModel::where('empguid', $request->empguid)->first();
            if (!$check_entrolled) {
                $entrolled = new EntrolledImageModel();
            } else {
                $entrolled = EntrolledImageModel::find($check_entrolled->id);
                $entrolled_log = new EntrolledLog();
                $entrolled_log->empguid = $entrolled->empguid;
                $entrolled_log->vector = $entrolled->vector;
                $entrolled_log->image = $entrolled->image;
                $entrolled_log->created_by = $entrolled->created_by;
                $entrolled_log->api = 'Save Entrolled';
                $entrolled_log->save();
                $filePath = public_path($entrolled->image);
                if (!empty($entrolled->image) && file_exists($filePath)) {
                    //unlink($filePath);
                }
            }
            $entrolled->empguid     =   $request->empguid;
            $entrolled->vector      =   $request->vector;
            $entrolled->vectors = $request->vectors;
            $entrolled->image       =   $relativePath;
            $entrolled->created_by  =   $createdby_id;
            $entrolled->save();

            $user = TplUserModel::where('guid', $request->empguid)->first();
            $user->image = $entrolled->image;
            $user->save();
            $entrolled->created_by  =   $request->createdby;
            $entrolled->image       =   asset($entrolled->image);
            return $this->sendResponse($entrolled, 'Entrolled Image saved successfully.', 200, $request, 'save entrolled image');
        } catch (Exception $e) {
            $error = 'Some thing went wrong';
            return $this->sendapiError($error, 422);
        }
    }
    public function multipleSaveentrolledimage(Request $request)
    {
        foreach ($request->all() as $index => $item) {
            $validator = Validator::make($item, [
                'empguid' => ['required'],
                'vector' => ['required'],
                'blob' => ['required'],
                'createdby' => ['required']
            ]);
            if ($validator->fails()) {
                $validation_error['errors'] = $validator->errors()->messages();
                return response()->json([
                    'error' => "Validation failed at index {$index}",
                    'messages' => $validator->errors()
                ], 400);
            }
            $user = TplUserModel::where('guid', $item['empguid'])->first();
            $j = $index + 1;
            if (!$user) {
                $error = 'No Employee Found at index ' . $j . '.';
                return $this->sendapiError($error, 404);
            }
            $createduser = TplUserModel::where('guid', $item['createdby'])->first();
            if (!$createduser) {
                $error = 'Created By Employee Not Found at index ' . $j . '.';
                return $this->sendapiError($error, 404);
            }
            $createdby_id = $createduser->id;
            $blob = $item['blob'];
            try {
                if (preg_match('/^data:image\/(\w+);base64,/', $blob, $type)) {
                    $extension = strtolower($type[1]); // jpg, jpeg, png, gif, etc.
                    $imageData = base64_decode(substr($blob, strpos($blob, ',') + 1));

                    if ($imageData === false) {
                        return $this->sendapiError('Base64 decode failed.', 400);
                    }

                    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                        return $this->sendapiError('Unsupported image type.', 422);
                    }

                    // Reject animated GIFs (optional)
                    if ($extension === 'gif') {
                        $frames = substr_count($imageData, 'NETSCAPE2.0');
                        if ($frames > 0) return $this->sendapiError('Animated GIFs are not supported.', 422);
                    }

                    // Create image resource
                    $image = imagecreatefromstring($imageData);
                    if (!$image) return $this->sendapiError('Invalid image data.', 422);

                    // Handle EXIF rotation for JPEG
                    if (in_array($extension, ['jpg', 'jpeg']) && function_exists('exif_read_data')) {
                        $tmpFile = tempnam(sys_get_temp_dir(), 'exif');
                        file_put_contents($tmpFile, $imageData);
                        $exif = @exif_read_data($tmpFile);
                        unlink($tmpFile);

                        if (!empty($exif['Orientation'])) {
                            switch ($exif['Orientation']) {
                                case 3:
                                    $image = imagerotate($image, 180, 0);
                                    break;
                                case 6:
                                    $image = imagerotate($image, -90, 0);
                                    break;
                                case 8:
                                    $image = imagerotate($image, 90, 0);
                                    break;
                            }
                        }
                    }

                    // Set file path
                    $filename = Str::random(10) . '.' . $extension;
                    $relativePath = 'images/' . $filename;
                    $publicPath = public_path($relativePath);

                    // Output buffer & compress based on format
                    $success = false;
                    $quality = 100;

                    while ($quality >= 10) {
                        ob_start();
                        if (in_array($extension, ['jpg', 'jpeg'])) {
                            imagejpeg($image, null, $quality);
                        } elseif ($extension === 'png') {
                            $pngQuality = (int)((100 - $quality) / 10); // png: 0 (best) to 9 (worst)
                            imagepng($image, null, $pngQuality);
                        } elseif ($extension === 'gif') {
                            imagegif($image);
                        }

                        $compressedImage = ob_get_clean();
                        file_put_contents($publicPath, $compressedImage);
                        if (strlen($compressedImage) <= 60 * 1024 || $extension === 'gif') {
                            $success = true;
                            break;
                        }

                        $quality -= 10;
                    }

                    imagedestroy($image);
                }

                $check_entrolled = EntrolledImageModel::where('empguid', $item['empguid'])->first();
                if (!$check_entrolled) {
                    $entrolled = new EntrolledImageModel();
                } else {
                    $entrolled = EntrolledImageModel::find($check_entrolled->id);

                    $entrolled_log = new EntrolledLog();
                    $entrolled_log->empguid = $entrolled->empguid;
                    $entrolled_log->vector = $entrolled->vector;
                    $entrolled_log->image = $entrolled->image;
                    $entrolled_log->created_by = $entrolled->created_by;
                    $entrolled_log->api = 'Multiple Save Entrolled';
                    $entrolled_log->save();
                    $filePath = public_path($entrolled->image);
                    if (!empty($entrolled->image) && file_exists($filePath)) {
                        // unlink($filePath);
                    }
                }
                $entrolled->empguid     =   $item['empguid'];
                $entrolled->vector      =   $item['vector'];
                $entrolled->image       =   $relativePath;
                $entrolled->created_by  =   $createdby_id;
                $entrolled->save();

                $user = TplUserModel::where('guid', $item['empguid'])->first();
                $user->image = $entrolled->image;
                $user->save();
                $entrolled->created_by  =   $item['createdby'];
                $entrolled->image       =   asset($entrolled->image);
            } catch (Exception $e) {
                $error = 'Some thing went wrong';
                return $this->sendapiError($error, 422);
            }
        }
        return $this->sendResponse([], 'Entrolled Image saved successfully.', 200, $request, 'mutliple save entrolled image');
    }
    public function generatebulkvector(Request $all_requests)
    {
        if (!empty($all_requests->all())) {
            foreach ($all_requests->all() as $data) {
                $data['vector'] = json_encode($data['vector']);

                // Now convert the entire array into JSON
                $request = json_decode(json_encode($data));  // Decode into a

                $emp_data = explode('EMP0', $request->empguid);
                $user = User::where('emp_id', 'like', '%' . $emp_data[1])->first();
                if (!empty($user)) {

                    $check_entrolled = EntrolledImageModel::where('empguid', $user->guid)->first();
                    if (!$check_entrolled) {
                        $entrolled = new EntrolledImageModel();
                    } else {
                        $entrolled = EntrolledImageModel::find($check_entrolled->id);

                        $filePath = public_path($entrolled->image);
                    }
                    $entrolled->empguid     =   $user->guid;
                    $entrolled->vector      =   $request->vector;
                    $entrolled->image       =   '';
                    $entrolled->created_by  =   1;
                    $entrolled->save();
                }
            }
        }
        return $this->sendResponse($entrolled, 'Entrolled Image saved successfully.', 200, $all_requests, 'generate bulk vector');
    }

    public function getallvectors(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'update_date' => ['required', 'date_format:Y-m-d'],
            'createdby' => ['required'],
            'length' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        }
        $createduser = TplUserModel::where('guid', $request->createdby)->first();
        if (!$createduser) {
            $error = 'Created By Employee Not Found.';
            return $this->sendapiError($error, 404);
        }
        $createdby_id = $createduser->id;
        // Set default values for pagination if not provided
        $length = $request->length ?? 25; // Default to 25 if length is not provided
        $page = $request->page ?? 1; // Default to page 1 if page is not provided

        // Calculate the skip and take values for pagination
        $skip = ($page - 1) * $length;

        $entrolled = [
            'data' => EntrolledImageModel::with('User')
                ->whereDate('updated_at', '>=', $request->update_date)
                // ->where('created_by', $createdby_id)
                ->skip($skip)
                ->take($length)
                ->get()
                ->map(function ($item) {
                    $createduser = TplUserModel::find($item->created_by);

                    if (!empty($createduser->guid)) {
                        $item->created_by = $createduser->guid;
                        $item->image = asset($item->image) . '?v=' . strtotime(date('d-m-Y H:i:s'));

                        if (!empty($item->user->user_id)) {
                            $currentuser = TplUserModel::find($item->user->user_id);
                            $item->user->name = $currentuser->name;
                        }
                    }
                    return $item;
                }),
            'total_count' => EntrolledImageModel::whereDate('updated_at', '>=', $request->update_date)
                //->where('created_by', $createdby_id)
                ->count()
        ];

        return $this->sendResponse($entrolled, 'Enrolled Images Fetch Successfully', 200, $request, 'get all vectors');
    }


    public function history(Request $request)
    {
        // Validate required emp_id
        $validator = Validator::make($request->all(), [
            'emp_id' => ['required'],
            'date' => ['sometimes', 'date'],
        ]);

        if ($validator->fails()) {
            return $this->sendError('validation', ['errors' => $validator->errors()->messages()], 400);
        }

        // Find user by GUID
        $user = User::where('guid', $request->emp_id)->firstOrFail();
        $length = $request->input('length', 25);

        // Transformation function for worked hours
        $transform = function ($item) {
            if (!empty($item->checkin) && !empty($item->checkout)) {
                $check_in_time = new \DateTime($item->checkin);
                $check_out_time = new \DateTime($item->checkout);
                $interval = $check_out_time->diff($check_in_time);
                $item->worked_hours = $interval->format('%H:%I:%S');
            } else {
                $item->worked_hours = '';
            }

            return $item->makeHidden(['user_id']);
        };

        // All data
        $query = CheckinModel::with(['Project', 'User', 'UserLogin'])
            ->where('user_id', $user->user_id);
        if (!empty($request->name)) {
            $query = $query->whereHas('User', function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->name . '%');
            })->orwhereHas('UserLogin', function ($query) use ($request) {
                $query->where('emp_id', $request->name);
            });
        }
        $all_total = (clone $query)->count();
        $all_data_paginated = (clone $query)->orderBy('id', 'desc')->paginate($length)->through($transform);
        // Yesterday
        $yesterday = Carbon::yesterday()->toDateString();
        if (!empty($request->name)) {
            $query = $query->whereHas('User', function ($query) use ($request) {
                $query->where('emp_id', $request->emp_id);
            });
        }
        $yesterdayQuery = (clone $query)->whereDate('date', $yesterday);
        $yesterday_total = (clone $yesterdayQuery)->count();
        $yesterday_paginated = $yesterdayQuery->orderBy('id', 'desc')->paginate($length)->through($transform);

        // Today
        $today = Carbon::today()->toDateString();
        $todayQuery = (clone $query)->whereDate('date', $today);
        $today_total = (clone $todayQuery)->count();
        $today_paginated = $todayQuery->orderBy('id', 'desc')->paginate($length)->through($transform);

        // Last 7 Days
        $last7Query = (clone $query)->whereBetween('date', [Carbon::today()->subDays(6)->toDateString(), $today]);
        $last7_total = (clone $last7Query)->count();
        $last_7_days_paginated = $last7Query->orderBy('id', 'desc')->paginate($length)->through($transform);

        // Last 30 Days
        $last30Query = (clone $query)->whereBetween('date', [Carbon::today()->subDays(29)->toDateString(), $today]);
        $last30_total = (clone $last30Query)->count();
        $last_30_days_paginated = $last30Query->orderBy('id', 'desc')->paginate($length)->through($transform);

        // Particular Date (if provided)
        if ($request->filled('date')) {
            $date = $request->input('date');
            $dateQuery = (clone $query)->whereDate('date', $date);
            $date_total = (clone $dateQuery)->count();
            $date_paginated = $dateQuery->orderBy('id', 'desc')->paginate($length)->through($transform);

            $filter_date = $this->formatPaginatedResponse($date_paginated, $date_total);
        } else {
            $filter_date = '';
        }

        // Final response
        $login_history = [
            'all_data' => $this->formatPaginatedResponse($all_data_paginated, $all_total),
            'yesterday' => $this->formatPaginatedResponse($yesterday_paginated, $yesterday_total),
            'today' => $this->formatPaginatedResponse($today_paginated, $today_total),
            'last_7days' => $this->formatPaginatedResponse($last_7_days_paginated, $last7_total),
            'last_30days' => $this->formatPaginatedResponse($last_30_days_paginated, $last30_total),
            'filter_date' => $filter_date,
        ];

        return $this->sendResponse($login_history, 'History Fetch Successfully', 200, $request, 'history');
    }



    private function formatPaginatedResponse($paginated, $all_total)
    {
        return [
            'data' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'next_page' => $paginated->nextPageUrl(),
            'prev_page' => $paginated->previousPageUrl(),
            'total_page' => $paginated->total(),
            'per_page' => $paginated->perPage(),
            'total_count' => $total_count ?? $paginated->total(),
        ];
    }
    public function web_history(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'emp_id' => ['required']
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        }
        $login_history = CheckinModel::with(['Project', 'User', 'CreatedUser'])->orderBy('id', 'desc')->where('emp_id', $request->emp_id)->get()->makeHidden(['user_id'])->map(function ($item) {
            $check_in_time  = new \DateTime($item->checkin);
            $check_out_time = new \DateTime($item->checkout);
            $interval = $check_out_time->diff($check_in_time);

            $item->worked_hours = (!empty($item->checkin) && !empty($item->checkout)) ? $interval->format('%H:%I:%S') : '';
            return $item;
        });
        return $this->sendResponse($login_history, 'History Fetch Successfully', 200, $request, 'history');
    }
    public function web_reset_password(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guid' => ['required'],
            'new_password' => 'required|min:6|confirmed',
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        }
        $employee = TplUserModel::where('guid', $request->guid)->first();
        if (empty($employee->id)) {
            return $this->sendError([], 'No Employee Found', 404);
        }
        $user = User::where('guid', $request->guid)->first();
        $user->password = Hash::make($request->new_password);
        $user->save();
        return $this->sendResponse([], 'Password Reset Successfully.', 200, $request, 'web reset password');
    }
    public function assign_role(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guid' => ['required'],
            'role' => ['required', 'array'],
            'role.*' => ['required', 'string'],
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        } else {
            $employee = TplUserModel::where('guid', $request->guid)->first();
            if (empty($employee->id)) {
                return $this->sendError([], 'No Employee Found', 404);
            }
            UserRoleModel::where('user_id', $employee->id)->delete();
            $roles    = $request->role;
            foreach ($roles as $role1) {
                $curent_roles = RoleModel::where('rolename', $role1)->first();
                $user_role              =   new UserRoleModel();
                $user_role->user_id     =   $employee->id;
                $user_role->role_id     =   $curent_roles->id;
                $user_role->save();
            }
            return $this->sendResponse([], 'Roles Assigned Successfully.', 200, $request, 'assign role');
        }
    }
    public function web_assign_role(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guid' => ['required'],
            'role' => ['required', 'array'],
            'role.*' => ['required', 'string'],
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        } else {
            $employee = TplUserModel::where('guid', $request->guid)->first();
            if (empty($employee->id)) {
                return $this->sendError([], 'No Employee Found', 404);
            }
            UserRoleModel::where('user_id', $employee->id)->delete();
            $roles    = $request->role;
            foreach ($roles as $role1) {
                $curent_roles = RoleModel::where('rolename', $role1)->first();
                $user_role              =   new UserRoleModel();
                $user_role->user_id     =   $employee->id;
                $user_role->role_id     =   $curent_roles->id;
                $user_role->save();
            }
            if (!empty($request->password)) {
                $user = User::where('guid', $request->guid)->first();
                $user->password = Hash::make($request->password);
                $user->save();
            }
            return $this->sendResponse([], 'Roles Assigned Successfully.', 200, $request, 'assign role');
        }
    }
    public function get_user_role(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guid' => ['required']
        ]);
        if ($validator->fails()) {
            $validation_error['errors'] = $validator->errors()->messages();
            return $this->sendError('validation', $validation_error, 400);
        }
        $employee = TplUserModel::where('guid', $request->guid)->first();
        if (empty($employee->id)) {
            return $this->sendError([], 'No Employee Found', 404);
        }
        $user_roles = UserRoleModel::with(['Roles', 'User'])->where('user_id', $employee->id)->get();
        return $this->sendResponse($user_roles, 'Roles Fetched Successfully.', 200, $request, 'get user role');
    }

    public function reports(Request $request)
    {
        $login_history = CheckinModel::with(['Project', 'Entity', 'Category', 'Classification', 'User', 'UserLogin'])->orderBy('id', 'desc')->get()->makeHidden(['user_id'])->map(function ($item) {
            $check_in_time  = new \DateTime($item->checkin);
            $check_out_time = new \DateTime($item->checkout);
            $interval = $check_out_time->diff($check_in_time);
            $item->worked_hours = $interval->format('%H:%I:%S');
            return $item;
        });
        return $this->sendResponse($login_history, '', 200, $request, 'reports');
    }

public function web_reports(Request $request)
{
    $date  = $request->date ?? date('Y-m-d');
    $limit = $request->limit ?? 100;
    $page  = $request->page ?? 1;

    $query = \DB::table('tbl_user as u')

        ->leftJoin('tbl_userlogin as ul', 'ul.user_id', '=', 'u.id')

        ->leftJoin('tbl_user_checin_checkout as c', function ($join) use ($date) {
            $join->on(\DB::raw('c.emp_id::text'), '=', \DB::raw('u.guid::text'))
                 ->whereRaw('c.date::date = ?', [$date]);
        })

        // 🔥 SAFE PROJECT JOIN (works for bigint or uuid)
        ->leftJoin('tbl_project as p', function ($join) {
            $join->on(\DB::raw('p.id::text'), '=', \DB::raw('c.project_id::text'));
        })

        ->leftJoin('tbl_mastervalue as cat', 'cat.code', '=', 'u.category_code')
        ->leftJoin('tbl_mastervalue as cls', 'cls.code', '=', 'u.classification_code')

        // SAFE ENTITY JOIN
        ->leftJoin('tbl_entity as e', function ($join) {
            $join->on(\DB::raw('e.id::text'), '=', \DB::raw('u.entity_id::text'));
        });

    // =============================
    // APPLY FILTERS SAFELY
    // =============================

    if ($request->entity && $request->entity !== 'all') {
        $query->whereRaw('u.entity_id::text = ?', [$request->entity]);
    }

    if ($request->category && $request->category !== 'all') {
        $query->where('u.category_code', $request->category);
    }

    if ($request->classification && $request->classification !== 'all') {
        $query->where('u.classification_code', $request->classification);
    }

    if ($request->project && $request->project !== 'all') {
        $query->whereRaw('c.project_id::text = ?', [$request->project]);
    }

    if ($request->search_emp) {
        $query->where('ul.emp_id', 'ILIKE', '%' . $request->search_emp . '%');
    }

    if ($request->search_name) {
        $query->where('u.name', 'ILIKE', '%' . $request->search_name . '%');
    }

    // =============================
    // REMOVE DUPLICATES
    // =============================

    $query->selectRaw("
        DISTINCT ON (u.guid)
        u.guid as emp_id,
        u.name as employee_name,
        ul.emp_id as login_emp_id,
        e.entityname,
        cat.description as category,
        cls.description as classification,
        p.projectname,
        c.date,
        c.checkin,
        c.checkout,
        CASE 
            WHEN c.checkout IS NOT NULL 
            THEN TO_CHAR((c.checkout - c.checkin), 'HH24:MI:SS')
            ELSE NULL 
        END as worked_hours,
        CASE 
            WHEN c.emp_id IS NULL THEN 'Absent'
            WHEN c.checkout IS NULL THEN 'Checked-in Only'
            ELSE 'Present'
        END as status
    ")
    ->orderBy('u.guid')
    ->orderBy('c.id', 'desc');

    $reports = $query->paginate($limit, ['*'], 'page', $page);

    return $this->sendResponse([
        'data' => $reports->items(),
        'current_page' => $reports->currentPage(),
        'last_page' => $reports->lastPage(),
        'total' => $reports->total()
    ], '', 200, $request, 'web_reports');
}


public function web_report_day_details(Request $request)
{
    $validator = Validator::make($request->all(), [
        'emp_id' => 'required',
        'date'   => 'required|date',
    ]);

    if ($validator->fails()) {
        return $this->sendapiError('Validation failed', 400);
    }

    $data = \DB::table('tbl_user_checin_checkout')
        ->where('emp_id', $request->emp_id)
        ->whereDate('date', $request->date)
        ->orderBy('checkin', 'asc')
        ->get([
            'id',
            'checkin',
            'checkout',
            'lat',
            'lan',
            'project_id',
            'created_at'
        ]);

    return $this->sendResponse([
        'data' => $data
    ], 'Day details fetched successfully', 200, $request, 'web_report_day_details');
}

    public function exportEnrolledCSV()
    {
        $data = EntrolledImageModel::with(['User', 'TplUser'])->whereHas('User', function ($query) {
            $query->where('isactive', true)->where('user_id', '<>', 1);
        })->get()->map(function ($item) {
            return [
                'name' => $item->TplUser->name ?? '', // 'name' from TplUser
                'emp_id' => $item->User->emp_id ?? '', // 'emp_id' from User
            ];
        });

        // Open memory stream for writing
        $fileName = 'enrolled_data.csv';
        $handle = fopen('php://output', 'w');

        // Set the appropriate headers for CSV download
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        // Add CSV headers (columns)
        fputcsv($handle, ['Name', 'Employee Id']); // Custom headers

        // Loop through data and write to the CSV
        foreach ($data as $row) {
            fputcsv($handle, [$row['name'], $row['emp_id']]); // Write the values of name and emp_id
        }

        // Close the file handle and end the response
        fclose($handle);
        exit; // Ensure that the script stops and the response is sent to the browser
    }
    public function exportNotEnrolledCSV()
    {
        $data = TplUserModel::with(['User'])->where('id', '<>', 1)->where('isactive', true)->whereNotIn('guid', function ($query) {
            $query->select('empguid')->from('tbl_entrolled_image');
        })->get()->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'emp_id' => $item->User->emp_id ?? '',
            ];
        });

        // Open memory stream for writing
        $fileName = 'not_enrolled_data.csv';
        $handle = fopen('php://output', 'w');

        // Set the appropriate headers for CSV download
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        // Add CSV headers (columns)
        fputcsv($handle, ['Name', 'Employee Id']); // Custom headers

        // Loop through data and write to the CSV
        foreach ($data as $row) {
            fputcsv($handle, [$row['name'], $row['emp_id']]); // Write the values of name and emp_id
        }

        // Close the file handle and end the response
        fclose($handle);
        exit; // Ensure that the script stops and the response is sent to the browser
    }

    public function exportEnrolledImages()
    {
        return Excel::download(new EnrolledImagesExport, 'enrolled.xlsx');
    }
    public function NotexportEnrolledImages()
    {
        return Excel::download(new NotEnrolledImagesExport, 'not_enrolled.xlsx');
    }
    public function add_enrolled_payload(Request $request)
    {
        $enrolled_payload              =   new EnrolledPayloadModel();
        $enrolled_payload->deviceid    =   $request->deviceid;
        $enrolled_payload->userid      =   $request->userid;
        $enrolled_payload->task        =   $request->task;
        $enrolled_payload->logdate     =   $request->logdate;
        $enrolled_payload->platform    =   $request->platform;
        $enrolled_payload->devicemodel =   $request->devicemodel;
        $enrolled_payload->data        =   $request->data;
        $enrolled_payload->save();
        return $this->sendResponse([], 'Enrolled Payload added Successfully.', 200, $request, 'assign role');
    }
    public function list_enrolled_payload(Request $request)
    {
        $enrolled_payload = EnrolledPayloadModel::orderBy('id', 'desc');

        if (!empty($request->deviceid)) {
            $enrolled_payload =  $enrolled_payload->where('deviceid', 'like', '%' . $request->deviceid . '%');
        }
        if (!empty($request->userid)) {
            $enrolled_payload =  $enrolled_payload->where('userid', 'like', '%' . $request->userid . '%');
        }
        if (!empty($request->task)) {
            $enrolled_payload =  $enrolled_payload->where('task', 'like', '%' . $request->task . '%');
        }
        if (!empty($request->logdate)) {
            $enrolled_payload =  $enrolled_payload->where('logdate', 'like', '%' . $request->logdate . '%');
        }
        if (!empty($request->platform)) {
            $enrolled_payload =  $enrolled_payload->where('platform', 'like', '%' . $request->platform . '%');
        }
        if (!empty($request->devicemodel)) {
            $enrolled_payload =  $enrolled_payload->where('devicemodel', 'like', '%' . $request->devicemodel . '%');
        }
        if (!empty($request->data)) {
            $enrolled_payload =  $enrolled_payload->where('data', 'like', '%' . $request->data . '%');
        }
        $length = $request->length ?? 25; // Default to 25 if length is not provided

        $enrolled_payload = $enrolled_payload->orderBy('id', 'asc')->paginate($length);
        return $this->sendResponse($enrolled_payload, 'Enrolled Payload', 200, $request, 'Enrolled Payload List');
    }
    public function exportCsv(Request $request)
    {
        $query = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories']);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('emp_id', 'like', "%{$searchTerm}%");
        }

        if (!empty($request->name)) {
            $query = $query->where('name', 'like', '%' . $request->name . '%');
        }
        if (!empty($request->emp_id)) {
            $query = $query->whereHas('User', function ($query1) use ($request) {
                $query1->where('emp_id', $request->emp_id);
            })->orWhere('name', 'like', '%' . $request->emp_id . '%');
        }
        if (!empty($request->role)) {
            $query = $query->whereHas('Roles', function ($query1) use ($request) {
                $query1->where('guid', $request->role);
            });
        }
        if (isset($request->assigned_role)) {
            if ($request->assigned_role == 1) {
                $query = $query->whereHas('Roles', function ($query1) use ($request) {
                    $query1->whereNotNull('guid');
                });
            } else {

                $query = $query->whereDoesntHave('Roles');
            }
        }
        if (isset($request->entrolled)) {
            if ($request->entrolled == 1) {
                $query = $query->where('isentrolled', true);
            } else {
                $query = $query->where('isentrolled', false);
            }
        }
        if (!empty($request->entity)) {
            $query = $query->whereHas('Entities', function ($query1) use ($request) {
                $query1->where('guid', 'like', '%' . $request->entity . '%');
            });
        }
        if (!empty($request->classification)) {
            $query = $query->whereHas('Classifications', function ($query1) use ($request) {
                $query1->where('code', $request->classification);
            });
        }
        if (!empty($request->category)) {
            $allquery_user = $query->whereHas('Categories', function ($query1) use ($request) {
                $query1->where('code', $request->category);
            });
        }
        // ... add other filters as needed

        $data = $query->get();

        // The rest of the logic remains the same
        $fileName = 'employees-report-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0",
        ];

        $columns = array('Name', 'Email', 'Entity', 'Classification', 'Status');

        $callback = function () use ($data, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($data as $item) {
                fputcsv($file, [
                    $item->name,
                    $item->email,
                    $item->entity,
                    $item->classification,
                    $item->status ? 'Active' : 'Inactive',
                ]);
            }
            fclose($file);
        };

        exit;
    }

 public function importCsv(Request $request)
    {
        $employees = $request->input('data');





        if (!is_array($employees)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Invalid JSON format'
            ], 422);
        }

        $total    = count($employees);
        $inserted = 0;
        $updated  = 0;
        $skipped = 0;

        $insertedRecords = [];
        $updatedRecords  = [];
        $skippedRecords  = [];

        DB::beginTransaction();

$defaultPassword = bcrypt('123456');


        try {
            foreach ($employees as $employeeData) {

                // REQUIRED FIELDS
                if (
                    empty($employeeData['employeeId']) ||
                    empty($employeeData['name'])
                ) {

                    $skipped++;
                    $skippedRecords[] = [
                        'employeeId' => $employeeData['employeeId'] ?? null,
                        'name'       => $employeeData['name'] ?? null,
                        'reason'     => 'Missing Employee ID or Name'
                    ];
                    continue;
                }



                $empId = trim($employeeData['employeeId']);
                $name  = trim($employeeData['name']);

                // 🔧 FIX EMAIL (remove spaces)
                $email = strtolower(trim($employeeData['email'] ?? ''));
                $email = str_replace(' ', '', $email);
                $email = $email !== '' ? $email : null;

                // 🔧 CORRECT MOBILE FIELD
                $mobile = trim($employeeData['contactNumber'] ?? '');
                $mobile = $mobile !== '' ? $mobile : null;

                // ---------- CHECK EXISTING ----------
                $checkEmployee = TplUserModel::where('unique_id', $empId)->first();

                // Duplicate email
                $checkEmail = $email
                    ? TplUserModel::where('email', $email)
                    ->when($checkEmployee, fn($q) => $q->where('id', '!=', $checkEmployee->id))
                    ->first()
                    : null;

                // Duplicate login
                $checkUser = User::where('emp_id', $empId)
                    ->when($checkEmployee, fn($q) => $q->where('user_id', '!=', $checkEmployee->id))
                    ->first();




                // ---------- MASTER VALUES ----------
                $categoryCode = $this->getOrCreateMasterCode(
                    'CATEGORY',
                    $employeeData['category'] ?? null
                );

                $classificationCode = $this->getOrCreateMasterCode(
                    'CLASSIFICATION',
                    $employeeData['classification'] ?? null
                );

                $entityName = trim($employeeData['entity'] ?? '');
				
$entityId = DB::table('tbl_entity')
    ->whereRaw('LOWER(entityname) = ?', [strtolower($entityName)])
    ->value('id');

if (!$entityId && $entityName !== '') {

    $newEntity = EntityModel::create([
        'guid'       => Str::uuid(),
        'entityname' => $entityName,
        'isactive'   => true
    ]);

    $entityId = $newEntity->id;
}


                // 🔧 STATUS NOT PROVIDED → DEFAULT ACTIVE
                $isActive = true;

                $loginmethodCode = $email ? 'email' : 'code';

                // ==================================================
                // CREATE
                // ==================================================
                if (!$checkEmployee) {


                    if ($checkEmail || $checkUser) {

                        $skipped++;

                        $skippedRecords[] = [
                            'employeeId' => $empId,
                            'name'       => $name,
                            'reason'     => 'Duplicate Email or User Login'
                        ];
                        continue;
                    }


                    $user = new TplUserModel();
                    $user->name = $name;
                    $user->guid = Str::uuid();
                    $user->unique_id = $empId;
                    if ($email)  $user->email = $email;
                    if ($mobile) $user->mobile = $mobile;
                    $user->category_code = $categoryCode;
                    $user->classification_code = $classificationCode;
                    $user->entity_id = $entityId;
                    $user->loginmethod_code = $loginmethodCode;
                    $user->isactive = $isActive;
                    $user->save();

                    $login = new User();
                    $login->guid = $user->guid;
                    $login->email = $email ?: $empId;
                    $login->user_id = $user->id;
                    $login->emp_id = $empId;
                    $login->password = $defaultPassword;
                    $login->passcode = 'TEST';
                    $login->defaultpassword = 1;
                    $login->isactive = $isActive;
                    $login->save();

                    $inserted++;

                    $insertedRecords[] = [
                        'employeeId' => $empId,
                        'name'       => $name
                    ];
                }
                // ==================================================
                // UPDATE
                // ==================================================
                else {

                    $user = TplUserModel::find($checkEmployee->id);
                    $user->name = $name;
                    if ($email)  $user->email = $email;
                    if ($mobile) $user->mobile = $mobile;
                    $user->category_code = $categoryCode;
                    $user->classification_code = $classificationCode;
                    $user->entity_id = $entityId;
                    $user->loginmethod_code = $loginmethodCode;
                    $user->isactive = $isActive;
                    $user->save();

                    $login = User::where('user_id', $user->id)->first();
                    if ($login) {
                        $login->email = $email ?: $empId;
                        $login->emp_id = $empId;
                        $login->isactive = $isActive;
                        $login->save();
                    }

                    $updated++;

                    $updatedRecords[] = [
                        'employeeId' => $empId,
                        'name'       => $name
                    ];
                }
            }

            DB::commit();
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }

        // ✅ RESPONSE UNCHANGED
        return response()->json([
            'status'       => 'success',
            'total_users'  => $total,
            'inserted'     => $inserted,
            'existing'     => $updated,
            'skipped'      => $skipped,


            'inserted_records' => $insertedRecords,
            'updated_records'  => $updatedRecords,
            'skipped_records'  => $skippedRecords,
        ]);
    }




private function getOrCreateMasterCode($type, $description)
{
    if (empty($description)) {
        return null;
    }

    $description = trim($description);

    // 1. If description already exists, return its code
    $existing = DB::table('tbl_mastervalue')
        ->where('master_key', $type)
        ->whereRaw('LOWER(description) = LOWER(?)', [$description])
        ->first();

    if ($existing) {
        return $existing->code;
    }

    $prefix = ($type === 'CATEGORY') ? 'CAT' : 'CLS';

    // 2. Get starting max number
    $lastNumber = DB::table('tbl_mastervalue')
        ->where('master_key', $type)
        ->where('code', 'LIKE', $prefix . '%')
        ->selectRaw(
            "MAX(CAST(SUBSTRING(code FROM ?) AS INTEGER)) AS max_no",
            [strlen($prefix) + 1]
        )
        ->value('max_no');

    $next = ($lastNumber ?? 0) + 1;

    // 3. LOOP until a free code is found
    do {
        $newCode = $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);

        $codeExists = DB::table('tbl_mastervalue')
            ->where('master_key', $type)
            ->where('code', $newCode)
            ->exists();

        if ($codeExists) {
            $next++; // regenerate
        }

    } while ($codeExists);

    // 4. Insert only when code is guaranteed free
    DB::table('tbl_mastervalue')->insert([
        'master_key'  => $type,
        'guid'        => Str::uuid(),
        'code'        => $newCode,
        'description' => $description,
        'isactive'    => true,
        'created_at'  => now(),
    ]);

    return $newCode;
}


public function removeEnrolledImage(Request $request)
{
    $validator = Validator::make($request->all(), [
        'empguid' => ['required']
    ]);

    if ($validator->fails()) {
        $validation_error['errors'] = $validator->errors()->messages();
        return $this->sendError('validation', $validation_error, 400);
    }

    $user = TplUserModel::where('guid', $request->empguid)->first();
    if (!$user) {
        return $this->sendapiError('Employee not found.', 404);
    }

    $entrolled = EntrolledImageModel::where('empguid', $request->empguid)->first();

    if (!$entrolled) {
        return $this->sendapiError('No enrolled face found.', 404);
    }

    try {

        // Save log before deleting
        $log = new EntrolledLog();
        $log->empguid = $entrolled->empguid;
        $log->vector = $entrolled->vector;
        $log->image = $entrolled->image;
        $log->created_by = $entrolled->created_by;
        $log->api = 'Remove Entrolled';
        $log->save();

        // Delete image file
        $filePath = public_path($entrolled->image);
        if (!empty($entrolled->image) && file_exists($filePath)) {
            unlink($filePath);
        }

        // Delete DB record
        $entrolled->delete();

        // Remove user profile image
        $user->image = null;
        $user->save();

        return $this->sendResponse([], 'Face enrollment removed successfully.', 200, $request, 'remove_enrollment_api');

    } catch (\Exception $e) {
        return $this->sendapiError('Something went wrong.', 422);
    }
}

	
}
