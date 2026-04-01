import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, Search, Filter, UserCog, KeyRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { ResetPasswordDialog } from "@/components/role-mapping/ResetPasswordDialog";
import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";
import { MultiRoleUpdateDialog } from "@/components/role-mapping/MultiRoleUpdateDialog";

// Sample entities for dummy data
const entities = [
  "Tanseeq Investment",
  "Tanseeq Landscaping LLC",
  "Al Maha Projects",
  "Zenith Infrastructure",
  "Gulf Builders International"
];

// Sample categories with the new predefined values
const categories = [
  "Carpenter",
  "Mason",
  "Plumber",
  "Electrician",
  "Welder",
  "Steel Fixer", 
  "Painter",
  "Helper",
  "Driver",
  "Supervisor"
];

// Sample classifications
const classifications = ["Laborer", "Staff"];

// Available roles from Role Master
const availableRoles = [
  "Labour",
  "Supervisor", 
  "Super Admin",
  "Report Admin",
  "Staff",
  "Medical Officer",
  "Camp Boss",
  "United Emirates Officer"
];

// Mock data for assigned employees (employees with roles)
const initialEmployees = [
  { 
    id: 1, 
    name: "Ibrahim Al-Mazrouei", 
    employeeId: "EMP001", 
    assignedRoles: ["Supervisor"], 
    category: "Supervisor",
    classification: "Staff",
    entity: "Tanseeq Investment",
    contactNumber: "+971 50 123 4567",
    email: "ibrahim.almazrouei@tanseeq.ae",
    loginMethod: "Employee ID",
    status: "Active" 
  },
  { 
    id: 2, 
    name: "Fatima Al-Hashimi", 
    employeeId: "EMP002", 
    assignedRoles: ["Super Admin", "Report Admin"], 
    category: "Supervisor",
    classification: "Staff",
    entity: "Tanseeq Landscaping LLC",
    contactNumber: "+971 52 234 5678",
    email: "fatima.alhashimi@tanseeq.ae",
    loginMethod: "Email ID",
    status: "Active" 
  },
  { 
    id: 3, 
    name: "Mohammed Al-Farsi", 
    employeeId: "EMP003", 
    assignedRoles: ["Medical Officer"], 
    category: "Manager",
    classification: "Staff",
    entity: "Al Maha Projects",
    contactNumber: "+971 55 345 6789",
    email: "mohammed.alfarsi@almaha.ae",
    loginMethod: "Employee ID",
    status: "Active" 
  },
  { 
    id: 4, 
    name: "Aisha Al-Blooshi", 
    employeeId: "EMP004", 
    assignedRoles: ["Camp Boss", "Supervisor"], 
    category: "Manager",
    classification: "Staff",
    entity: "Gulf Builders International",
    contactNumber: "+971 54 456 7890",
    email: "aisha.alblooshi@gulfbuilders.ae",
    loginMethod: "Email ID",
    status: "Active" 
  },
  { 
    id: 5, 
    name: "Yusuf Al-Qasimi", 
    employeeId: "EMP005", 
    assignedRoles: ["United Emirates Officer"], 
    category: "Engineer",
    classification: "Staff",
    entity: "Zenith Infrastructure",
    contactNumber: "+971 56 567 8901",
    email: "yusuf.alqasimi@zenith.ae",
    loginMethod: "Email ID",
    status: "Active" 
  },
  { 
    id: 7, 
    name: "Khalid Al-Mansoori", 
    employeeId: "EMP007", 
    assignedRoles: ["Super Admin"], 
    category: "Manager",
    classification: "Staff",
    entity: "Tanseeq Landscaping LLC",
    contactNumber: "+971 52 789 0123",
    email: "khalid.almansoori@tanseeq.ae",
    loginMethod: "Employee ID",
    status: "Active" 
  }
];

