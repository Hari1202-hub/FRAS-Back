<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\EntityModel;
use App\Models\ProjectModel;

class ProjectCsvSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = database_path('seeders/project_data.csv');

        if (!File::exists($file)) {
            $this->command->error("File not found: $file");
            return;
        }

        $data = array_map('str_getcsv', file($file));
        $header = array_map('trim', array_shift($data)); // get header
           //echo '<pre>';print_r($data);exit;

        foreach ($data as $row) {
           // $row = array_combine($header, $row);

           // echo '<pre>';print_r($row);exit;

            $guid = Str::uuid()->toString();

           $entity = EntityModel::where('entityname',$row[4])->first();

           if(!empty($entity)){
            $entity_id = $entity->id;
           }
           else{
                $entity = new EntityModel();
                $entity->guid           =   Str::uuid()->toString();
                $entity->entityname     =   $row[4];
                $entity->isactive       =   true;
                $entity->save();
                $entity_id = $entity->id;
           }
           $location = explode(',',$row[2]);
           $latitude = $location[0];
           $longitude = $location[1];
           $geometry = "POINT($longitude $latitude)";
           $startdate = date('Y-m-d', strtotime('2025-07-01'));
            $enddate = date('Y-m-d', strtotime('2025-08-31'));

           $project = new ProjectModel();
           $project->guid = Str::uuid(10);
           $project->projectid = $row[0];
           $project->projectname = $row[1];
           $project->entity_id = $entity_id;
           $project->location_shotname = $row[3];
           $project->location_longname = $row[3];
           $project->geog = $geometry;
           //$project->latitude = $latitude;
           //$project->longitude = $longitude;
           $project->isactive = true;
           $project->startdate = $startdate;
           $project->enddate = $enddate;
           $project->save();
           
            
        }
    }
}
