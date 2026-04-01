import { useState, useMemo } from 'react';
import { Eye, Search, Building, User, Briefcase, ActivitySquare, Lock, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleAssignDialog } from "@/components/role-mapping/RoleAssignDialog";
import { SetLoginCredentialsDialog } from "@/components/role-mapping/SetLoginCredentialsDialog";
import { ResetPasswordDialog } from "@/components/role-mapping/ResetPasswordDialog";
import { useToast } from "@/hooks/use-toast";
import { updateEmployeeRole, availableRoles } from "@/utils/roleUtils";

// Updated mock data to include login method and ensuring all have roles assigned
const USERS = [
  { 
    employeeId: "EMP001", 
    name: "John Smith",
    entity: "Tanseeq Investment",
    category: "Carpenter",
    classification: "Laborer",
    status: "Active",
    role: "Supervisor", 
    assignedBy: "Admin User", 
    assignmentDate: "2025-03-15",
    email: "john.smith@tanseeq.ae",
    hasAccount: true,
    loginMethod: "employeeId"
  },
  { 
    employeeId: "EMP003", 
    name: "Emily Davis", 
    entity: "Tanseeq Investment LLC",
    category: "Manager",
    classification: "Staff",
    status: "Active",
    role: "Admin", 
    assignedBy: "Admin User", 
    assignmentDate: "2025-02-20",
    email: "emily.davis@tanseeq.ae",
    hasAccount: true,
    loginMethod: "email"
  },
  { 
    employeeId: "EMP005", 
    name: "Michael Brown", 
    entity: "Al Maha Projects",
    category: "Plumber",
    classification: "Laborer",
    status: "Inactive",
    role: "Clerk", 
    assignedBy: "Jane Doe", 
    assignmentDate: "2025-01-10",
    email: "michael.brown@tanseeq.ae",
    hasAccount: false,
    loginMethod: null
  },
  { 
    employeeId: "EMP007", 
    name: "David Lee", 
    entity: "Gulf Builders International",
    category: "Electrician",
    classification: "Laborer",
    status: "Active",
    role: "Supervisor", 
    assignedBy: "Admin User", 
    assignmentDate: "2025-04-05",
    email: "david.lee@tanseeq.ae",
    hasAccount: false,
    loginMethod: null
  },
];

// Extract unique values for filter dropdowns
const getUniqueValues = (field: string) => {
  const values = USERS.map((user) => user[field as keyof typeof user]);
  return [...new Set(values)];
};

const ENTITIES = getUniqueValues('entity');
const CATEGORIES = getUniqueValues('category');
const CLASSIFICATIONS = getUniqueValues('classification');
const STATUSES = getUniqueValues('status');
const ROLES = getUniqueValues('role');

