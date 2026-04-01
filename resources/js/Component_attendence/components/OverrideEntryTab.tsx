import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockAttendanceRecords } from "./ManualAttendanceTable";
import { OverrideEntryModal } from "./dialogs/OverrideEntryModal";
import { format } from "date-fns";

interface OverrideEntryTabProps {
  searchQuery: string;
  selectedProject: string;
  selectedClassification: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedEntity: string;
  projects: { id: number; name: string }[];
  selectedDate: Date;
  dateSelected: boolean;
}

const OverrideEntryTab = ({
  searchQuery,
  selectedProject,
  selectedClassification,
  selectedCategory,
  selectedStatus,
  selectedEntity,
  projects,
  selectedDate,
  dateSelected,
}: OverrideEntryTabProps) => {
  // Local state for employee search filtering
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<typeof mockAttendanceRecords[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter employees based on the filter criteria
  const filteredEmployees = mockAttendanceRecords.filter(employee => {
    const matchesSearch = employeeFilter 
      ? employee.employeeName.toLowerCase().includes(employeeFilter.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(employeeFilter.toLowerCase())
      : true;
      
    const matchesProject = selectedProject !== "all" 
      ? employee.checkInProject.includes(selectedProject)
      : true;
      
    const matchesClassification = selectedClassification !== "all"
      ? employee.classification === selectedClassification
      : true;
      
    const matchesCategory = selectedCategory !== "all"
      ? employee.category === selectedCategory
      : true;
      
    const matchesStatus = selectedStatus !== "all"
      ? employee.status === selectedStatus
      : true;
      
    const matchesEntity = selectedEntity !== "all"
      ? employee.entity === selectedEntity
      : true;
    
    return matchesSearch && matchesProject && matchesClassification && 
           matchesCategory && matchesStatus && matchesEntity;
  });
  
  const handleOpenModal = (employee: typeof mockAttendanceRecords[0]) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };
  
  return (
    <div className="space-y-4">
      {!dateSelected ? (
        <div className="p-8 text-center">
          <p className="text-lg text-gray-500">Please select a date to continue.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Override Entry - {format(selectedDate, "MMMM dd, yyyy")}</h3>
            <div className="w-1/3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by employee ID or name"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell className="font-medium">{employee.employeeName}</TableCell>
                      <TableCell>{employee.classification}</TableCell>
                      <TableCell>{employee.category}</TableCell>
                      <TableCell>{employee.entity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          employee.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenModal(employee)}
                        >
                          Override
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No employees found matching the filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {selectedEmployee && (
            <OverrideEntryModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              employee={selectedEmployee}
              date={selectedDate}
              projects={projects}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OverrideEntryTab;
