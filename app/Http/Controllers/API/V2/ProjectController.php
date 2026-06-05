<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\EntityModel;
use App\Models\ProjectLatLngModel;
use App\Models\ProjectModel;
use App\Models\TplUserModel;
use App\Models\UserProjectModel;

class ProjectController extends BaseController
{
    /**
     * List all projects.
     * Query params: search, entity, active (1/0), per_page
     */
    public function index(Request $request)
    {
        $query = ProjectModel::with(['Entity', 'ProjectLatLng'])
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('projectname', 'ilike', $term)
                  ->orWhere('projectid', 'ilike', $term);
            });
        }

        if ($request->filled('entity')) {
            $query->where('entity_id', $request->entity);
        }

        if ($request->filled('active')) {
            $query->where('isactive', (bool) $request->active);
        }

        if ($request->boolean('all')) {
            return $this->success($query->get(), 'Projects fetched.');
        }

        $perPage   = (int) ($request->per_page ?? 25);
        $paginator = $query->paginate($perPage);

        return $this->paginated($paginator, 'Projects fetched.');
    }

    /**
     * Get a single project by GUID.
     */
    public function show(string $guid)
    {
        $project = ProjectModel::with(['Entity', 'ProjectLatLng'])->where('guid', $guid)->first();

        if (!$project) {
            return $this->notFound('Project not found.');
        }

        return $this->success($project, 'Project details fetched.');
    }

    /**
     * Projects whose polygon boundary contains the given GPS coordinate.
     * Uses the Google Maps polygon stored in the project's `geog` column.
     * Query params: latitude (req), longitude (req)
     */
    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $userId = (int) auth('api')->user()->user_id;

        // Polygon-matched projects (mirrors V1 project_lat_lng key)
        $nearbyProjects = ProjectModel::getProjectsContainingPoint(
            $userId,
            (float) $request->latitude,
            (float) $request->longitude
        );

        // All active projects assigned to the user (mirrors V1 all_projects key)
        $allProjects = ProjectModel::with(['Entity', 'UserProject', 'ProjectLatLng'])
            ->where('isactive', true)
            ->whereHas('UserProject', fn($q) => $q->where('user_id', $userId))
            ->orderBy('id', 'desc')
            ->get();

        return $this->success([
            'project_lat_lng' => $nearbyProjects,
            'all_projects'    => $allProjects,
        ], 'Nearby projects fetched.', 200, $request, 'projects/nearby');
    }

    /**
     * Create a new project.
     * Body: { projectid, projectname, entity_id?, location_shotname?, location_longname?,
     *         polygon?: [{lat, lng}, ...],   // Google Maps boundary polygon
     *         latitude?, longitude? }         // single reference point (optional)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'projectid'         => 'required|string|max:100|unique:tbl_project,projectid',
            'projectname'       => 'required|string|max:200',
            'entity_id'         => 'nullable',
            'location_shotname' => 'nullable|string|max:200',
            'location_longname' => 'nullable|string|max:500',
            'polygon'           => 'nullable|array|min:3',
            'polygon.*.latitude'  => 'required_with:polygon|numeric',
            'polygon.*.longitude' => 'required_with:polygon|numeric',
            'latitude'          => 'nullable|numeric',
            'longitude'         => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $entityId = $this->resolveEntityId($request->entity_id);

        if ($request->filled('entity_id') && $entityId === null) {
            return $this->error('Entity not found for the provided entity_id.', 422);
        }

        $project                    = new ProjectModel();
        $project->guid              = Str::uuid();
        $project->projectid         = $request->projectid;
        $project->projectname       = $request->projectname;
        $project->entity_id         = $entityId;
        $project->location_shotname = $request->location_shotname ?? '';
        $project->location_longname = $request->location_longname ?? '';
        $project->isactive          = true;
        $project->save();

        if ($request->filled('polygon')) {
            // Store each vertex as its own row — polygon order preserved by id
            foreach ($request->polygon as $vertex) {
                ProjectLatLngModel::create([
                    'project_id' => $project->id,
                    'latitude'   => $vertex['latitude'],
                    'longitude'  => $vertex['longitude'],
                ]);
            }
        } elseif ($request->filled('latitude') && $request->filled('longitude')) {
            ProjectLatLngModel::create([
                'project_id' => $project->id,
                'latitude'   => $request->latitude,
                'longitude'  => $request->longitude,
            ]);
        }

        $project->load(['Entity', 'ProjectLatLng']);

        return $this->success($project, 'Project created successfully.', 201, $request, 'projects/store');
    }

    /**
     * Update a project.
     */
    public function update(Request $request, string $guid)
    {
        $project = ProjectModel::where('guid', $guid)->first();

        if (!$project) {
            return $this->notFound('Project not found.');
        }

        $validator = Validator::make($request->all(), [
            'projectname'       => 'sometimes|string|max:200',
            'entity_id'         => 'nullable',
            'location_shotname' => 'nullable|string|max:200',
            'location_longname' => 'nullable|string|max:500',
            'polygon'           => 'nullable|array|min:3',
            'polygon.*.latitude'  => 'required_with:polygon|numeric',
            'polygon.*.longitude' => 'required_with:polygon|numeric',
            'latitude'          => 'nullable|numeric',
            'longitude'         => 'nullable|numeric',
            'active'            => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        if ($request->filled('projectname'))       $project->projectname       = $request->projectname;
        if ($request->filled('entity_id')) {
            $entityId = $this->resolveEntityId($request->entity_id);
            if ($entityId === null) {
                return $this->error('Entity not found for the provided entity_id.', 422);
            }
            $project->entity_id = $entityId;
        }
        if ($request->filled('location_shotname')) $project->location_shotname = $request->location_shotname;
        if ($request->filled('location_longname')) $project->location_longname = $request->location_longname;
        if ($request->has('active'))               $project->isactive          = (bool) $request->active;
        $project->save();

        if ($request->filled('polygon')) {
            // Replace all existing vertices with the new polygon
            ProjectLatLngModel::where('project_id', $project->id)->delete();
            foreach ($request->polygon as $vertex) {
                ProjectLatLngModel::create([
                    'project_id' => $project->id,
                    'latitude'   => $vertex['latitude'],
                    'longitude'  => $vertex['longitude'],
                ]);
            }
        } elseif ($request->filled('latitude') && $request->filled('longitude')) {
            ProjectLatLngModel::create([
                'project_id' => $project->id,
                'latitude'   => $request->latitude,
                'longitude'  => $request->longitude,
            ]);
        }

        $project->load(['Entity', 'ProjectLatLng']);

        return $this->success($project, 'Project updated successfully.', 200, $request, 'projects/update');
    }

    /**
     * Delete a project.
     */
    public function destroy(string $guid)
    {
        $project = ProjectModel::where('guid', $guid)->first();

        if (!$project) {
            return $this->notFound('Project not found.');
        }

        $project->isactive = false;
        $project->save();

        return $this->success([], 'Project deactivated successfully.');
    }

    /**
     * Assign a staff member to a project.
     * Body: { staff_guid, project_guid }
     */
    public function assignStaff(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_guid'   => 'required|string',
            'project_guid' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $staff   = TplUserModel::where('guid', $request->staff_guid)->first();
        $project = ProjectModel::where('guid', $request->project_guid)->first();

        if (!$staff)   return $this->notFound('Staff member not found.');
        if (!$project) return $this->notFound('Project not found.');

        $existing = UserProjectModel::where('user_id', $staff->id)
            ->where('project_id', $project->id)
            ->first();

        if ($existing) {
            return $this->error('Staff already assigned to this project.', 409);
        }

        UserProjectModel::create([
            'user_id'    => $staff->id,
            'project_id' => $project->id,
        ]);

        return $this->success([], 'Staff assigned to project.', 200, $request, 'projects/assign');
    }

    /**
     * Remove a staff–project assignment.
     * Route param: guid = UserProjectModel guid
     */
    public function removeStaff(string $guid)
    {
        $assignment = UserProjectModel::where('guid', $guid)->first();

        if (!$assignment) {
            // Try by id
            $assignment = UserProjectModel::find($guid);
        }

        if (!$assignment) {
            return $this->notFound('Assignment not found.');
        }

        $assignment->delete();

        return $this->success([], 'Staff removed from project.');
    }

    // =========================================================================
    // BULK TIMEKEEPER ASSIGNMENT
    // =========================================================================

    /**
     * GET /api/v2/projects/timekeeper-template
     *
     * Returns all active projects with their currently assigned timekeeper.
     * Used by the React frontend to generate the Excel download template.
     */
    public function timekeeperTemplate(Request $request)
    {
        $projects = ProjectModel::with(['UserProject.User'])
            ->where('isactive', true)
            ->orderBy('projectid')
            ->get()
            ->map(function ($p) {
                $user = optional($p->UserProject)->User;
                return [
                    'project_guid'    => $p->guid,
                    'project_id'      => $p->projectid,
                    'project_name'    => $p->projectname,
                    'timekeeper_guid' => $user?->guid,
                    'timekeeper_name' => $user?->name,
                ];
            });

        return $this->success($projects, 'Template data fetched.', 200, $request, 'projects/timekeeper-template');
    }

    /**
     * POST /api/v2/projects/bulk-assign-timekeeper
     *
     * Body: { assignments: [{ project_guid, staff_guids: [guid, ...] }, ...] }
     *
     * Each project's entire timekeeper list is replaced atomically.
     * Multiple timekeepers per project are supported via the staff_guids array.
     */
    /**
     * Accept entity_id as either a UUID (guid) or an integer (id).
     * Returns the integer id, or null if not found / not provided.
     */
    private function resolveEntityId(mixed $value): ?int
    {
        if (empty($value)) {
            return null;
        }

        // Already an integer id
        if (is_numeric($value)) {
            return (int) $value;
        }

        // Entity code first (e.g. ENT001) — checked before UUID so codes take priority
        $byCode = EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$value])->value('id');
        if ($byCode !== null) {
            return $byCode;
        }

        // UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $value)) {
            return EntityModel::where('guid', $value)->value('id');
        }

        return null;
    }

    public function bulkAssignTimekeeper(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'assignments'                  => 'required|array|min:1',
            'assignments.*.project_guid'   => 'required|string',
            'assignments.*.staff_guids'    => 'required|array|min:1',
            'assignments.*.staff_guids.*'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $assigned = 0;
        $skipped  = 0;
        $errors   = [];

        DB::beginTransaction();
        try {
            foreach ($request->assignments as $item) {
                $project = ProjectModel::where('guid', $item['project_guid'])->first();

                if (!$project) {
                    $errors[] = "Project not found: {$item['project_guid']}";
                    $skipped++;
                    continue;
                }

                // Remove all existing timekeepers for this project before inserting the new set
                UserProjectModel::where('project_id', $project->id)->delete();

                foreach ($item['staff_guids'] as $staffGuid) {
                    $staff = TplUserModel::where('guid', $staffGuid)->first();
                    if (!$staff) {
                        $errors[] = "Staff not found: {$staffGuid} (project {$project->projectid})";
                        continue;
                    }
                    UserProjectModel::create([
                        'user_id'    => $staff->id,
                        'project_id' => $project->id,
                    ]);
                    $assigned++;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Bulk assignment failed: ' . $e->getMessage(), 500);
        }

        return $this->success(
            ['assigned' => $assigned, 'skipped' => $skipped, 'errors' => $errors],
            "{$assigned} assignment(s) completed, {$skipped} project(s) skipped.",
            200, $request, 'projects/bulk-assign-timekeeper'
        );
    }
}
