<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\EntrolledImageModel;
use App\Models\EntrolledLog;
use App\Models\TplUserModel;

class EnrollmentController extends BaseController
{
    /**
     * Save / update a single face enrollment.
     *
     * Body:
     *   empguid    – staff GUID
     *   vector     – face vector (string/JSON)
     *   vectors?   – additional vectors
     *   blob       – base64 image (data:image/...;base64,...)
     *   createdby  – creator staff GUID
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empguid'   => 'required|string',
            'vector'    => 'required',
            'blob'      => 'required|string',
            'createdby' => 'required|string',
            'vectors'   => 'nullable',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $staff = TplUserModel::where('guid', $request->empguid)->first();
        if (!$staff) return $this->notFound('Staff member not found.');

        $creator = TplUserModel::where('guid', $request->createdby)->first();
        if (!$creator) return $this->notFound('Creator not found.');

        $relativePath = $this->saveBase64Image($request->blob);

        if ($relativePath === null) {
            return $this->error('Invalid or unsupported image data.', 422);
        }

        $existing = EntrolledImageModel::where('empguid', $request->empguid)->first();

        if ($existing) {
            EntrolledLog::create([
                'empguid'    => $existing->empguid,
                'vector'     => $existing->vector,
                'image'      => $existing->image,
                'created_by' => $existing->created_by,
                'api'        => 'v2/enrollment/store',
            ]);
            $enrollment = $existing;
        } else {
            $enrollment = new EntrolledImageModel();
        }

        $enrollment->empguid    = $request->empguid;
        $enrollment->vector     = $request->vector;
        $enrollment->vectors    = $request->vectors;
        $enrollment->image      = $relativePath;
        $enrollment->created_by = $creator->id;
        $enrollment->save();

        $staff->image = $relativePath;
        $staff->save();

        $response               = $enrollment->toArray();
        $response['image']      = asset("storage/$relativePath");
        $response['created_by'] = $request->createdby;

        return $this->success($response, 'Face enrolled successfully.', 200, $request, 'enrollment/store');
    }

    /**
     * Bulk save multiple face enrollments.
     * Body: array of { empguid, vector, blob, createdby }
     */
    public function bulkStore(Request $request)
    {
        $items = $request->all();

        if (empty($items) || !is_array($items)) {
            return $this->error('Request body must be a non-empty JSON array.', 422);
        }

        $saved  = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $rowValidator = Validator::make($item, [
                'empguid'   => 'required|string',
                'vector'    => 'required',
                'blob'      => 'required|string',
                'createdby' => 'required|string',
            ]);

            if ($rowValidator->fails()) {
                $errors[] = ['index' => $index, 'errors' => $rowValidator->errors()->toArray()];
                continue;
            }

            $staff   = TplUserModel::where('guid', $item['empguid'])->first();
            $creator = TplUserModel::where('guid', $item['createdby'])->first();

            if (!$staff) {
                $errors[] = ['index' => $index, 'error' => 'Staff not found'];
                continue;
            }
            if (!$creator) {
                $errors[] = ['index' => $index, 'error' => 'Creator not found'];
                continue;
            }

            $relativePath = $this->saveBase64Image($item['blob']);

            if ($relativePath === null) {
                $errors[] = ['index' => $index, 'error' => 'Invalid image data'];
                continue;
            }

            $existing = EntrolledImageModel::where('empguid', $item['empguid'])->first();

            if ($existing) {
                EntrolledLog::create([
                    'empguid'    => $existing->empguid,
                    'vector'     => $existing->vector,
                    'image'      => $existing->image,
                    'created_by' => $existing->created_by,
                    'api'        => 'v2/enrollment/bulk',
                ]);
                $enrollment = $existing;
            } else {
                $enrollment = new EntrolledImageModel();
            }

            $enrollment->empguid    = $item['empguid'];
            $enrollment->vector     = $item['vector'];
            $enrollment->image      = $relativePath;
            $enrollment->created_by = $creator->id;
            $enrollment->save();

            $staff->image = $relativePath;
            $staff->save();

            $saved[] = $item['empguid'];
        }

        return $this->success([
            'saved'  => $saved,
            'errors' => $errors,
        ], 'Bulk enrollment processed.', 200, $request, 'enrollment/bulk');
    }

    /**
     * Remove a face enrollment.
     * Route param: guid = staff GUID (empguid)
     */
    public function destroy(string $guid)
    {
        $staff = TplUserModel::where('guid', $guid)->first();
        if (!$staff) return $this->notFound('Staff member not found.');

        $enrollment = EntrolledImageModel::where('empguid', $guid)->first();
        if (!$enrollment) return $this->notFound('No face enrollment found for this staff member.');

        EntrolledLog::create([
            'empguid'    => $enrollment->empguid,
            'vector'     => $enrollment->vector,
            'image'      => $enrollment->image,
            'created_by' => $enrollment->created_by,
            'api'        => 'v2/enrollment/destroy',
        ]);

        if (!empty($enrollment->image) && Storage::disk('public')->exists($enrollment->image)) {
            Storage::disk('public')->delete($enrollment->image);
        }

        $enrollment->delete();

        $staff->image = null;
        $staff->save();

        return $this->success([], 'Face enrollment removed successfully.');
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    /**
     * Decode, EXIF-rotate, compress, and persist a base64 image.
     * Uses Storage::disk('public') — writes to storage/app/public/images/
     * which is always writable in the Docker container.
     * Returns the relative path (e.g. images/abc123.jpg) or null on failure.
     */
    private function saveBase64Image(string $blob): ?string
    {
        // Strip optional data-URI header (matches AttendanceController approach)
        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $blob);
        $imageData = base64_decode($base64, strict: true);

        if ($imageData === false) return null;

        // Detect extension from data-URI if present
        $extension = 'jpg';
        if (preg_match('/^data:image\/(\w+);base64,/', $blob, $type)) {
            $extension = strtolower($type[1]);
        }

        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
            return null;
        }

        if ($extension === 'gif' && substr_count($imageData, 'NETSCAPE2.0') > 0) {
            return null;
        }

        $image = imagecreatefromstring($imageData);
        if (!$image) return null;

        // Auto-rotate JPEG based on EXIF orientation
        if (in_array($extension, ['jpg', 'jpeg']) && function_exists('exif_read_data')) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'exif');
            file_put_contents($tmpFile, $imageData);
            $exif = @exif_read_data($tmpFile);
            unlink($tmpFile);

            if (!empty($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3: $image = imagerotate($image, 180, 0);  break;
                    case 6: $image = imagerotate($image, -90, 0); break;
                    case 8: $image = imagerotate($image, 90, 0);  break;
                }
            }
        }

        // Compress to ≤60 KB
        $quality = 100;
        $compressed = '';
        while ($quality >= 10) {
            ob_start();
            if (in_array($extension, ['jpg', 'jpeg'])) {
                imagejpeg($image, null, $quality);
            } elseif ($extension === 'png') {
                imagepng($image, null, (int) ((100 - $quality) / 10));
            } else {
                imagegif($image);
            }
            $compressed = ob_get_clean();

            if (strlen($compressed) <= 60 * 1024 || $extension === 'gif') {
                break;
            }
            $quality -= 10;
        }

        imagedestroy($image);

        $filename     = Str::random(10) . '.' . $extension;
        $relativePath = 'images/' . $filename;
        $publicPath = public_path($relativePath);

        file_put_contents($publicPath, $compressed);

        return $relativePath;
    }
}
