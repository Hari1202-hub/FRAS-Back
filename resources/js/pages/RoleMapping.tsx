
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { RoleMappingFilters } from "@/components/role-mapping/RoleMappingFilters";
import { RoleAssignDialog } from "@/components/role-mapping/RoleAssignDialog";
import { AssignRoleDialog } from "@/components/role-mapping/AssignRoleDialog";
import { SetLoginCredentialsDialog } from "@/components/role-mapping/SetLoginCredentialsDialog";
import { BulkLoginCredentialsDialog } from "@/components/role-mapping/BulkLoginCredentialsDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, CheckCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { autoAssignRoleByClassification, isRoleMappingVisibleRole, roleMappingVisibleRoles } from "@/utils/roleUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Mock users to simulate Users submenu
const mockUsers = [
  { id: 1, name: "Sarah Johnson", employeeId: "EMP002", role: "Supervisor", email: "sarah.johnson@example.com", loginMethod: "Email/Password" },
];

// Updated mock employees with authentic Muslim names
const mockEmployees = [
  { id: 1, name: "Ahmed Al-Rashid", employeeId: "EMP001", location: "Site A", project: "Al Noor Tower", entity: "Tanseeq Investment", category: "Carpenter", classification: "Laborer", currentRole: "Labour", email: "ahmed.rashid@example.com" },
  { id: 2, name: "Mohammed Al-Zahra", employeeId: "EMP002", location: "Site B", project: "Marina Bay", entity: "Tanseeq Landscaping LLC", category: "Manager", classification: "Staff", currentRole: "Staff", email: "mohammed.zahra@example.com" },
  { id: 3, name: "Omar Hassan", employeeId: "EMP003", location: "Site A", project: "Business Bay", entity: "Gulf Builders International", category: "Electrician", classification: "Laborer", currentRole: "Labour", email: "omar.hassan@example.com" },
  { id: 4, name: "Abdullah Al-Mansouri", employeeId: "EMP004", location: "Site C", project: "Downtown Plaza", entity: "Al Maha Projects", category: "Plumber", classification: "Laborer", currentRole: "Labour", email: "abdullah.mansouri@example.com" },
  { id: 5, name: "Khalid Al-Shamsi", employeeId: "EMP005", location: "Site B", project: "Dubai Hills", entity: "Tanseeq Landscaping LLC", category: "Supervisor", classification: "Staff", currentRole: "Staff", email: "khalid.shamsi@example.com" },
  { id: 6, name: "Rashid Al-Maktoum", employeeId: "EMP006", location: "Site D", project: "Jumeirah Park", entity: "Tanseeq Investment", category: "Foreman", classification: "Laborer", currentRole: "Labour", email: "rashid.maktoum@example.com" },
  { id: 7, name: "Hassan Al-Qasimi", employeeId: "EMP007", location: "Site C", project: "Emirates Hills", entity: "Gulf Builders International", category: "Mason", classification: "Laborer", currentRole: "Labour", email: "hassan.qasimi@example.com" },
  { id: 8, name: "Saif Al-Nuaimi", employeeId: "EMP008", location: "Site A", project: "Palm Jumeirah", entity: "Al Maha Projects", category: "Welder", classification: "Laborer", currentRole: "Labour", email: "saif.nuaimi@example.com" },
  { id: 9, name: "Yousef Al-Falasi", employeeId: "EMP009", location: "Site B", project: "Creek Harbor", entity: "Tanseeq Investment", category: "Technician", classification: "Staff", currentRole: "Staff", email: "yousef.falasi@example.com" },
  { id: 10, name: "Hamad Al-Thani", employeeId: "EMP010", location: "Site D", project: "City Walk", entity: "Tanseeq Landscaping LLC", category: "Engineer", classification: "Staff", currentRole: "Staff", email: "hamad.thani@example.com" },
];

// Updated roles to include new role types
const mockRoles = [
  { id: 1, name: "Labour" },
  { id: 2, name: "Staff" },
  { id: 3, name: "Super Admin" },
  { id: 4, name: "Report Admin" },
  { id: 5, name: "Supervisor" },
  { id: 6, name: "Medical Officer" },
  { id: 7, name: "Camp Boss" },
  { id: 8, name: "United Emirates Officer" },
];

