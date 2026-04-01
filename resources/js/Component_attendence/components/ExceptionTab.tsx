import React, { useState, useEffect } from "react";
import { Edit, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import ManualCheckOutDialog from "./dialogs/ManualCheckOutDialog";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { isSameDay } from "@/lib/utils";

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  project: string;
  projectId: number;
  location?: string;
  locationId?: number;
  checkInTime: string;
  imageUrl: string;
  classification: string;
  category: string;
  status: "Active" | "Inactive";
  entity?: string;
  exceptionReason?: string;
  exceptionResolved?: boolean;
  exceptionResolvedDate?: Date; // Added to track when exception was resolved
}

interface ExceptionTabProps {
  searchQuery: string;
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

const ExceptionTab = ({
  searchQuery,
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
}: ExceptionTabProps) => {
  const [openManualDialog, setOpenManualDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pendingExceptions, setPendingExceptions] = useState<Employee[]>([]);

  // Effect to refresh exception data when date changes
  useEffect(() => {
    // In a real app, this would fetch data for the specific date from an API
    fetchPendingExceptions();
  }, [selectedDate]);
  
  // Mock function to fetch employees with pending exceptions for the selected date
  const fetchPendingExceptions = () => {
    // Mock employees with pending checkouts
    const mockPendingCheckouts: Employee[] = [
      {
        id: 8,
        employeeId: "10008",
        name: "Thomas Harris",
        role: "Construction Worker",
        project: "Main Building Construction",
        projectId: 1,
        location: "Site A",
        locationId: 1,
        checkInTime: "08:15 AM",
        imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
        classification: "Laborer",
        category: "Carpenter",
        status: "Active",
        exceptionReason: "No checkout recorded for yesterday"
      },
      {
        id: 9,
        employeeId: "10009",
        name: "Jennifer White",
        role: "Electrician",
        project: "Bridge Expansion Project",
        projectId: 2,
        location: "Site B",
        locationId: 2,
        checkInTime: "09:00 AM",
        imageUrl: "https://randomuser.me/api/portraits/women/5.jpg",
        classification: "Staff",
        category: "Electrician",
        status: "Inactive",
        exceptionReason: "No checkout recorded for yesterday"
      },
      // Additional employees with exceptions
      {
        id: 14,
        employeeId: "10014",
        name: "Fatima Al-Qahtani",
        role: "Project Engineer",
        project: "Marina Towers",
        projectId: 5,
        checkInTime: "07:30 AM",
        imageUrl: "https://randomuser.me/api/portraits/women/8.jpg",
        classification: "Staff",
        category: "Mason",
        status: "Active",
        entity: "Tanseeq Engineering Co",
        exceptionReason: "No checkout recorded for yesterday"
      },
      {
        id: 15,
        employeeId: "10015",
        name: "Carlos Rodriguez",
        role: "Foreman",
        project: "Dubai Mall Expansion",
        projectId: 4,
        checkInTime: "06:45 AM",
        imageUrl: "https://randomuser.me/api/portraits/men/9.jpg",
        classification: "Laborer",
        category: "Carpenter",
        status: "Active",
        entity: "Tanseeq Construction Ltd",
        exceptionReason: "No checkout recorded for yesterday"
      },
      {
        id: 16,
        employeeId: "10016",
        name: "Aisha Mohammed",
        role: "Safety Manager",
        project: "Highway Renovation",
        projectId: 3,
        checkInTime: "08:05 AM",
        imageUrl: "https://randomuser.me/api/portraits/women/9.jpg",
        classification: "Staff",
        category: "Plumber",
        status: "Active",
        entity: "Tanseeq Engineering Co",
        exceptionReason: "GPS not detected during check-in"
      },
      {
        id: 17,
        employeeId: "10017",
        name: "John Peterson",
        role: "Electrician",
        project: "Marina Towers",
        projectId: 5,
        checkInTime: "07:50 AM",
        imageUrl: "https://randomuser.me/api/portraits/men/10.jpg",
        classification: "Laborer",
        category: "Electrician",
        status: "Active",
        entity: "Tanseeq Landscaping LLC",
        exceptionReason: "Manually checked in outside of geofence"
      }
    ];
    
    // Update exception status based on the selected date
    setPendingExceptions(mockPendingCheckouts.map(employee => {
      // Check if exception has already been resolved for this date
      const isResolved = employee.exceptionResolvedDate ? 
        isSameDay(employee.exceptionResolvedDate, selectedDate) : false;
        
      return {
        ...employee,
        exceptionResolved: isResolved,
        exceptionResolvedDate: isResolved ? employee.exceptionResolvedDate : undefined
      };
    }));
  };

  // Filter employees based on search query and filters
  const filteredPendingCheckouts = pendingExceptions.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         employee.employeeId.includes(searchQuery);
    const matchesProject = selectedProject === "all" || employee.projectId.toString() === selectedProject;
    const matchesLocation = selectedLocation === "all" || 
                          (employee.locationId && employee.locationId.toString() === selectedLocation);
    const matchesClassification = selectedClassification === "all" || employee.classification === selectedClassification;
    const matchesCategory = selectedCategory === "all" || employee.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    const matchesEntity = selectedEntity === "all" || employee.entity === getEntityName(selectedEntity);
    
    return matchesSearch && matchesProject && (matchesLocation || !employee.locationId) && 
           matchesClassification && matchesCategory && matchesStatus && matchesEntity;
  });

  // Helper function to get entity name from entity ID - Fix the TypeScript error
  const getEntityName = (entityId: string) => {
    if (entityId === "all") return "";
    
    // These would typically come from your entities array prop
    const entityMap: Record<string, string> = {
      "1": "Tanseeq Landscaping LLC",
      "2": "Tanseeq Construction Ltd",
      "3": "Tanseeq Engineering Co"
    };
    
    return entityMap[entityId] || "";
  };

  const handleManualCheckOut = (employee: Employee) => {    
    // Check if exception has already been resolved for this date
    if (employee.exceptionResolved && employee.exceptionResolvedDate && 
        isSameDay(employee.exceptionResolvedDate, selectedDate)) {
      toast.error("Exception already resolved", {
        description: `${employee.name}'s exception has already been resolved for ${format(selectedDate, "PPP")}.`
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
    
    toast.success(`${selectedEmployee?.name} exception has been resolved`, {
      description: `Project: ${selectedProjectName}, Time: ${time}, Date: ${format(selectedDate, "PPP")}`
    });
    
    // Update state to reflect the exception resolution
    if (selectedEmployee) {
      setPendingExceptions(current => 
        current.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, exceptionResolved: true, exceptionResolvedDate: selectedDate }
            : emp
        )
      );
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
            {filteredPendingCheckouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  No pending exceptions found matching your filters for {format(selectedDate, "PPP")}
                </TableCell>
              </TableRow>
            ) : (
              filteredPendingCheckouts.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <img src={employee.imageUrl} alt={employee.name} />
                      </Avatar>
                      <div>{employee.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.classification}</TableCell>
                  <TableCell>{employee.category}</TableCell>
                  <TableCell>{employee.checkInTime}</TableCell>
                  <TableCell>{employee.project}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        onClick={() => handleManualCheckOut(employee)} 
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 text-xs"
                        disabled={employee.exceptionResolved}
                      >
                        <Edit className="h-3 w-3" />
                        <span>Mark Attendance</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Manual Check Out Dialog */}
      <ManualCheckOutDialog
        open={openManualDialog}
        onOpenChange={setOpenManualDialog}
        employee={selectedEmployee}
        projects={projects}
        onComplete={handleManualCheckOutComplete}
      />
    </div>
  );
};

export default ExceptionTab;
