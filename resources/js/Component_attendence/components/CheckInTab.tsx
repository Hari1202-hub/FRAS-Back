import React, { useState, useEffect } from "react";
import { Edit, UserCheck, UserX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ManualCheckInDialog from "./dialogs/ManualCheckInDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { isSameDay } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "lucide-react";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  role: string;
  project?: string;
  projectId?: number;
  location?: string;
  locationId?: number;
  status: "checkedin" | "notcheckedin";
  imageUrl: string;
  checkedInProject?: string;
  classification: string;
  category: string;
  activeStatus: "Active" | "Inactive";
  entity?: string;
  attendanceDate?: Date; // Added to track the date of attendance
}

interface CheckInTabProps {
  searchQuery: string;
  searchId: string;
  selectedProject: string;
  selectedStatus: string;
  selectedClassification: string;
  selectedCategory: string;
  selectedEntity: string;
  projects: { id: number; name: string; location?: string; coordinates?: { geofenceData: string } }[];
  locations: { id: number; name: string }[];
  selectedDate: Date; // Now required
  dateSelected?: boolean; // New prop to indicate if date has been explicitly selected
}

const CheckInTab = ({ 
  searchQuery,
  searchId,
  selectedProject,
  selectedStatus,
  selectedClassification,
  selectedCategory,
  selectedEntity,
  projects,
  locations,
  selectedDate,
  dateSelected = true // Default to true since we're auto-selecting today
}: CheckInTabProps) => {
  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastpage, setLastPage] = useState(1);

  const [totalPage,setTotalPage] = useState(1);

  const itemsPerPage = 100;
  // Effect to check if selected project has a location and update warning state
  useEffect(() => {
    if (selectedProject !== "all") {
      const projectHasLocation = projects.find(p => p.id.toString() === selectedProject)?.location;
      setShowLocationWarning(!projectHasLocation);
    } else {
      setShowLocationWarning(false); // Hide warning when "all projects" is selected
    }
  }, [selectedProject, projects]);

  // Effect to refresh employee data when the date changes
  useEffect(() => {
    // Here you would typically fetch data for the selected date
    // For now, we'll use mock data
    loadEmployees(selectedDate,currentPage);
  }, [selectedDate,currentPage,searchQuery,searchId,selectedClassification,selectedCategory,selectedEntity]);
  
  

  const loadEmployees = (date,currentPage) =>{
    const postData = new FormData();
    postData.append('page', currentPage);
   // postData.append('length', itemsPerPage);
    postData.append('date', format(new Date(date), 'yyyy-MMM-dd'));
    postData.append('name', searchQuery);
    postData.append('emp_id', searchId);
    postData.append('classification', selectedClassification);
    postData.append('category', selectedCategory);
    postData.append('entity', selectedEntity);
    axios.post(BASEURL+'get_checked_in',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let employees = response.data.data.employees;
       
        setEmployees(employees);
        setTotalPage(response.data.data.total_count);
        setLastPage(response.data.data.last_page);
    })
  }

  // Filter employees based on search query and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearchid = employee?.name.toLowerCase().includes(searchId.toLowerCase());
    //const matchesProject = selectedProject === "all" || employee?.project.guid.toString() === selectedProject;
    const matchesClassification = selectedClassification === "all" || employee?.classifications.code === selectedClassification;
    const matchesCategory = selectedCategory === "all" || employee?.categories.code === selectedCategory;
    //const matchesStatus = selectedStatus === "all" || employee?.status === selectedStatus;
    const matchesEntity = selectedEntity === "all" || employee?.entities.id === selectedEntity;
    
    return matchesSearch   && matchesSearchid &&
           matchesClassification && matchesCategory  && matchesEntity;
  });

  // Helper function to get entity name from entity ID
  const getEntityName = (entityId: string) => {
    if (entityId === "all") return "";
    
    // These would typically come from your entities array prop
    const entityMap = {
      "1": "Tanseeq Landscaping LLC",
      "2": "Tanseeq Construction Ltd",
      "3": "Tanseeq Engineering Co"
    };
    
    return entityMap[entityId as keyof typeof entityMap] || "";
  };

  const handleManualCheckIn = (employee: Employee) => {
    if (!dateSelected) {
      toast.error("Date selection required", {
        description: "Please select an attendance date before marking attendance."
      });
      return;
    }
    
    // Check if employee already has attendance for this date
    if (employee.attendanceDate && isSameDay(employee.attendanceDate, selectedDate)) {
      toast.error("Duplicate attendance", {
        description: `${employee.name} already has attendance marked for ${format(selectedDate, "PPP")}.`
      });
      return;
    }
    
    setSelectedEmployee(employee);
    setOpenManualDialog(true);
  };

  const handleManualCheckInComplete = (
    projectId: string, 
    locationId: string, 
    time: string,
    reason: string
  ) => {
    setOpenManualDialog(false);
    
    const selectedProjectName = projects.find(p => p.id.toString() === projectId)?.name;
    const selectedLocationName = locations.find(l => l.id.toString() === locationId)?.name || "No location defined";
    
    // Handle auto check-out logic if employee was checked into another project
    if (selectedEmployee?.status === "checkedin" && selectedEmployee.checkedInProject) {
      toast.info(`${selectedEmployee.name} has been automatically checked out from ${selectedEmployee.checkedInProject}`, {
        description: `Auto checked-out at ${time}`
      });
    }
    
    toast.success(`${selectedEmployee?.name} has been manually checked in`, {
      description: `Project: ${selectedProjectName}, Date: ${format(selectedDate, "PPP")}`
    });
    
    // Update the employee's attendance record in our state
    if (selectedEmployee) {
      setEmployees(current => 
        current.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, status: "checkedin", attendanceDate: selectedDate, checkedInProject: selectedProjectName }
            : emp
        )
      );
    }
    
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-4">
      {showLocationWarning && (
        <Alert className="bg-white border border-gray-200 mb-4">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-gray-500 italic">
            No location defined – attendance will proceed without GPS verification
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Employee ID</TableHead>
              <TableHead className="w-[170px]">Employee Name</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Check-In Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.user.emp_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {employee.image && employee.image !== '' ? (
                         <img src={employee.image} className="h-20 w-20 rounded-full object-cover"/>
                      ):(
                        <Avatar className="h-20 w-20">
                          <AvatarImage src="" alt={employee.name} />
                          <AvatarFallback className="text-2xl bg-gray-200">
                            <User size={40} className="text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>{employee.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.entities.entityname}</TableCell>
                  <TableCell>{employee.classifications.description}</TableCell>
                  <TableCell>{employee.categories.description}</TableCell>
                  <TableCell>
                    {employee.check_in_status === "checkedin" ? (
                      <div className="flex items-center text-green-600">
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span>Checked In</span>
                        {employee.checkedInProject && (
                          <span className="ml-1 text-xs text-gray-500">({employee.checkedInProject})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <UserX className="h-4 w-4 mr-1" />
                        <span>Not Checked In</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleManualCheckIn(employee)} 
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 text-xs"
                      disabled={employee.attendanceDate && isSameDay(employee.attendanceDate, selectedDate)}
                    >
                      <Edit className="h-3 w-3" />
                      <span>Mark Attendance</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No employees found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        
      </div>
       <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage-1)*itemsPerPage)+1} - {((currentPage-1)*itemsPerPage)+100}</span> of{" "}
            <span className="font-medium">{totalPage}</span> employees
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPage))} disabled={ currentPage === lastpage}>
              Next 
            </button>
          </div>
        </div>

      {/* Manual Check In Dialog */}
      <ManualCheckInDialog
        open={openManualDialog}
        onOpenChange={setOpenManualDialog}
        employee={selectedEmployee}
        selectedDate={selectedDate}
        projects={projects}
        locations={locations}
        onComplete={handleManualCheckInComplete}
      />
    </div>
  );
};

export default CheckInTab;