const Users = () => {
  const { toast } = useToast();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof USERS[0] | null>(null);
  
  // Filter state
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Role assignment dialog
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleDialogUser, setRoleDialogUser] = useState<{
    name: string;
    employeeId: string;
    currentRole?: string;
  } | null>(null);
  
  // Login credentials dialog
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [credentialsUser, setCredentialsUser] = useState<typeof USERS[0] | null>(null);
  
  // Reset password dialog
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<typeof USERS[0] | null>(null);
  
  // Filtered users - Only showing employees who have a role assigned
  const filteredUsers = useMemo(() => {
    return USERS.filter((user) => {
      // First ensure the user has a role assigned
      if (!user.role) return false;
      
      // Then apply other filters
      const matchesEmployeeId = user.employeeId.toLowerCase().includes(employeeIdFilter.toLowerCase());
      const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesEntity = entityFilter === "all" || user.entity === entityFilter;
      const matchesCategory = categoryFilter === "all" || user.category === categoryFilter;
      const matchesClassification = classificationFilter === "all" || user.classification === classificationFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      
      return (
        matchesEmployeeId &&
        matchesName &&
        matchesEntity &&
        matchesCategory &&
        matchesClassification &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    employeeIdFilter,
    nameFilter,
    entityFilter,
    categoryFilter,
    classificationFilter,
    statusFilter,
    roleFilter,
  ]);

  // Clear all filters
  const handleClearFilters = () => {
    setEmployeeIdFilter("");
    setNameFilter("");
    setEntityFilter("all");
    setCategoryFilter("all");
    setClassificationFilter("all");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  // Open view modal
  const handleOpenViewModal = (user: typeof USERS[0]) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Handle changing a role
  const handleChangeRole = (user: typeof USERS[0]) => {
    setRoleDialogUser({
      name: user.name,
      employeeId: user.employeeId,
      currentRole: user.role
    });
    setIsRoleDialogOpen(true);
  };

  // Handle role assigned
  const handleRoleAssigned = (role: string) => {
    if (!roleDialogUser) return;
    
    // Update the role in the USERS array
    const success = updateEmployeeRole(USERS, roleDialogUser.employeeId, role);
    
    if (success) {
      // Find the updated user to pass to the credentials dialog
      const updatedUser = USERS.find(u => u.employeeId === roleDialogUser.employeeId);
      
      if (updatedUser) {
        // Set up the credentials dialog with the updated user data
        setCredentialsUser(updatedUser);
        setIsCredentialsDialogOpen(true);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to update role. User not found.",
        variant: "destructive"
      });
      setIsRoleDialogOpen(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = (user: typeof USERS[0]) => {
    setResetPasswordUser(user);
    setIsResetPasswordOpen(true);
  };

  // Handle credentials dialog close
  const handleCredentialsDialogClose = (open: boolean) => {
    setIsCredentialsDialogOpen(open);
    // If dialog is closing, also close the role dialog and show success message
    if (!open) {
      setIsRoleDialogOpen(false);
      toast({
        title: "Success",
        description: `Role ${roleDialogUser?.currentRole ? "updated" : "assigned"} successfully for ${roleDialogUser?.name}`,
      });
    }
  };

  // Reset password success handler
  const handlePasswordReset = () => {
    if (resetPasswordUser) {
      toast({
        title: "Success",
        description: `Password reset successfully for ${resetPasswordUser.name}`,
      });
    }
  };

  return (
    <div className="space-y-5 px-1 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Assigned Employees</h1>
        
        {/* Search and Filter Section */}
        <Card className="p-5 mb-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Employee ID Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by Employee ID"
                    value={employeeIdFilter}
                    onChange={(e) => setEmployeeIdFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by Name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Entity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity
                </label>
                <div className="relative">
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="All Entities" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {ENTITIES.map((entity) => (
                        <SelectItem key={typeof entity === 'string' ? entity : String(entity)} value={typeof entity === 'string' ? entity : String(entity)}>
                          {typeof entity === 'string' ? entity : String(entity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={typeof category === 'string' ? category : String(category)} value={typeof category === 'string' ? category : String(category)}>
                          {typeof category === 'string' ? category : String(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Classification Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classification
                </label>
                <div className="relative">
                  <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="All Classifications" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classifications</SelectItem>
                      {CLASSIFICATIONS.map((classification) => (
                        <SelectItem key={typeof classification === 'string' ? classification : String(classification)} value={typeof classification === 'string' ? classification : String(classification)}>
                          {typeof classification === 'string' ? classification : String(classification)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <ActivitySquare className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="All Statuses" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUSES.map((status) => (
                        <SelectItem key={typeof status === 'string' ? status : String(status)} value={typeof status === 'string' ? status : String(status)}>
                          {typeof status === 'string' ? status : String(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="All Roles" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {ROLES.map((role) => (
                        <SelectItem key={typeof role === 'string' ? role : String(role)} value={typeof role === 'string' ? role : String(role)}>
                          {typeof role === 'string' ? role : String(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Login Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.employeeId}>
                    <TableCell className="font-medium">{user.employeeId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={user.entity}>
                      {user.entity}
                    </TableCell>
                    <TableCell>{user.category}</TableCell>
                    <TableCell>{user.classification}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          user.status === "Active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className="bg-blue-100 text-blue-800 cursor-pointer"
                        onClick={() => handleChangeRole(user)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.loginMethod ? (
                        <Badge 
                          className="bg-purple-100 text-purple-800"
                        >
                          {user.loginMethod === "employeeId" ? "Employee ID" : "Email ID"}
                        </Badge>
                      ) : (
                        <Badge 
                          className="bg-gray-100 text-gray-800"
                        >
                          Not Set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Change Role Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => handleChangeRole(user)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change Role</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Reset Password Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => handleResetPassword(user)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.hasAccount ? "Reset Password" : "Set Password"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* View Details Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                onClick={() => handleOpenViewModal(user)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                    No users found with the specified criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
              <DialogDescription>
                View details for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <p className="text-sm font-medium">Employee ID:</p>
              <p className="text-sm">{selectedUser?.employeeId}</p>
              
              <p className="text-sm font-medium">Name:</p>
              <p className="text-sm">{selectedUser?.name}</p>
              
              <p className="text-sm font-medium">Role:</p>
              <p className="text-sm">
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedUser?.role}
                </Badge>
              </p>
              
              <p className="text-sm font-medium">Entity:</p>
              <p className="text-sm">{selectedUser?.entity}</p>
              
              <p className="text-sm font-medium">Category:</p>
              <p className="text-sm">{selectedUser?.category}</p>
              
              <p className="text-sm font-medium">Classification:</p>
              <p className="text-sm">{selectedUser?.classification}</p>
              
              <p className="text-sm font-medium">Status:</p>
              <p className="text-sm">
                <Badge 
                  className={
                    selectedUser?.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }
                >
                  {selectedUser?.status}
                </Badge>
              </p>
              
              <p className="text-sm font-medium">Assigned By:</p>
              <p className="text-sm">{selectedUser?.assignedBy}</p>
              
              <p className="text-sm font-medium">Assignment Date:</p>
              <p className="text-sm">
                {selectedUser?.assignmentDate && format(new Date(selectedUser.assignmentDate), "MMM dd, yyyy")}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <RoleAssignDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          employee={roleDialogUser}
          roles={availableRoles}
          onAssignRole={handleRoleAssigned}
        />
        
        {/* Set/Update Login Credentials Dialog */}
        <SetLoginCredentialsDialog
          open={isCredentialsDialogOpen}
          onOpenChange={handleCredentialsDialogClose}
          employee={credentialsUser}
        />
        
        {/* Reset Password Dialog */}
        <ResetPasswordDialog
          open={isResetPasswordOpen}
          onOpenChange={setIsResetPasswordOpen}
          employee={resetPasswordUser}
          onPasswordReset={handlePasswordReset}
        />
      </div>
    </div>
  );
};

export default Users;
