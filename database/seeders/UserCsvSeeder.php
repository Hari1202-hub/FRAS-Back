<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class UserCsvSeeder extends Seeder
{
    public function run()
    {
        $file = database_path('seeders/user_data.csv');

        if (!File::exists($file)) {
            $this->command->error("File not found: $file");
            return;
        }

        $data = array_map('str_getcsv', file($file));
        $header = array_map('trim', array_shift($data)); // get header
        
           //echo '<pre>';print_r($data);exit;
        foreach ($data as $row) {
           // $row = array_combine($header, $row);
            $category_code = DB::table('tbl_mastervalue')->where('master_key','CATEGORY')->where('description',trim($row['4']))->value('code');
            if(empty($category_code)){
                $categories = DB::table('tbl_mastervalue')->pluck('code')->toArray();
                $category_code = $this->generateDesignationCode($row[4],$categories);
                if(!empty($category_code)){
                    $category_guid = Str::uuid()->toString();
                    DB::table('tbl_mastervalue')->insertGetId([
                            'master_key' => 'CATEGORY',
                            'guid' => $category_guid,
                            'code' => $category_code,
                            'description' => $row['4'],
                            'isactive' => true,
                        ]);
                }
            }

            $guid = Str::uuid()->toString();
            $classification_code = DB::table('tbl_mastervalue')->where('master_key','CLASSIFICATION')->where('description',$row['3'])->value('code');
            if(empty($classification_code)){
                $classifications = DB::table('tbl_mastervalue')->where('master_key','CLASSIFICATION')->pluck('code')->toArray();
                $classification_code = $this->generateDesignationCode($row[3],$classifications);
                if(!empty($classification_code)){
                    $classification_guid = Str::uuid()->toString();
                    DB::table('tbl_mastervalue')->insertGetId([
                            'master_key' => 'CLASSIFICATION',
                            'guid' => $classification_guid,
                            'code' => $classification_code,
                            'description' => $row['3'],
                            'isactive' => true,
                        ]);
                }
            }


            $entity_id = DB::table('tbl_entity')->where('entityname',$row['0'])->value('id');
            if(empty($entity_id)){
                $entity_guid = Str::uuid()->toString();
                $entity_id = DB::table('tbl_entity')->insertGetId([
                                'guid' => $entity_guid,
                                'entityname' => $row[0],
                                'isactive' => true,
                            ]);
            }

            $userId = DB::table('tbl_user')->insertGetId([
                'name' => mb_convert_encoding($row['2'], 'UTF-8', ['UTF-8', 'ISO-8859-1', 'Windows-1252']),
                'guid' => $guid,
                'email' => '',
                'category_code' => $category_code,
                'classification_code' => $classification_code,
                'entity_id' => $entity_id,
                'loginmethod_code' => 'email',
                'isactive' => true,
            ]);

            DB::table('tbl_userlogin')->insert([
                'guid' => $guid,
                'user_id' => $userId,
                'emp_id' => $row[1],
                'password' => bcrypt('123456'),
                'defaultpassword' => 1,
                'isactive' => true,
                'passcode'=>'test'
            ]);
        }
    }
    private function generateDesignationCode($designation, &$existingCodes)
    {
        $base = strtoupper(substr(str_replace(' ', '', $designation), 0, 3));
        if (strlen($base) < 3) {
            $base = str_pad($base, 3, "X"); // pad with X if too short
        }

        $code = $base;
        $i = 1;
        while (in_array($code, $existingCodes)) {
            $code = substr($base, 0, 2) . $i;
            $i++;
        }

        $existingCodes[] = $code;
        return $code;
    }
    private function replaceAccents($string) {
        $accents = [
            'á' => 'a', 'Á' => 'A',
            'é' => 'e', 'É' => 'E',
            'í' => 'i', 'Í' => 'I',
            'ó' => 'o', 'Ó' => 'O',
            'ú' => 'u', 'Ú' => 'U',
            'ñ' => 'n', 'Ñ' => 'N',
            'ç' => 'c', 'Ç' => 'C',
            'á' => 'a', 'Á' => 'A',
            'é' => 'e', 'É' => 'E',
            'í' => 'i', 'Í' => 'I',
            'ó' => 'o', 'Ó' => 'O',
            'ú' => 'u', 'Ú' => 'U',
            'ã' => 'a', 'Ã' => 'A',
            'â' => 'a', 'Â' => 'A',
            'ê' => 'e', 'Ê' => 'E',
            'ô' => 'o', 'Ô' => 'O',
            'õ' => 'o', 'Õ' => 'O',
            'ç' => 'c', 'Ç' => 'C',
            'ñ' => 'n', 'Ñ' => 'N','’'=>'','48'=>'48”'
        ];
        return strtr($string, $accents);
    }

}
