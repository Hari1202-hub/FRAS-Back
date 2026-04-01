
import { useState } from 'react';
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

// Mock data for employees
const MOCK_EMPLOYEES = [
  { id: "EMP001", name: "John Smith", category: "Carpenter", classification: "Laborer", entity: "Acme Construction", project: "Main Building Construction" },
  { id: "EMP002", name: "Sarah Johnson", category: "Mason", classification: "Laborer", entity: "Acme Construction", project: "Main Building Construction" },
  { id: "EMP003", name: "Emily Davis", category: "Plumber", classification: "Laborer", entity: "Skyline Builders", project: "Bridge Expansion" },
  { id: "EMP004", name: "Robert Williams", category: "Electrician", classification: "Laborer", entity: "Skyline Builders", project: "Bridge Expansion" },
  { id: "EMP005", name: "Michael Brown", category: "Supervisor", classification: "Staff", entity: "Acme Construction", project: "Warehouse Project" },
  { id: "EMP006", name: "Lisa Wilson", category: "Carpenter", classification: "Laborer", entity: "Metro Developers", project: "Main Building Construction" },
  { id: "EMP007", name: "David Lee", category: "Manager", classification: "Staff", entity: "Metro Developers", project: "Warehouse Project" },
  { id: "EMP008", name: "Jennifer Taylor", category: "Electrician", classification: "Laborer", entity: "Skyline Builders", project: "Bridge Expansion" },
  { id: "EMP009", name: "James Anderson", category: "Mason", classification: "Laborer", entity: "Acme Construction", project: "Main Building Construction" },
  { id: "EMP010", name: "Maria Garcia", category: "Site Engineer", classification: "Staff", entity: "Metro Developers", project: "Warehouse Project" },
];

// Updated Excel data with the column structure
const DUMMY_EXCEL_DATA = [
  { 
    id: "101", 
    name: "Ahmed Khan", 
    project: "Project A",
    location: "Downtown Site",
    checkInDate: "2025-05-07",
    checkInTime: "08:00",
    checkOutDate: "2025-05-07",
    checkOutTime: "17:00"
  },
  { 
    id: "102", 
    name: "Ramesh Iyer", 
    project: "Project B",
    location: "Bridge Zone A",
    checkInDate: "2025-05-07",
    checkInTime: "08:30",
    checkOutDate: "2025-05-07",
    checkOutTime: "17:30"
  },
  { 
    id: "103", 
    name: "Sara Al Marzooqi", 
    project: "Project A",
    location: "Site Office",
    checkInDate: "2025-05-07",
    checkInTime: "09:00",
    checkOutDate: "2025-05-07",
    checkOutTime: "18:00"
  },
  { 
    id: "104", 
    name: "John Peterson", 
    project: "Project C",
    location: "Building 7",
    checkInDate: "2025-05-07",
    checkInTime: "07:30",
    checkOutDate: "2025-05-07",
    checkOutTime: "16:30"
  },
  { 
    id: "105", 
    name: "Ali Mohammed", 
    project: "Project B",
    location: "North Tower",
    checkInDate: "2025-05-07",
    checkInTime: "08:15",
    checkOutDate: "2025-05-07",
    checkOutTime: "17:45"
  },
];

// Mock data for filter options
const PROJECTS = ["Main Building Construction", "Bridge Expansion", "Warehouse Project", "Project A", "Project B", "Project C"];
const LOCATIONS = ["Downtown Site", "Bridge Zone A", "Site Office", "Building 7", "North Tower"];

