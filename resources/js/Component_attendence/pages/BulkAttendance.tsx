
import { useState,useEffect } from 'react';
import { Calendar, CheckCircle, Search, Upload, FileUp, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Papa from "papaparse";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
// Mock data for employees
const MOCK_EMPLOYEES = [];

//const DUMMY_EXCEL_DATA = [];

// Mock data for filter options



const BulkAttendance = () => {
  
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [project, setProject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for import mode
  const [isImportMode, setIsImportMode] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importComment, setImportComment] = useState("");
  
  // State for selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<string[]>([]);
  const [selectedCheckout, setSelectedCheckout] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Import filters state
  const [importProjectFilter, setImportProjectFilter] = useState<string>("");
  const [importSearchQuery, setImportSearchQuery] = useState<string>("");
  
  // Confirmation dialog states
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNoSelectionDialog, setShowNoSelectionDialog] = useState(false);

  // Filter imported employees based on import filters
  const filteredImportEmployees = importPreviewData.filter((employee) => {
    const projct = 
      importProjectFilter === "all" || 
      ( employee.Project_ID.toLowerCase().includes(importProjectFilter.toLowerCase()));
    const searchMatch = 
      employee.Employee_ID.toLowerCase().includes(importSearchQuery.toLowerCase())
    return  projct && searchMatch;
  });

  const [projects, setProjects] = useState([]);
  const loadProjects = ()=>{
    axios.post(BASEURL+'projects',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let projects = response.data.data;
      setProjects(projects);
    })
  }
  useEffect(() => {
    loadProjects();
  }, []);

  // Handle select all
  const handleSelectAll = () => {
    const allIds = filteredImportEmployees.map((e) => e.Employee_ID);
    const isAllSelected = selectedEmployees.length === allIds.length;

    if (isAllSelected) {
      setSelectedEmployees([]);
    } else {
      const allDates = filteredImportEmployees.map((e) => e.Date);
    const allCheckins = filteredImportEmployees.map((e) => e.Check_In_24hours_format);
    const allCheckouts = filteredImportEmployees.map((e) => e.Check_Out_24hours_format);

    setSelectedEmployees(allIds);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (employee:any) => {
    let employeeId = employee.Employee_ID;
    let employeedate = employee.Date;
    let employeecheckin = employee.Check_In_24hours_format;
    let employeecheckout = employee.Check_Out;
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
    setSelectedDate(prev => 
       [...prev, employeedate]
    );
    setSelectedCheckin(prev => 
       [...prev, employeecheckin]
    );
    setSelectedCheckout(prev => 
       [...prev, employeecheckout]
    );
  };

  // Handle import button click
  const handleImportClick = () => {
    setIsImportMode(true);
    setSelectedEmployees([]);
    setSelectAll(false);
  };
  
  // Clear import filters
  const clearImportFilters = () => {
    setImportProjectFilter("");
    setImportSearchQuery("");
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  if (!file) return;

  setImportFile(file);

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const parsedData = results.data as any[];
      // Validate required fields
      const requiredFields = ["Employee_ID", "Project_ID", "Date_dd_mm_yyyy", "Check_In_24hours_format", "Check_Out_24hours_format","Attendance_Type"];
      const hasAllFields1 = requiredFields.every((field) => {
        console.log(parsedData[0]);
        console.log(field);
        console.log(field in parsedData[0]);
       // field in parsedData[0]
    });

      const hasAllFields = requiredFields.every((field) => field in parsedData[0]);
      console.log(hasAllFields);

      if (!hasAllFields) {
        toast({
          title: "Invalid CSV Format",
          description: "Missing one or more required columns: Employee id, Employee name, project ID, date, checkInTime, checkOutTime.",
          variant: "destructive",
        });
        setImportFile(null);
        setImportPreviewData([]);
        return;
      }

      setImportPreviewData(parsedData);
    },
    error: function () {
      toast({
        title: "Failed to Parse File",
        description: "Ensure it's a valid CSV file in the correct format.",
        variant: "destructive",
      });
      setImportFile(null);
    },
  });
  };
  
  // Open confirmation dialog
  const handleMarkAttendanceClick = () => {
    if (selectedEmployees.length === 0) {
      // Show dialog asking if they want to mark for all employees
      //setShowNoSelectionDialog(true);
      toast({
        title: "error!",
        description: `No Employees selected.`,
      });
    } else {
      // Show confirmation dialog for selected employees
      setShowConfirmationDialog(true);
    }
  };
  
  // Handle marking attendance for selected employees
  const handleMarkAttendance = () => {
    const employeeCount = selectedEmployees.length > 0 
      ? selectedEmployees.length 
      : filteredImportEmployees.length;
    // Show success toast
    if(selectedEmployees!=''){
      toast({
        title: "Success!",
        description: `Attendance marked successfully for ${employeeCount} employees.`,
      });
      axios.post(BASEURL+'bulk_attendance',{selectedEmployees:selectedEmployees,data:importPreviewData},{
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
        let projects = response.data.data;
        //setProjects(projects);
      })
    }

    
    // Reset the interface
    setIsImportMode(false);
    setImportFile(null);
    setImportPreviewData([]);
    setImportComment("");
    setSelectedEmployees([]);
    setSelectedDate([]);
    setSelectedCheckin([]);
    setSelectedCheckout([]);
    setSelectAll(false);
    clearImportFilters();
    setShowConfirmationDialog(false);
    setShowNoSelectionDialog(false);
  };
  
  // Generate and download template
  const downloadTemplate = () => {
    // Create a table structure that can be used as a template
    const headers = ["Employee_ID",  "Project_ID", "Date_dd_mm_yyyy", "Check_In_24hours_format", "Check_Out_24hours_format","Attendance_Type"];
    
    const sampleRows = [
      ["TAN0001","PSE20251013", "29-08-2024", "10:00", "22:20","Regular"]
    ];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    sampleRows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });
    
    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success toast
    toast({
      title: "Template Downloaded",
      description: "You can fill this template and import it back to mark attendance.",
    });
  };

  // If in import mode, show the import view
  if (isImportMode) {
    return (
      <div className="space-y-5 px-1 pt-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Bulk Attendance Import</h1>
          <Button
            variant="outline"
            onClick={() => {
              setIsImportMode(false);
              setImportFile(null);
              setImportPreviewData([]);
              clearImportFilters();
            }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" /> Cancel Import
          </Button>
        </div>
        
        <Card className="p-6 mb-6 shadow-sm">
          {!importFile ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="max-w-lg text-center">
                <Upload className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Upload an CSV file to import attendance data</h3>
                <p className="text-gray-500 mb-6">The file should follow the template format with all required columns.</p>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Label 
                      htmlFor="file-upload" 
                      className="bg-proscape hover:bg-proscape-dark text-white px-6 py-3 rounded cursor-pointer flex items-center gap-2"
                    >
                      <FileUp className="h-5 w-5" />
                      Choose CSV File
                    </Label>
                    <Input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-4 w-4" /> Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Imported Data</h3>
                  <p className="text-sm text-gray-500">
                    {importFile.name} • {importPreviewData.length} employees
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportFile(null);
                    setImportPreviewData([]);
                    clearImportFilters();
                    setSelectedEmployees([]);
                    setSelectAll(false);
                  }}
                >
                  Change File
                </Button>
              </div>

              {/* Comment field for all employees */}
              {/* <div className="mb-6">
                <Label htmlFor="importComment" className="text-sm font-medium">Comment (applies to all employees)</Label>
                <Textarea 
                  id="importComment"
                  placeholder="Enter comment for all imported attendance records..."
                  value={importComment}
                  onChange={(e) => setImportComment(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div> */}
              
              {/* Filter Section */}
              <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project Filter */}
                  <div className="space-y-1">
                    <Label htmlFor="import-project" className="text-sm">Project</Label>
                    <Select value={importProjectFilter} onValueChange={setImportProjectFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Projects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.lenght>0 && projects.map((project,index) => (
                          <SelectItem key={index} value={project.projectname}>{project.projectname}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Search by Name/ID */}
                  <div className="space-y-1">
                    <Label htmlFor="import-search" className="text-sm">Search by Name/ID</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="import-search"
                        placeholder="Search..."
                        className="pl-8 h-9"
                        value={importSearchQuery}
                        onChange={(e) => setImportSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Reset Filters Button */}
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearImportFilters} 
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" /> Clear Filters
                  </Button>
                </div>
              </Card>
              
              {/* Mark Attendance Button - Top */}
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredImportEmployees.length} of {importPreviewData.length} employees
                </p>
                <Button 
                  className="bg-proscape hover:bg-proscape-dark text-white px-6 flex items-center gap-2"
                  onClick={handleMarkAttendanceClick}
                >
                  <CheckCircle className="mr-1 h-5 w-5" /> Mark Attendance
                </Button>
              </div>
              
              {/* Preview Table */}
              <div className="border rounded mb-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12">
                          <div >
    <Checkbox onClick={handleSelectAll}
      checked={
        filteredImportEmployees.length > 0 &&
        filteredImportEmployees.every((e) => selectedEmployees.includes(e.Employee_ID))
      }
      aria-label="Select all employees"
    />
  </div>
                        </TableHead>
                        <TableHead>Employee ID</TableHead>                        <TableHead>Project ID</TableHead>
                        <TableHead> Date</TableHead>
                        <TableHead>Check-In Time</TableHead>
                        <TableHead>Check-Out Time</TableHead>
                        <TableHead>Attendance Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredImportEmployees.length > 0 ? (
                        filteredImportEmployees.map((employee,index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedEmployees.includes(employee.Employee_ID)}
                                onCheckedChange={() => handleCheckboxChange(employee)}
                                aria-label={`Select ${employee.Employee_ID}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{employee.Employee_ID}</TableCell>
                            <TableCell>{employee.Project_ID}</TableCell>
                            <TableCell>{employee.Date_dd_mm_yyyy}</TableCell>
                            <TableCell>{employee.Check_In_24hours_format}</TableCell>
                            <TableCell>{employee.Check_Out_24hours_format}</TableCell>
                            <TableCell>{employee.Attendance_Type}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                            No employees found matching the filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Summary and Mark Attendance Button - Bottom */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Selected: {selectedEmployees.length} of {filteredImportEmployees.length} employees</p>
                </div>
                <Button 
                  className="bg-proscape hover:bg-proscape-dark text-white px-6 flex items-center gap-2"
                  onClick={handleMarkAttendanceClick}
                >
                  <CheckCircle className="mr-1 h-5 w-5" /> Mark Attendance
                </Button>
              </div>
            </>
          )}
        </Card>
        
        {/* Confirmation Dialog - Selected Employees */}
        <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Attendance Marking</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark attendance for the following {selectedEmployees.length} employees?
              </DialogDescription>
            </DialogHeader>
            
            {selectedEmployees.length > 0 && (
              <div className="py-2 max-h-60 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {filteredImportEmployees
                    .filter(employee => selectedEmployees.includes(employee.Employee_ID))
                    .slice(0, 10)
                    .map((employee) => (
                      <li key={employee.Employee_ID} className="flex items-center gap-2">
                        <span className="font-medium">{employee.Employee_ID}:</span> 
                      </li>
                    ))
                  }
                  {selectedEmployees.length > 10 && (
                    <li className="text-muted-foreground">+ {selectedEmployees.length - 10} more employees...</li>
                  )}
                </ul>
              </div>
            )}
            
            <DialogFooter className="flex sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setShowConfirmationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAttendance}
                className="bg-proscape hover:bg-proscape-dark text-white"
              >
                Yes, Mark Attendance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* No Selection Dialog */}
        <Dialog open={showNoSelectionDialog} onOpenChange={setShowNoSelectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>No Employees Selected</DialogTitle>
             {/*  <DialogDescription>
                No employees selected. Do you want to mark attendance for all {filteredImportEmployees.length} imported employees?
              </DialogDescription> */}
            </DialogHeader>
            
           {/*  <DialogFooter className="flex sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setShowNoSelectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAttendance}
                className="bg-proscape hover:bg-proscape-dark text-white"
              >
                Yes, Mark All
              </Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  

  
  return (
    <div className="space-y-5 px-1 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Bulk Attendance</h1>
        
        {/* Filter Section */}
        <Card className="p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            {/* <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between font-normal"
                  >
                    {date ? format(date, "PPP") : "Select date"}
                    <Calendar className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div> */}

            {/* Project Filter */}
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects.lenght>0 && projects.map((project,index) => (
                    <SelectItem key={index} value={project.id}>{project.projectname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search by Name/ID */}
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name/ID</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-end mt-4 gap-4">
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4" /> Download Template
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleImportClick}
              >
                <FileUp className="h-4 w-4" /> Import
              </Button>
            </div>
          </div>
        </Card>

        {/* Empty State - Initial View */}
        <Card className="p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="max-w-lg">
            <Upload className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Import an CSV file to mark attendance</h3>
            <p className="text-gray-500 mb-6">Follow these steps to mark attendance in bulk:</p>
            <ol className="text-left mb-6 space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Download the template using the button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>Fill in the employee attendance data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Import the file and select employees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span>Click "Mark Attendance" to save the records</span>
              </li>
            </ol>
            <div className="flex justify-center">
              <Button 
                className="bg-proscape hover:bg-proscape-dark text-white flex items-center gap-2"
                onClick={handleImportClick}
              >
                <FileUp className="h-4 w-4" /> Import CSV File
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BulkAttendance;