const AssignedEmployees = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);
  const [removeRoleDialogOpen, setRemoveRoleDialogOpen] = useState(false);
  const [employeeToRemoveRole, setEmployeeToRemoveRole] = useState(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [employeeForPasswordReset, setEmployeeForPasswordReset] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Get unique list of roles from all assigned employees
  const roles = Array.from(
    new Set(employees.flatMap(emp => emp.assignedRoles || []))
  ).filter(Boolean);

  // Filter to show only employees with assigned roles
  const filteredEmployees = employees.filter((employee) => {
    // First check if employee has roles assigned
    const hasRoles = employee.assignedRoles && employee.assignedRoles.length > 0;
    
    if (!hasRoles) return false;
    
    const searchMatch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch =
      roleFilter === "all" ||
      (employee.assignedRoles && employee.assignedRoles.includes(roleFilter));
    const statusMatch = 
      statusFilter === "all" || 
      employee.status.toLowerCase() === statusFilter.toLowerCase();
    const entityMatch = 
      entityFilter === "all" || 
      employee.entity === entityFilter;
    const classificationMatch = 
      classificationFilter === "all" || 
      employee.classification === classificationFilter;

    return searchMatch && roleMatch && statusMatch && entityMatch && classificationMatch;
  });

  const handleEmployeeView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleUpdateRoles = (employee) => {
    setSelectedEmployee(employee);
    setUpdateRoleDialogOpen(true);
  };
  
  const handleResetPassword = (employee) => {
    setEmployeeForPasswordReset(employee);
    setResetPasswordDialogOpen(true);
  };

  const handleRolesAssigned = (roles: string[]) => {
    if (!selectedEmployee) return;
    
    // If no roles assigned, employee should be moved to unassigned
    if (!roles || roles.length === 0) {
      toast({
        title: "Roles Removed",
        description: `${selectedEmployee.name} will be moved to Unassigned Employees.`,
      });
    }
    
    // Update employee roles
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? {...emp, assignedRoles: roles} 
        : emp
    );
    
    setEmployees(updatedEmployees);
    
    toast({
      title: "Roles Updated",
      description: `${selectedEmployee.name}'s roles have been updated.`,
    });
  };

  const openRemoveRoleDialog = (employee) => {
    setEmployeeToRemoveRole(employee);
    setRemoveRoleDialogOpen(true);
  };

  const handleRemoveAllRoles = () => {
    if (!employeeToRemoveRole) return;
    
    // Remove employee from assigned employees list
    const updatedEmployees = employees.filter(emp => emp.id !== employeeToRemoveRole.id);
    setEmployees(updatedEmployees);
    
    toast({
      title: "All Roles Removed",
      description: `${employeeToRemoveRole.name} has been removed from Assigned Employees.`,
    });
    
    setRemoveRoleDialogOpen(false);
  };

  const handlePasswordReset = () => {
   /*  toast({
      title: "Success",
      description: `Password reset process completed for employee.`,
    }); */
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Assigned Employees</h1>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
              placeholder="Search by name or employee ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 mr-2">Role:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Status:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Entity:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <option value="all">All Entities</option>
                {entities.map((entity, index) => (
                  <option key={index} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Classification:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
              >
                <option value="all">All Classifications</option>
                {classifications.map((classification, index) => (
                  <option key={index} value={classification}>{classification}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Assigned Roles</TableHead>
                <TableHead>Login Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={employee.entity}>
                      {employee.entity}
                    </TableCell>
                    <TableCell>{employee.classification}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.assignedRoles && employee.assignedRoles.map((role, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.loginMethod ? employee.loginMethod : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          employee.status === "Active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleUpdateRoles(employee)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                              >
                                <UserCog className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update Roles</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleResetPassword(employee)}
                                className="text-orange-500 hover:text-orange-700 p-1"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reset Password</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleEmployeeView(employee)}
                                className="text-blue-500 hover:text-blue-700 p-1"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Employee Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    No assigned employees found matching the search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredEmployees.length}</span> of{" "}
            <span className="font-medium">{employees.length}</span> employees
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </Card>

      <MultiRoleUpdateDialog
        open={updateRoleDialogOpen}
        onOpenChange={setUpdateRoleDialogOpen}
        employee={selectedEmployee}
        availableRoles={availableRoles}
        onUpdateRoles={handleRolesAssigned}
        onRemoveAllRoles={() => openRemoveRoleDialog(selectedEmployee)}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        employee={employeeForPasswordReset}
        onPasswordReset={handlePasswordReset}
      />
      
      <AlertDialog open={removeRoleDialogOpen} onOpenChange={setRemoveRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role from {employeeToRemoveRole?.name} (Employee ID: {employeeToRemoveRole?.employeeId})? 
              They will be moved to Unassigned Employees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAllRoles} className="bg-red-500 hover:bg-red-600">
              Remove All Roles
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <EmployeeDetailModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default AssignedEmployees;
