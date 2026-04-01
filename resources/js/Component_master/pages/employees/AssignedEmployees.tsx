
import { useState,useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
import axios from "axios";
import { BASEURL } from "../../../app";
import { TOKEN } from "../../../app";
import { useNavigate } from "react-router-dom";


const AssignedEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [lastpage, setLastPage] = useState(1);

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

  const [totalPage,setTotalPage] = useState(1);
  const itemsPerPage = 100; // You can change this to whatever suits

  const [availableRoles,setAvailableRoles] = useState([]);
  const [entities, setEntities] = useState([]);
  const [categories, setCategories] = useState([]);;

  const [classifications, setClassifications] = useState([]);

  const loadRole = () => {
     axios.post(BASEURL+'roles',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let roles = response.data.data;
       setAvailableRoles(roles);
    }).catch(error => {
        navigate("/login");
        console.log(error);
    })
    
  };

  const loadEmployees = (pageNumber=1) =>{
    const postData = new FormData();
    postData.append('assigned_role', 1);
    postData.append('page', pageNumber);
    postData.append('length', itemsPerPage);

     // Add filters to the request
    postData.append('search', searchTerm);
    postData.append('status', statusFilter=='all'?'':statusFilter);
    postData.append('entity', entityFilter=='all'?'':entityFilter);
    postData.append('classification', classificationFilter=='all'?'':classificationFilter);
    postData.append('roles', roleFilter=='all'?'':roleFilter);

    axios.post(BASEURL+'web_employees',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let employees = response.data.data.employees;
        setEmployees(employees);
        setTotalPage(response.data.data.total_count);
        setLastPage(response.data.data.last_page);

    })
  }

  const loadEntities = ()=>{
    axios.post(BASEURL+'entities',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let entities = response.data.data;
      setEntities(entities);
    })
  }
  const loadCategories = ()=>{
    axios.post(BASEURL+'categories',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let categories = response.data.data;
      setCategories(categories);
    })
  }
  const loadClassifications = ()=>{
    axios.post(BASEURL+'classifications',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let classifications = response.data.data;
      setClassifications(classifications);
    })
  }

  // Get unique list of roles from all assigned employees
  const roles = Array.from(
    new Set(employees.flatMap(emp => emp.roles || []))
  ).filter(Boolean);

  // Filter to show only employees with assigned roles
  const filteredEmployees = employees.filter((employee) => {
    // First check if employee has roles assigned
    /* const hasRoles = employee.assignedRoles && employee.assignedRoles.length > 0;
    
    if (!hasRoles) return false;
     */
    const searchMatch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user?.emp_id.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch =
      roleFilter === "all" ||
      employee.roles?.some(role => role.id === Number(roleFilter));
    const statusMatch = 
      statusFilter === "all" || 
      ((employee.isactive == true && statusFilter==1) || (employee.isactive == false && statusFilter==0));
    const entityMatch = 
      entityFilter === "all" || 
      employee.entity_id === entityFilter;
    const classificationMatch = 
      classificationFilter === "all" || 
      employee.classification_code === classificationFilter;

    return searchMatch && roleMatch && statusMatch && entityMatch && classificationMatch;
  });
  const [currentPage, setCurrentPage] = useState(1);

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
   loadEmployees();
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
    /* toast({
      title: "Success",
      description: `Password reset process completed for employee.`,
    }); */
  };
 useEffect(()=>{
    loadEmployees(currentPage);
    loadRole();
    loadEntities();
    loadCategories();
    loadClassifications();
  },[currentPage, searchTerm, statusFilter, entityFilter, classificationFilter, roleFilter])
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
                {availableRoles.map((role, index) => (
                  <option key={index} value={role.id}>{role.rolename}</option>
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
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Entity:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              style={{ maxWidth: '160px' }}>
                <option value="all">All Entities</option>
                {entities.map((entity, index) => (
                  <option key={index} value={entity.id}>{entity.entityname}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Classification:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
              style={{ maxWidth: '160px' }}>
                <option value="all">All Classifications</option>
                {classifications.map((classification, index) => (
                  <option key={index} value={classification.code}>{classification.description}</option>
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
                <TableHead>Assigned Project</TableHead>
                <TableHead>Login Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee,empIndex) => (
                  <TableRow key={empIndex}>
                    <TableCell className="font-medium">{employee.user?.emp_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={employee.entities.entityname}>
                      {employee.entities.entityname}
                    </TableCell>
                    <TableCell>{employee.classifications.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.roles && employee.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {employee.roles.map((role, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                              {role.rolename}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No Roles Assigned</span>
                      )}
                      </div>
                    </TableCell>
                    <TableCell>{employee?.project?.projectname}</TableCell>

                    <TableCell>
                      {employee.loginmethod_code ? employee.loginmethod_code : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          employee.isactive === true 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {employee.isactive?'Active':'Inactive'}
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
            Showing {totalPage > 0 ?(
              <>
              <span className="font-medium">{((currentPage-1)*itemsPerPage)+1} - 
                {totalPage >= (((currentPage-1)*itemsPerPage)+100)?(<>{((currentPage-1)*itemsPerPage)+100}</> 
                ):('')}
                </span> of{" "}
            <span className="font-medium">{totalPage}</span> employees
            </>
            ):(
              <> 0 employees</>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPage))} disabled={  currentPage === lastpage}>
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
