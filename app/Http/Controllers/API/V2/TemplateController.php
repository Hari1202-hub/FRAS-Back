<?php

namespace App\Http\Controllers\API\V2;

use App\Helpers\XlsxWriter;
use App\Models\EntityModel;
use App\Models\TplUserModel;
use App\Models\ProjectModel;

class TemplateController extends BaseController
{
    public function employees()
    {
        $entities = EntityModel::where('isactive', true)
            ->orderBy('entityname')
            ->pluck('entityname')
            ->toArray();

        $writer = new XlsxWriter();

        $writer->addSheet(
            'Employees',
            ['Employee Id', 'Full Name', 'Entity', 'Classification', 'Category', 'Status', 'Email', 'Contact Number'],
            [['EMP001', 'John Doe', $entities[0] ?? 'EntityName', 'Staff', 'General', 'Active', 'john@example.com', '+971501234567']]
        );

        $entityRows = array_map(fn($e) => [$e], $entities);
        $writer->addSheet('Ref - Entities', ['Entity Name'], $entityRows);

        return $writer->download('employees_import_template.xlsx');
    }

    public function projects()
    {
        $entities = EntityModel::where('isactive', true)
            ->orderBy('entityname')
            ->pluck('entityname')
            ->toArray();

        $writer = new XlsxWriter();

        $writer->addSheet(
            'Projects',
            ['Project ID', 'Project Name', 'Reference ID', 'Entity', 'Location', 'Start Date', 'End Date', 'Status'],
            [['PRJ001', 'Sample Project', 'REF001', $entities[0] ?? 'EntityName', 'Dubai', '01-01-2025', '31-12-2025', 'Active']]
        );

        $entityRows = array_map(fn($e) => [$e], $entities);
        $writer->addSheet('Ref - Entities', ['Entity Name'], $entityRows);

        return $writer->download('projects_import_template.xlsx');
    }

    public function entities()
    {
        $writer = new XlsxWriter();

        $writer->addSheet(
            'Entities',
            ['Entity Code', 'Entity Name'],
            [['ENT001', 'Sample Entity Name']]
        );

        return $writer->download('entities_import_template.xlsx');
    }

    public function attendance()
    {
        $headers = ['Employee_ID', 'Project_ID', 'Date_dd_mm_yyyy', 'Check_In_24hours_format', 'Check_Out_24hours_format', 'Attendance_Type'];
        $sample  = ['TAN0001', 'PSE20251013', '29-08-2024', '10:00', '22:20', 'Regular'];

        $csv = implode(',', $headers) . "\n" . implode(',', $sample) . "\n";

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="bulk_attendance_template.csv"',
        ]);
    }
}
