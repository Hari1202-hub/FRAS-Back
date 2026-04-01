<?php

namespace App\Exports;

use App\Models\TplUserModel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class NotEnrolledImagesExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return TplUserModel::with('User')->whereNotIn('guid', function($query) {
            $query->select('empguid')->from('tbl_entrolled_image');
        })->get()->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'emp_id' => $item->User->emp_id?? '',
            ];
        });
    }
    public function headings(): array
    {
        return [
            'Name',
            'Employee Id'
        ];
    }
}
