<?php

namespace App\Exports;

use App\Models\EntrolledImageModel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EnrolledImagesExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
         return EntrolledImageModel::with(['User','TplUser'])->get()->map(function ($item) {
            return [
                'name' => $item->TplUser->name ?? '',
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
