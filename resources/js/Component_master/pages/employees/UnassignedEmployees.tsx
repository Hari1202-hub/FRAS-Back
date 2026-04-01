
import { useState,useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, Search, Filter, UserPlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { RoleSelectionModal } from "@/components/role-mapping/RoleSelectionModal";
import { SetupLoginModal } from "@/components/password-management/SetupLoginModal";
import { toast } from "@/hooks/use-toast";
import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";
import axios from "axios";
import { BASEURL } from "../../../app";
import { TOKEN } from "../../../app";





const UnassignedEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [lastpage, setLastPage] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);
  const [setupLoginOpen, setSetupLoginOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [totalPage,setTotalPage] = useState(1);
  const itemsPerPage = 100; // You can change this to whatever suits

  const [entities, setEntities] = useState([]);
  const [categories, setCategories] = useState([]);;

  const [classifications, setClassifications] = useState([]);
  const [availableRoles,setAvailableRoles] = useState([]);
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

  const loadEmployees = (pageNumber=1) =>{
    const postData = new FormData();
    postData.append('assigned_role', 0);
    postData.append('page', pageNumber);
    postData.append('length', itemsPerPage);

     // Add filters to the request
    postData.append('search', searchTerm);
    postData.append('status', statusFilter=='all'?'':statusFilter);
    postData.append('category', categoryFilter=='all'?'':categoryFilter);
    postData.append('entity', entityFilter=='all'?'':entityFilter);
    postData.append('classification', classificationFilter=='all'?'':classificationFilter);
    //postData.append('roles', roleFilter.join(','));
    axios.post(BASEURL+'web_employees',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let employees = response.data.data.employees;
        setEmployees(employees);
        setTotalPage(response.data.data.total_count);
        setLastPage(response.data.data.last_page);

    })
  }
  // Filter to show only employees with no assigned roles
  const filteredEmployees = employees.filter((employee) => {
    // First check if employee has no roles assigned
    const hasNoRoles = !employee.assignedRoles || employee.assignedRoles.length === 0;
    
    if (!hasNoRoles) return false;
    
    const searchMatch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user?.emp_id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = 
      statusFilter === "all" || 
      ((employee.isactive == true && statusFilter==1) || (employee.isactive == false && statusFilter==0));
    const categoryMatch = 
      categoryFilter === "all" || 
      employee.category_code === categoryFilter;
      console.log(employee.entity_id);
    const entityMatch = 
      entityFilter === "all" || 
      employee.entity_id == entityFilter;
    const classificationMatch = 
      classificationFilter === "all" || 
      employee.classification_code === classificationFilter;

    return searchMatch && statusMatch && categoryMatch && entityMatch && classificationMatch;
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleEmployeeView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleAssignRoles = (employee) => {
    setSelectedEmployee(employee);
    setRoleSelectionOpen(true);
  };

  const handleRoleSelectionContinue = (roles: string[]) => {
    setSelectedRoles(roles);
    setRoleSelectionOpen(false);
    setSetupLoginOpen(true);
  };

  const handleLoginSetup = (loginData: { loginId: string; password: string; roles: string[]; loginMethod: string }) => {
    if (!selectedEmployee) return;
    
    // Update employee with login enabled status and assigned roles
    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? {
            ...emp, 
            loginEnabled: true, 
            loginId: loginData.loginId,
            loginMethod: loginData.loginMethod,
            assignedRoles: loginData.roles
          } 
        : emp
    );
    
    // Remove employee from unassigned list since they now have roles
    const filteredEmployees = updatedEmployees.filter(emp => 
      !emp.assignedRoles || emp.assignedRoles.length === 0
    );
    setEmployees(filteredEmployees);
    
    toast({
      title: "Employee Setup Complete",
      description: `Login credentials created and ${loginData.roles.length} role(s) assigned to ${selectedEmployee.name}. Employee moved to Assigned Employees.`,
    });
    
    setSetupLoginOpen(false);
    setSelectedRoles([]);
    setSelectedEmployee(null);
  };
  useEffect(()=>{
    loadEmployees(currentPage);
    loadEntities();
    loadCategories();
    loadClassifications();
    loadRole();
  },[currentPage, searchTerm, statusFilter, categoryFilter, entityFilter, classificationFilter])
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Unassigned Employees</h1>
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
              <span className="text-sm text-gray-600 mr-2">Category:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.code}>{category.description}</option>
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
                <TableHead>Category</TableHead>
                <TableHead>Assigned Roles</TableHead>
                <TableHead>Assigned Projects</TableHead>
                <TableHead>Login Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee,empIndex) => (
                  <TableRow  key={empIndex}>
                    <TableCell className="font-medium">{employee.user?.emp_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={employee.entities.entityname}>
                      {employee.entities.entityname}
                    </TableCell>
                    <TableCell>{employee.classifications.description}</TableCell>
                    <TableCell>{employee.categories.description}</TableCell>
                    <TableCell>
                      <Badge 
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        No Roles Assigned
                      </Badge>
                    </TableCell>
                    <TableCell>{employee?.project?.projectname}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          employee.isentrolled 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        {employee.isentrolled ? "✅ Login Enabled" : "❌ Not Enabled"}
                      </Badge>
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
                                onClick={() => handleAssignRoles(employee)}
                                className="text-green-500 hover:text-green-700 p-1"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Assign Roles & Setup Login</p>
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
                  <TableCell colSpan={9} className="text-center py-6 text-gray-500"> 
                    No unassigned employees found matching the search criteria
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
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPage))} disabled={ currentPage === lastpage}>
              Next
            </button>
          </div>
        </div>
      </Card>

      <RoleSelectionModal
        open={roleSelectionOpen}
        onOpenChange={setRoleSelectionOpen}
        employee={selectedEmployee}
        availableRoles={availableRoles}
        onContinue={handleRoleSelectionContinue}
      />

      <SetupLoginModal
        open={setupLoginOpen}
        onOpenChange={setSetupLoginOpen}
        employee={selectedEmployee}
        selectedRoles={selectedRoles}
        onLoginSetup={handleLoginSetup}
      />
      
      <EmployeeDetailModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default UnassignedEmployees;