const BulkAttendance = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [project, setProject] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State for import mode
  const [isImportMode, setIsImportMode] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<typeof DUMMY_EXCEL_DATA>([]);
  const [importComment, setImportComment] = useState("");
  
  // State for selection
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Import filters state
  const [importProjectFilter, setImportProjectFilter] = useState<string>("");
  const [importLocationFilter, setImportLocationFilter] = useState<string>("");
  const [importSearchQuery, setImportSearchQuery] = useState<string>("");
  
  // Confirmation dialog states
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showNoSelectionDialog, setShowNoSelectionDialog] = useState(false);

  // Filter imported employees based on import filters
  const filteredImportEmployees = importPreviewData.filter((employee) => {
    if (importProjectFilter && employee.project !== importProjectFilter) return false;
    if (importLocationFilter && employee.location !== importLocationFilter) return false;
    if (importSearchQuery && 
        !employee.name.toLowerCase().includes(importSearchQuery.toLowerCase()) && 
        !employee.id.toLowerCase().includes(importSearchQuery.toLowerCase())) return false;
    return true;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      // If filter is applied, only select filtered employees
      setSelectedEmployees(filteredImportEmployees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle checkbox change
  const handleCheckboxChange = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
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
    setImportLocationFilter("");
    setImportSearchQuery("");
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      
      // In a real app, we would parse the Excel file here
      // For this prototype, we'll use the dummy data
      setImportPreviewData(DUMMY_EXCEL_DATA);
    }
  };
  
  // Open confirmation dialog
  const handleMarkAttendanceClick = () => {
    if (selectedEmployees.length === 0) {
      // Show dialog asking if they want to mark for all employees
      setShowNoSelectionDialog(true);
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
    toast({
      title: "Success!",
      description: `Attendance marked successfully for ${employeeCount} employees.`,
    });
    
    // Reset the interface
    setIsImportMode(false);
    setImportFile(null);
    setImportPreviewData([]);
    setImportComment("");
    setSelectedEmployees([]);
    setSelectAll(false);
    clearImportFilters();
    setShowConfirmationDialog(false);
    setShowNoSelectionDialog(false);
  };
  
  // Generate and download template
  const downloadTemplate = () => {
    // Create a table structure that can be used as a template
    const headers = [
      "Employee ID", 
      "Name", 
      "Project", 
      "Location",
      "Check-In Date",
      "Check-In Time",
      "Check-Out Date",
      "Check-Out Time"
    ];
    
    const sampleRows = [
      ["EMP001", "John Smith", "Main Building Construction", "Downtown Site", "2025-05-07", "08:00", "2025-05-07", "17:00"],
      ["EMP002", "Sarah Johnson", "Bridge Expansion", "Bridge Zone A", "2025-05-07", "08:30", "2025-05-07", "17:30"],
      ["", "", "", "", "", "", "", ""]
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
                <h3 className="text-xl font-medium text-gray-700 mb-2">Upload an Excel file to import attendance data</h3>
                <p className="text-gray-500 mb-6">The file should follow the template format with all required columns.</p>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Label 
                      htmlFor="file-upload" 
                      className="bg-proscape hover:bg-proscape-dark text-white px-6 py-3 rounded cursor-pointer flex items-center gap-2"
                    >
                      <FileUp className="h-5 w-5" />
                      Choose Excel File
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
              <div className="mb-6">
                <Label htmlFor="importComment" className="text-sm font-medium">Comment (applies to all employees)</Label>
                <Textarea 
                  id="importComment"
                  placeholder="Enter comment for all imported attendance records..."
                  value={importComment}
                  onChange={(e) => setImportComment(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              
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
                        <SelectItem value="">All Projects</SelectItem>
                        {PROJECTS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Location Filter */}
                  <div className="space-y-1">
                    <Label htmlFor="import-location" className="text-sm">Location</Label>
                    <Select value={importLocationFilter} onValueChange={setImportLocationFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
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
                          <Checkbox 
                            checked={selectAll} 
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all employees"
                          />
                        </TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Check-In Date</TableHead>
                        <TableHead>Check-In Time</TableHead>
                        <TableHead>Check-Out Date</TableHead>
                        <TableHead>Check-Out Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredImportEmployees.length > 0 ? (
                        filteredImportEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedEmployees.includes(employee.id)}
                                onCheckedChange={() => handleCheckboxChange(employee.id)}
                                aria-label={`Select ${employee.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{employee.id}</TableCell>
                            <TableCell>{employee.name}</TableCell>
                            <TableCell>{employee.project}</TableCell>
                            <TableCell>{employee.location}</TableCell>
                            <TableCell>{employee.checkInDate}</TableCell>
                            <TableCell>{employee.checkInTime}</TableCell>
                            <TableCell>{employee.checkOutDate}</TableCell>
                            <TableCell>{employee.checkOutTime}</TableCell>
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
                    .filter(employee => selectedEmployees.includes(employee.id))
                    .slice(0, 10)
                    .map((employee) => (
                      <li key={employee.id} className="flex items-center gap-2">
                        <span className="font-medium">{employee.id}:</span> {employee.name}
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
              <DialogDescription>
                No employees selected. Do you want to mark attendance for all {filteredImportEmployees.length} imported employees?
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="flex sm:justify-between gap-2">
              <Button variant="outline" onClick={() => setShowNoSelectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAttendance}
                className="bg-proscape hover:bg-proscape-dark text-white"
              >
                Yes, Mark All
              </Button>
            </DialogFooter>
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
            <div className="space-y-2">
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
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
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
            <h3 className="text-xl font-medium text-gray-700 mb-2">Import an Excel file to mark attendance</h3>
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
                <FileUp className="h-4 w-4" /> Import Excel File
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BulkAttendance;
