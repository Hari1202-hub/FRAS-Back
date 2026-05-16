<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\EntityModel;
use App\Models\MasterValueModel;
use App\Models\RoleModel;
use App\Models\TplUserModel;
use App\Models\User;
use App\Models\UserRoleModel;

class StaffController extends BaseController
{
    /**
     * List staff with full search / filter / pagination.
     *
     * Query params:
     *   search          – name or emp_id (partial)
     *   name            – name partial
     *   emp_id          – exact emp_id
     *   role            – role guid
     *   entity          – entity id / guid
     *   classification  – classification code
     *   category        – category code
     *   enrolled        – 1 = enrolled, 0 = not enrolled
     *   status          – 1 = active, 0 = inactive
     *   per_page        – default 25
     *   page            – default 1
     */
    public function index(Request $request)
    {
        $query = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'faceEnrolled', 'Project'])
            ->where('id', '<>', 1);

        // Generic search across name + emp_id
        if ($request->filled('search')) {
            $term  = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ilike', "%{$term}%")
                  ->orWhereHas('User', fn($u) => $u->where('emp_id', 'ilike', "%{$term}%"));
            });
        }

        if ($request->filled('name')) {
            $query->where('name', 'ilike', '%' . $request->name . '%');
        }

        if ($request->filled('emp_id')) {
            $query->whereHas('User', fn($q) => $q->where('emp_id', $request->emp_id));
        }

        if ($request->filled('role')) {
            $query->whereHas('Roles', fn($q) => $q->where('guid', $request->role));
        }

        if ($request->filled('entity')) {
            $query->where(function ($q) use ($request) {
                $q->where('entity_id', $request->entity)
                  ->orWhereHas('Entities', fn($e) => $e->where('guid', $request->entity));
            });
        }

        if ($request->filled('classification')) {
            $query->whereHas('Classifications', fn($q) => $q->where('code', $request->classification));
        }

        if ($request->filled('category')) {
            $query->whereHas('Categories', fn($q) => $q->where('code', $request->category));
        }

        if ($request->filled('status')) {
            $query->where('isactive', (bool) $request->status);
        }

        if ($request->filled('enrolled')) {
            if ((int) $request->enrolled === 1) {
                $query->whereIn('guid', fn($q) => $q->select('empguid')->from('tbl_entrolled_image'));
            } else {
                $query->whereNotIn('guid', fn($q) => $q->select('empguid')->from('tbl_entrolled_image'));
            }
        }

        if ($request->has('has_role')) {
            if ((int) $request->has_role === 1) {
                $query->whereHas('Roles');
            } else {
                $query->whereDoesntHave('Roles');
            }
        }

        $perPage   = (int) ($request->per_page ?? 25);
        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        $paginator->getCollection()->transform(function ($item) {
            $item->image       = $this->resolveImage($item);
            $item->is_enrolled = !empty($item->faceEnrolled);
            return $item;
        });

        return $this->paginated($paginator, 'Staff list fetched.');
    }

    /**
     * GET /api/v2/staff/all
     *
     * Returns all active staff as a flat list (guid, name, emp_id).
     * Cached for 30 minutes — designed for dropdown population with 5 K+ records.
     * Cache is automatically busted when staff are created/updated elsewhere.
     */
    public function listAll()
    {
        $data = Cache::remember('staff_all_active_dropdown', 1800, function () {
            return TplUserModel::with('User')
                ->where('isactive', true)
                ->where('id', '<>', 1)
                ->orderBy('name')
                ->get()
                ->map(fn($s) => [
                    'guid'   => $s->guid,
                    'name'   => $s->name ?? '',
                    'emp_id' => $s->User?->emp_id ?? '',
                ])
                ->values();
        });

        return $this->success($data, 'Staff list fetched.');
    }

    /**
     * Get enrolled staff (faces registered in the system).
     */
    public function enrolled(Request $request)
    {
        $perPage = (int) ($request->per_page ?? 25);

        $query = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'faceEnrolled', 'Project'])
            ->where('id', '<>', 1)
            ->where('isactive', true)
            ->whereIn('guid', fn($q) => $q->select('empguid')->from('tbl_entrolled_image'));

        $this->applyCommonFilters($query, $request);

        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        $paginator->getCollection()->transform(function ($item) {
            $item->image       = $this->resolveImage($item);
            $item->is_enrolled = true;
            return $item;
        });

        return $this->paginated($paginator, 'Enrolled staff fetched.');
    }

    /**
     * Get unenrolled staff (no face registered).
     */
    public function unenrolled(Request $request)
    {
        $perPage = (int) ($request->per_page ?? 25);

        $query = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'Project'])
            ->where('id', '<>', 1)
            ->where('isactive', true)
            ->whereNotIn('guid', fn($q) => $q->select('empguid')->from('tbl_entrolled_image'));

        $this->applyCommonFilters($query, $request);

        $paginator = $query->orderBy('name', 'asc')->paginate($perPage);

        $paginator->getCollection()->transform(function ($item) {
            $item->image       = $this->resolveImage($item);
            $item->is_enrolled = false;
            return $item;
        });

        return $this->paginated($paginator, 'Unenrolled staff fetched.');
    }

    /**
     * Get single staff member details.
     */
    public function show(string $guid)
    {
        $staff = TplUserModel::with(['User', 'Roles', 'Entities', 'Classifications', 'Categories', 'faceEnrolled', 'Project'])
            ->where('guid', $guid)
            ->first();

        if (!$staff) {
            return $this->notFound('Staff member not found.');
        }

        $staff->image       = $this->resolveImage($staff);
        $staff->is_enrolled = !empty($staff->faceEnrolled);

        return $this->success($staff, 'Staff details fetched.');
    }

    /**
     * Create or upsert staff members.
     * Body: { "employees": [ { id, name, entity, classification, category, email?, mobile?, status, reference_id } ] }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employees'   => 'required|array|min:1',
            'employees.*' => 'array',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $inserted = [];
        $updated  = [];
        $skipped  = [];

        DB::beginTransaction();

        try {
            foreach ($request->employees as $index => $emp) {
                $rowValidator = Validator::make($emp, [
                    'id'             => 'required|string|max:50',
                    'name'           => 'required|string|max:100',
                    'entity'         => 'required|string',
                    'classification' => 'required|string',
                    'category'       => 'required|string',
                    'email'          => 'nullable|email',
                    'mobile'         => 'nullable',
                    'status'         => 'required',
                    'reference_id'   => 'required|string',
                ]);

                if ($rowValidator->fails()) {
                    $skipped[] = ['row' => $index + 1, 'errors' => $rowValidator->errors()->toArray()];
                    continue;
                }

                $entity         = $this->firstOrCreateEntity($emp['entity']);
                $categoryCode   = $this->firstOrCreateMasterCode('CATEGORY', $emp['category']);
                $classCode      = $this->firstOrCreateMasterCode('CLASSIFICATION', $emp['classification']);
                $isActive       = strtolower($emp['status']) === 'active';
                $email          = !empty($emp['email']) ? strtolower(trim($emp['email'])) : null;
                $mobile         = !empty($emp['mobile']) ? trim($emp['mobile']) : null;

                $existing = TplUserModel::where('unique_id', $emp['reference_id'])->first();

                // Duplicate guards
                $emailTaken = $email
                    ? TplUserModel::where('email', $email)
                        ->when($existing, fn($q) => $q->where('id', '!=', $existing->id))
                        ->exists()
                    : false;

                $empIdTaken = User::where('emp_id', $emp['id'])
                    ->when($existing, fn($q) => $q->where('user_id', '!=', optional($existing)->id))
                    ->exists();

                if ($emailTaken || $empIdTaken) {
                    $skipped[] = ['row' => $index + 1, 'reason' => 'Duplicate email or employee ID'];
                    continue;
                }

                if (!$existing) {
                    $user                      = new TplUserModel();
                    $user->guid                = Str::uuid();
                    $user->unique_id           = $emp['reference_id'];
                    $user->name                = $emp['name'];
                    $user->email               = $email;
                    $user->mobile              = $mobile;
                    $user->category_code       = $categoryCode;
                    $user->classification_code = $classCode;
                    $user->entity_id           = $entity->id;
                    $user->loginmethod_code    = $email ? 'email' : 'Employee Id';
                    $user->isactive            = $isActive;
                    $user->save();

                    $login                  = new User();
                    $login->guid            = $user->guid;
                    $login->email           = $email ?? $emp['id'];
                    $login->user_id         = $user->id;
                    $login->emp_id          = $emp['id'];
                    $login->password        = bcrypt('123456');
                    $login->passcode        = 'TEST';
                    $login->defaultpassword = 1;
                    $login->isactive        = $isActive;
                    $login->save();

                    $inserted[] = ['emp_id' => $emp['id'], 'name' => $emp['name']];
                } else {
                    $existing->name                = $emp['name'];
                    $existing->email               = $email ?? $existing->email;
                    $existing->mobile              = $mobile ?? $existing->mobile;
                    $existing->category_code       = $categoryCode;
                    $existing->classification_code = $classCode;
                    $existing->entity_id           = $entity->id;
                    $existing->isactive            = $isActive;
                    $existing->save();

                    $login = User::where('user_id', $existing->id)->first();
                    if ($login) {
                        $login->email    = $email ?? $login->email;
                        $login->emp_id   = $emp['id'];
                        $login->isactive = $isActive;
                        $login->save();
                    }

                    $updated[] = ['emp_id' => $emp['id'], 'name' => $emp['name']];
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->error('Failed to process staff data: ' . $e->getMessage(), 500);
        }

        return $this->success([
            'inserted'         => count($inserted),
            'updated'          => count($updated),
            'skipped'          => count($skipped),
            'inserted_records' => $inserted,
            'updated_records'  => $updated,
            'skipped_records'  => $skipped,
        ], 'Staff processed successfully.', 200, $request, 'staff/store');
    }

    /**
     * Assign roles to a staff member.
     * Body: { "guid": "...", "roles": ["Role Name", ...], "password"?: "..." }
     */
    public function assignRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guid'    => 'required|string',
            'roles'   => 'required|array|min:1',
            'roles.*' => 'required|string',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $staff = TplUserModel::where('guid', $request->guid)->first();

        if (!$staff) {
            return $this->notFound('Staff member not found.');
        }

        UserRoleModel::where('user_id', $staff->id)->delete();

        foreach ($request->roles as $roleName) {
            $role = RoleModel::where('rolename', $roleName)->first();
            if ($role) {
                UserRoleModel::create([
                    'user_id' => $staff->id,
                    'role_id' => $role->id,
                ]);
            }
        }

        if ($request->filled('password')) {
            $loginUser = User::where('guid', $request->guid)->first();
            if ($loginUser) {
                $loginUser->password = Hash::make($request->password);
                $loginUser->save();
            }
        }

        return $this->success([], 'Roles assigned successfully.', 200, $request, 'staff/assign-role');
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function applyCommonFilters(&$query, Request $request): void
    {
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ilike', "%{$term}%")
                  ->orWhereHas('User', fn($u) => $u->where('emp_id', 'ilike', "%{$term}%"));
            });
        }

        if ($request->filled('entity')) {
            $query->where(function ($q) use ($request) {
                $q->where('entity_id', $request->entity)
                  ->orWhereHas('Entities', fn($e) => $e->where('guid', $request->entity));
            });
        }

        if ($request->filled('classification')) {
            $query->whereHas('Classifications', fn($q) => $q->where('code', $request->classification));
        }

        if ($request->filled('category')) {
            $query->whereHas('Categories', fn($q) => $q->where('code', $request->category));
        }

        if ($request->filled('role')) {
            $query->whereHas('Roles', fn($q) => $q->where('guid', $request->role));
        }
    }

    private function firstOrCreateEntity(string $name): EntityModel
    {
        $entity = EntityModel::whereRaw('LOWER(entityname) = ?', [strtolower(trim($name))])->first();

        if (!$entity) {
            $entity             = new EntityModel();
            $entity->guid       = Str::uuid();
            $entity->entityname = trim($name);
            $entity->isactive   = true;
            $entity->save();
        }

        return $entity;
    }

    private function firstOrCreateMasterCode(string $type, string $description): string
    {
        $description = trim($description);

        $existing = DB::table('tbl_mastervalue')
            ->where('master_key', $type)
            ->whereRaw('LOWER(description) = LOWER(?)', [$description])
            ->first();

        if ($existing) {
            return $existing->code;
        }

        $prefix = $type === 'CATEGORY' ? 'CAT' : 'CLS';

        $lastNum = DB::table('tbl_mastervalue')
            ->where('master_key', $type)
            ->where('code', 'LIKE', $prefix . '%')
            ->selectRaw('MAX(CAST(SUBSTRING(code FROM ?) AS INTEGER)) AS max_no', [strlen($prefix) + 1])
            ->value('max_no');

        $next = ($lastNum ?? 0) + 1;

        do {
            $newCode   = $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);
            $taken     = DB::table('tbl_mastervalue')->where('master_key', $type)->where('code', $newCode)->exists();
            if ($taken) $next++;
        } while ($taken);

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
}
