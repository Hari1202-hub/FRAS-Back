import React, { useState, useEffect } from "react";
import { Edit, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage  } from "@/components/ui/avatar";
import ManualCheckOutDialog from "./dialogs/ManualCheckOutDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { isSameDay } from "@/lib/utils";
import { User } from "lucide-react";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  project: string;
  projectId: number;
  location: string;
  locationId: number;
  checkInTime: string;
  imageUrl: string;
  classification: string;
  category: string;
  status: "Active" | "Inactive";
  entity?: string;
  checkedOutDate?: Date; // Added to track when employee was checked out
}

interface CheckOutTabProps {
  searchQuery: string;
  searchId:string,
  selectedProject: string;
  selectedLocation?: string;
  selectedClassification: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedEntity: string;
  projects: { id: number; name: string; location?: string; coordinates?: { geofenceData: string } }[];
  locations: { id: number; name: string }[];
  selectedDate: Date;
  dateSelected?: boolean;
}

const CheckOutTab = ({
  searchQuery,
  searchId,
  selectedProject,
  selectedLocation = "all",
  selectedClassification,
  selectedCategory,
  selectedStatus,
  selectedEntity,
  projects,
  locations,
  selectedDate,
  dateSelected = true // Default to true since we're auto-selecting today
}: CheckOutTabProps) => {
  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [checkedInEmployees, setCheckedInEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastpage, setLastPage] = useState(1);

  const [totalPage,setTotalPage] = useState(1);

  const itemsPerPage = 100;
  
  // Effect to refresh employee data when date changes
  useEffect(() => {
    // In a real app, this would fetch data for the specific date from an API
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
    axios.post(BASEURL+'get_checked_out',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let employees = response.data.data.employees;
        setCheckedInEmployees(employees);
        setTotalPage(response.data.data.total_count);
        setLastPage(response.data.data.last_page);
       
    })
  }
  
  // Mock function to fetch checked-in employees for the selected date
 

  const filteredEmployees = checkedInEmployees.filter(employee => {
    console.log(searchQuery);
    const matchesSearch = employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ;
    const matchesSearchid = employee?.name.toLowerCase().includes(searchId.toLowerCase());
    //const matchesProject = selectedProject === "all" || employee?.project.guid.toString() === selectedProject;
    const matchesClassification = selectedClassification === "all" || employee?.classifications.code === selectedClassification;
    const matchesCategory = selectedCategory === "all" || employee?.categories.code === selectedCategory;
    //const matchesStatus = selectedStatus === "all" || employee?.status === selectedStatus;
    const matchesEntity = selectedEntity === "all" || employee?.entities.id === selectedEntity;
    
    return matchesSearch   &&  matchesSearchid &&
           matchesClassification && matchesCategory  && matchesEntity;
  });


  const handleManualCheckOut = (employee: Employee) => {    
    // Check if employee already has been checked out for this date
    if (employee.checkedOutDate && isSameDay(employee.checkedOutDate, selectedDate)) {
      
      toast.error("Duplicate attendance", {
        description: `${employee.name} already has checkout marked for ${format(selectedDate, "PPP")}.`
      });
      return;
    }
    
    setSelectedEmployee(employee);
    setOpenManualDialog(true);
  };

  const handleManualCheckOutComplete = (
    projectId: string, 
    time: string,
    reason: string
  ) => {
    setOpenManualDialog(false);
    
    const selectedProjectName = projects.find(p => p.id.toString() === projectId)?.name;
    
    toast.success(`${selectedEmployee?.name} has been manually checked out`, {
      description: `Project: ${selectedProjectName}, Time: ${time}, Date: ${format(selectedDate, "PPP")}`
    });
    
    // Update our state to reflect the checkout
    if (selectedEmployee) {
      /* setCheckedInEmployees(current => 
        current.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, checkedOutDate: selectedDate }
            : emp
        )
      ); */
    }
    
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Employee ID</TableHead>
              <TableHead className="w-[170px]">Employee Name</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Check-in Time</TableHead>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No checked-in employees found matching your filters for {format(selectedDate, "PPP")}
                </TableCell>
              </TableRow>
            ) : (
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
                  <TableCell>{employee.classifications.description}</TableCell>
                  <TableCell>{employee.categories.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-gray-600">
                      <UserCheck className="h-4 w-4 mr-1 text-green-600" />
                      <span>{employee.check_in_status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee?.project?.projectname}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleManualCheckOut(employee)} 
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 text-xs"
                      disabled={employee.checkedOutDate && isSameDay(employee.checkedOutDate, selectedDate)}
                    >
                      <Edit className="h-3 w-3" />
                      <span>Mark Attendance</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      {/* Manual Check Out Dialog */}
      <ManualCheckOutDialog
        open={openManualDialog}
        selectedDate={selectedDate}
        onOpenChange={setOpenManualDialog}
        employee={selectedEmployee}
        projects={projects}
        onComplete={handleManualCheckOutComplete}
      />
    </div>
  );
};

export default CheckOutTab;