const RoleMapping = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);
  
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [employeeForCredentials, setEmployeeForCredentials] = useState(null);
  
  const [bulkCredentialsDialogOpen, setBulkCredentialsDialogOpen] = useState(false);
  const [employeesForBulkCredentials, setEmployeesForBulkCredentials] = useState([]);
  
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [bulkRoleToAssign, setBulkRoleToAssign] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  
  // User state to simulate the Users submenu
  const [users, setUsers] = useState(mockUsers);
  
  // Filtered employee list to only include employees with Staff or Labour roles
  const [filteredMockEmployees, setFilteredMockEmployees] = useState(mockEmployees);

  useEffect(() => {
    // Auto-assign roles based on classification
    mockEmployees.forEach(employee => {
      if (!employee.currentRole) {
        const autoAssignedRole = autoAssignRoleByClassification(employee);
        
        if (autoAssignedRole && autoAssignedRole !== employee.currentRole) {
          employee.currentRole = autoAssignedRole;
          
          console.log(`Auto-assigned role '${autoAssignedRole}' to ${employee.name} based on classification '${employee.classification}'`);
        }
      }
    });

    // Filter employees to only include those with Staff or Labour roles or no role
    const filtered = mockEmployees.filter(emp => isRoleMappingVisibleRole(emp.currentRole));
    setFilteredMockEmployees(filtered);
  }, []);

  const entities = Array.from(new Set(filteredMockEmployees.map(emp => emp.entity)));
  const classifications = Array.from(new Set(filteredMockEmployees.map(emp => emp.classification)));
  const categories = Array.from(new Set(filteredMockEmployees.map(emp => emp.category)));

  const filteredEmployees = filteredMockEmployees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.currentRole === roleFilter;
    const matchesEntity = entityFilter === "all" || employee.entity === entityFilter;
    const matchesClassification = classificationFilter === "all" || employee.classification === classificationFilter;
    const matchesCategory = categoryFilter === "all" || employee.category === categoryFilter;
    
    return matchesSearch && matchesRole && matchesEntity && matchesClassification && matchesCategory;
  });

  const handleAssignRole = (employee) => {
    setSelectedEmployee(employee);
    
    // Check if the employee already has a role to determine which dialog to open
    if (employee.currentRole) {
      setUpdateRoleDialogOpen(true);
    } else {
      setAssignRoleDialogOpen(true);
    }
  };

  const handleRoleAssigned = (role: string) => {
    if (!selectedEmployee) return;
    
    const employeeIndex = mockEmployees.findIndex(emp => emp.id === selectedEmployee.id);
    if (employeeIndex !== -1) {
      const prevRole = mockEmployees[employeeIndex].currentRole;
      mockEmployees[employeeIndex].currentRole = role;
      
      // If the role is not Staff or Labour, move the employee to Users list
      if (!roleMappingVisibleRoles.includes(role)) {
        const existingUserIndex = users.findIndex(user => user.employeeId === selectedEmployee.employeeId);
        
        if (existingUserIndex === -1) {
          // Add to users if not already there
          const newUser = {
            id: selectedEmployee.id,
            name: selectedEmployee.name,
            employeeId: selectedEmployee.employeeId,
            role: role,
            email: selectedEmployee.email,
            entity: selectedEmployee.entity,
            category: selectedEmployee.category,
            classification: selectedEmployee.classification,
            status: "Active",
            loginMethod: null // Will be set in credentials dialog
          };
          
          setUsers(prev => [...prev, newUser]);
          
          toast({
            title: "User Added",
            description: `${selectedEmployee.name} has been added to the Users list with role: ${role}`,
          });

          // Remove from role mapping view
          setFilteredMockEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
        } else {
          // Update existing user
          const updatedUsers = [...users];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            role: role
          };
          setUsers(updatedUsers);
          
          toast({
            title: "User Updated",
            description: `${selectedEmployee.name}'s role has been updated to: ${role}`,
          });

          // Remove from role mapping view
          setFilteredMockEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
        }
      } else {
        // If the previous role was not Staff/Labour but the new one is, check if they exist in users list and update filtered employees
        if (prevRole && !roleMappingVisibleRoles.includes(prevRole)) {
          // Add back to filtered employees
          if (!filteredMockEmployees.some(emp => emp.id === selectedEmployee.id)) {
            setFilteredMockEmployees(prev => [...prev, mockEmployees[employeeIndex]]);
          }
        }
      }
    }
    
    // No longer automatically opening the credentials dialog
    toast({
      title: "Role Updated",
      description: `${selectedEmployee.name}'s role has been updated to ${role}.`,
    });
  };

  const handleRemoveRole = () => {
    if (!selectedEmployee) return;

    mockEmployees.forEach(emp => {
      if (emp.id === selectedEmployee.id) {
        const prevRole = emp.currentRole;
        emp.currentRole = undefined;
        
        // If they were in the users list, remove them
        if (prevRole && !roleMappingVisibleRoles.includes(prevRole)) {
          setUsers(prev => prev.filter(user => user.employeeId !== emp.employeeId));
          
          // Add back to filtered employees if they were removed
          if (!filteredMockEmployees.some(filteredEmp => filteredEmp.id === emp.id)) {
            setFilteredMockEmployees(prev => [...prev, emp]);
          }
          
          toast({
            title: "User Removed",
            description: `${emp.name} has been removed from the Users list as their role was removed`,
          });
        }
      }
    });
    
    const auditLog = {
      employeeId: selectedEmployee.employeeId,
      removedRole: selectedEmployee.currentRole,
      removedBy: "Admin User",
      timestamp: new Date().toISOString(),
    };
    
    console.log("Role removal audit log:", auditLog);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setEntityFilter("all");
    setClassificationFilter("all");
    setCategoryFilter("all");
  };

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allEmployeeIds = filteredEmployees.map(emp => emp.id);
      setSelectedEmployees(allEmployeeIds);
    } else {
      setSelectedEmployees([]);
    }
  };

  const areAllSelected = filteredEmployees.length > 0 && 
    filteredEmployees.every(emp => selectedEmployees.includes(emp.id));

  const handleBulkAssign = () => {
    if (!bulkRoleToAssign) {
      toast({ 
        variant: "destructive",
        title: "Error",
        description: "Please select a role to assign"
      });
      return;
    }

    const hasExistingRoles = selectedEmployees.some(id => {
      const emp = mockEmployees.find(e => e.id === id);
      return emp && emp.currentRole !== undefined;
    });

    if (hasExistingRoles) {
      setOverwriteDialogOpen(true);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const confirmBulkAssignment = () => {
    // Get selected employees before processing
    const selectedEmployeesData = mockEmployees.filter(emp => selectedEmployees.includes(emp.id));
    const movedEmployees = [];
    
    mockEmployees.forEach(emp => {
      if (selectedEmployees.includes(emp.id)) {
        const prevRole = emp.currentRole;
        emp.currentRole = bulkRoleToAssign;
        
        // If role is not Staff or Labour, add to users and track for removal
        if (!roleMappingVisibleRoles.includes(bulkRoleToAssign)) {
          movedEmployees.push(emp.id);
          
          const existingUserIndex = users.findIndex(user => user.employeeId === emp.employeeId);
          
          if (existingUserIndex === -1) {
            // Add to users if not there
            setUsers(prev => [...prev, {
              id: emp.id,
              name: emp.name,
              employeeId: emp.employeeId,
              entity: emp.entity,
              category: emp.category,
              classification: emp.classification,
              status: "Active",
              role: bulkRoleToAssign,
              email: emp.email,
              loginMethod: null
            }]);
          } else {
            // Update role if already in users
            const updatedUsers = [...users];
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              role: bulkRoleToAssign
            };
            setUsers(updatedUsers);
          }
        } 
        // If previous role wasn't Staff/Labour but new role is, add back to filtered list
        else if (prevRole && !roleMappingVisibleRoles.includes(prevRole)) {
          // The employee should remain in the filtered list as they now have Staff/Labour role
          if (!filteredMockEmployees.some(filteredEmp => filteredEmp.id === emp.id)) {
            setFilteredMockEmployees(prev => [...prev, emp]);
          }
        }
      }
    });

    // Remove employees from filteredMockEmployees who were moved to Users
    if (movedEmployees.length > 0) {
      setFilteredMockEmployees(prev => prev.filter(emp => !movedEmployees.includes(emp.id)));
    }

    toast({
      title: "Success",
      description: `Role assigned to ${selectedEmployees.length} employees successfully.`,
    });

    // Set up credentials dialog as needed
    if (selectedEmployeesData.length >= 5) {
      setEmployeesForBulkCredentials(selectedEmployeesData);
      setBulkCredentialsDialogOpen(true);
    } else if (selectedEmployeesData.length === 1) {
      const employeeToSetup = selectedEmployeesData[0];
      if (employeeToSetup) {
        setEmployeeForCredentials(employeeToSetup);
        setCredentialsDialogOpen(true);
      }
    } else if (selectedEmployeesData.length > 1) {
      setEmployeesForBulkCredentials(selectedEmployeesData);
      setBulkCredentialsDialogOpen(true);
    }

    setSelectedEmployees([]);
    setBulkRoleToAssign("");
    setConfirmDialogOpen(false);
    setOverwriteDialogOpen(false);
  };

  const handleCredentialsDialogClose = (open: boolean) => {
    setCredentialsDialogOpen(open);
    if (!open) {
      setDialogOpen(false);
    }
  };

  // Helper function to determine the button label based on role
  const getActionButtonLabel = (employee: any) => {
    if (employee.currentRole === "Staff") {
      return "Assign Role";
    } else if (employee.currentRole === "Labour") {
      return "Update Role";
    } else {
      return "Assign Role";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Role Mapping</h1>
        
        <Card className="p-4">
          <RoleMappingFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            entityFilter={entityFilter}
            setEntityFilter={setEntityFilter}
            classificationFilter={classificationFilter}
            setClassificationFilter={setClassificationFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            roles={mockRoles.filter(role => roleMappingVisibleRoles.includes(role.name))}
            entities={entities}
            classifications={classifications}
            categories={categories}
            onClearFilters={handleClearFilters}
          />
        </Card>
      </div>

      {selectedEmployees.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{selectedEmployees.length} employees selected</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={bulkRoleToAssign} onValueChange={setBulkRoleToAssign}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {mockRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkAssign} 
                disabled={!bulkRoleToAssign}
                className="w-full sm:w-auto"
              >
                Assign Role
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedEmployees([])}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {isMobile ? (
          <div className="divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => handleSelectEmployee(employee.id, !!checked)}
                    aria-label={`Select ${employee.name}`}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-gray-500">{employee.employeeId}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Entity:</span> {employee.entity}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Classification:</span> {employee.classification}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Category:</span> {employee.category}
                          </p>
                        </div>
                      </div>
                      {employee.currentRole && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {employee.currentRole}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => handleAssignRole(employee)}
                >
                  {getActionButtonLabel(employee)}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={areAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all employees"
                  />
                </TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => handleSelectEmployee(employee.id, !!checked)}
                      aria-label={`Select ${employee.name}`}
                    />
                  </TableCell>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.entity}</TableCell>
                  <TableCell>{employee.classification}</TableCell>
                  <TableCell>{employee.category}</TableCell>
                  <TableCell>
                    {employee.currentRole && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {employee.currentRole}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => handleAssignRole(employee)}
                    >
                      {getActionButtonLabel(employee)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AssignRoleDialog
        open={assignRoleDialogOpen}
        onOpenChange={setAssignRoleDialogOpen}
        employee={selectedEmployee}
        roles={mockRoles}
        onAssignRole={handleRoleAssigned}
      />

      <RoleAssignDialog
        open={updateRoleDialogOpen}
        onOpenChange={setUpdateRoleDialogOpen}
        employee={selectedEmployee}
        roles={mockRoles}
        onAssignRole={handleRoleAssigned}
        onRemoveRole={handleRemoveRole}
      />

      <SetLoginCredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={handleCredentialsDialogClose}
        employee={employeeForCredentials}
      />

      <BulkLoginCredentialsDialog
        open={bulkCredentialsDialogOpen}
        onOpenChange={setBulkCredentialsDialogOpen}
        employees={employeesForBulkCredentials}
      />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign the role '{bulkRoleToAssign}' to {selectedEmployees.length} selected employees?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAssignment}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={overwriteDialogOpen} onOpenChange={setOverwriteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite Existing Roles</AlertDialogTitle>
            <AlertDialogDescription>
              This action will overwrite existing role mappings for the selected employees. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAssignment}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleMapping;
