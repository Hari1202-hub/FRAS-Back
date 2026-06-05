<?php

namespace App\Http\Controllers\API\V2;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\EntityModel;

class EntityController extends BaseController
{
    /**
     * GET /api/v2/entities
     */
    public function index(Request $request)
    {
        $query = EntityModel::orderBy('entityname', 'asc');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('entityname', 'ilike', '%' . $request->search . '%')
                  ->orWhere('entity_code', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->has('active')) {
            $query->where('isactive', (bool) $request->active);
        }

        if ($request->boolean('all')) {
            return $this->success($query->get(), 'Entities fetched.');
        }

        $perPage = (int) ($request->per_page ?? 25);

        return $this->paginated($query->paginate($perPage), 'Entities fetched.');
    }

    /**
     * POST /api/v2/entities
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entityname'  => 'required|string|max:255',
            'entity_code' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $name = trim($request->entityname);
        $code = $request->filled('entity_code') ? strtoupper(trim($request->entity_code)) : null;

        if (EntityModel::whereRaw('LOWER(entityname) = LOWER(?)', [$name])->exists()) {
            return $this->error('An entity with this name already exists.', 409);
        }

        if ($code && EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$code])->exists()) {
            return $this->error('An entity with this code already exists.', 409);
        }

        $entity = new EntityModel();
        $entity->guid        = Str::uuid();
        $entity->entity_code = $code;
        $entity->entityname  = $name;
        $entity->isactive    = true;
        $entity->save();

        return $this->success($entity, 'Entity created.', 201);
    }

    /**
     * GET /api/v2/entities/{guid}
     */
    public function show(string $guid)
    {
        $entity = EntityModel::where('guid', $guid)->first();

        if (!$entity) {
            return $this->notFound('Entity not found.');
        }

        return $this->success($entity, 'Entity fetched.');
    }

    /**
     * PUT /api/v2/entities/{guid}
     */
    public function update(Request $request, string $guid)
    {
        $entity = EntityModel::where('guid', $guid)->first();

        if (!$entity) {
            return $this->notFound('Entity not found.');
        }

        $validator = Validator::make($request->all(), [
            'entityname'  => 'sometimes|string|max:255',
            'entity_code' => 'sometimes|nullable|string|max:50',
            'isactive'    => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        if ($request->filled('entityname')) {
            $name = trim($request->entityname);
            if (EntityModel::whereRaw('LOWER(entityname) = LOWER(?)', [$name])->where('guid', '!=', $guid)->exists()) {
                return $this->error('An entity with this name already exists.', 409);
            }
            $entity->entityname = $name;
        }

        if ($request->has('entity_code')) {
            $code = $request->entity_code ? strtoupper(trim($request->entity_code)) : null;
            if ($code && EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$code])->where('guid', '!=', $guid)->exists()) {
                return $this->error('An entity with this code already exists.', 409);
            }
            $entity->entity_code = $code;
        }

        if ($request->has('isactive')) {
            $entity->isactive = $request->boolean('isactive');
        }

        $entity->save();

        return $this->success($entity, 'Entity updated.');
    }

    /**
     * DELETE /api/v2/entities/{guid}
     */
    public function destroy(string $guid)
    {
        $entity = EntityModel::where('guid', $guid)->first();

        if (!$entity) {
            return $this->notFound('Entity not found.');
        }

        $entity->isactive = false;
        $entity->save();

        return $this->success([], 'Entity deactivated.');
    }

    /**
     * POST /api/v2/entities/import
     * Body: { "entities": [{ entity_code, entityname }] }
     * Upserts by entity_code. If entity_code is absent, inserts by name (skips on duplicate name).
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entities'              => 'required|array|min:1',
            'entities.*.entityname' => 'required|string|max:255',
            'entities.*.entity_code'=> 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors()->toArray());
        }

        $inserted = [];
        $updated  = [];
        $skipped  = [];

        foreach ($request->entities as $index => $row) {
            $name = trim($row['entityname']);
            $code = !empty($row['entity_code']) ? strtoupper(trim($row['entity_code'])) : null;

            // Try to find existing entity — prefer match by code, then by name
            $existing = null;
            if ($code) {
                $existing = EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$code])->first();
            }
            if (!$existing) {
                $existing = EntityModel::whereRaw('LOWER(entityname) = LOWER(?)', [$name])->first();
            }

            if ($existing) {
                $changed = false;

                if ($code && strtoupper($existing->entity_code ?? '') !== $code) {
                    // Check the new code isn't taken by a different record
                    $codeTaken = EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$code])
                        ->where('id', '!=', $existing->id)
                        ->exists();
                    if ($codeTaken) {
                        $skipped[] = ['row' => $index + 1, 'entityname' => $name, 'reason' => "Entity code {$code} is already assigned to another entity."];
                        continue;
                    }
                    $existing->entity_code = $code;
                    $changed = true;
                }

                if (strcasecmp($existing->entityname, $name) !== 0) {
                    $nameTaken = EntityModel::whereRaw('LOWER(entityname) = LOWER(?)', [$name])
                        ->where('id', '!=', $existing->id)
                        ->exists();
                    if ($nameTaken) {
                        $skipped[] = ['row' => $index + 1, 'entityname' => $name, 'reason' => "Entity name already exists for a different record."];
                        continue;
                    }
                    $existing->entityname = $name;
                    $changed = true;
                }

                if ($changed) {
                    $existing->save();
                    $updated[] = ['entity_code' => $existing->entity_code, 'entityname' => $name];
                } else {
                    $skipped[] = ['row' => $index + 1, 'entityname' => $name, 'reason' => 'No changes detected.'];
                }
            } else {
                // Create new
                if ($code) {
                    $codeTaken = EntityModel::whereRaw('UPPER(entity_code) = UPPER(?)', [$code])->exists();
                    if ($codeTaken) {
                        $skipped[] = ['row' => $index + 1, 'entityname' => $name, 'reason' => "Entity code {$code} already exists."];
                        continue;
                    }
                }

                $entity              = new EntityModel();
                $entity->guid        = Str::uuid();
                $entity->entity_code = $code;
                $entity->entityname  = $name;
                $entity->isactive    = true;
                $entity->save();

                $inserted[] = ['entity_code' => $code, 'entityname' => $name];
            }
        }

        return $this->success([
            'inserted'         => count($inserted),
            'updated'          => count($updated),
            'skipped'          => count($skipped),
            'inserted_records' => $inserted,
            'updated_records'  => $updated,
            'skipped_records'  => $skipped,
        ], 'Entities processed successfully.');
    }
}
