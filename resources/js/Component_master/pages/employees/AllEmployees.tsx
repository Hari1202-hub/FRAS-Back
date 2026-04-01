
import { useState,useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye, Search, Filter, CloudDownload } from "lucide-react";
import { TanseeqImportModal } from "@/components/employees/TanseeqImportModal";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import EmployeeActionsCell from "../../components/EmployeeActionsCell";
import FaceEnrollmentModal from "../../components/FaceEnrollmentModal";
import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";
import axios from "axios";
import { BASEURL } from "../../../app";
import { TOKEN } from "../../../app";


const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [lastpage, setLastPage] = useState(1);
  const [entities, setEntities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [selectedFaceEmployee, setSelectedFaceEmployee] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [totalPage,setTotalPage] = useState(1);
  const itemsPerPage = 100; // You can change this to whatever suits


  const loadEmployees = (pageNumber=1) =>{
    const postData = new FormData();
   // postData.append('assigned_role', 0);
    postData.append('page', pageNumber);
    postData.append('length', itemsPerPage);

     // Add filters to the request
    postData.append('search', searchTerm);
    postData.append('status', statusFilter=='all'?'':statusFilter);
    postData.append('category', categoryFilter=='all'?'':categoryFilter);
    postData.append('entity', entityFilter=='all'?'':entityFilter);
    postData.append('classification', classificationFilter=='all'?'':classificationFilter);
    postData.append('roles', roleFilter.join(','));
    axios.post(BASEURL+'web_employees',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        let employees = response.data.data.employees;
        setEmployees(employees);
        setTotalPage(response.data.data.total_count);
        setLastPage(response.data.data.last_page);
    })
  }


  const filteredEmployees = employees.filter((employee) => {
    const searchMatch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user?.emp_id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = 
      statusFilter === "all" || 
      ((employee.isactive == true && statusFilter==1) || (employee.isactive == false && statusFilter==0));
    const categoryMatch = 
      categoryFilter === "all" || 
      employee.category_code.toLowerCase() === categoryFilter.toLowerCase();
    const entityMatch = 
      entityFilter === "all" || 
      employee.entity_id == entityFilter;
    const classificationMatch = 
      classificationFilter === "all" || 
      employee.classification_code === classificationFilter;
    const roleMatch = 
      roleFilter.length === 0 || 
      employee.roles.some(role => roleFilter.includes(role.roelname));

    return searchMatch && statusMatch && categoryMatch && entityMatch && classificationMatch && roleMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);



  const handleEmployeeView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const handleFaceEnrollment = (employee) => {
    setSelectedFaceEmployee(employee);
    setIsFaceModalOpen(true);
  };

  const handleTanseeqImport = (newEmployees) => {
    const maxId = Math.max(...employees.map(e => e.id));
    
    const employeesToAdd = newEmployees.map((emp, index) => {
      const classification = classifications[Math.floor(Math.random() * classifications.length)];
      
      return {
        id: maxId + index + 1,
        name: emp.name,
        employeeId: emp.employeeId,
        assignedRoles: [], // New employees start with no roles
        category: categories[Math.floor(Math.random() * categories.length)],
        entity: entities[Math.floor(Math.random() * entities.length)],
        contactNumber: "+971 5" + Math.floor(Math.random() * 10) + " " + 
                      Math.floor(Math.random() * 900 + 100) + " " + 
                      Math.floor(Math.random() * 9000 + 1000),
        email: emp.name.toLowerCase().replace(" ", ".") + "@tanseeq.ae",
        faceEnrolled: false,
        status: "Active",
        classification: classification
      };
    });
    
    setEmployees([...employees, ...employeesToAdd]);
  };

  const handleRoleFilterChange = (selectedRoles) => {
    setRoleFilter(selectedRoles);
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
  useEffect(()=>{
    loadEmployees(currentPage);
    loadEntities();
    loadCategories();
    loadClassifications();
  },[currentPage, searchTerm, statusFilter, categoryFilter, entityFilter, classificationFilter, roleFilter])
  return (
    <div className="space-y-6">
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
                    <TableCell className="max-w-[200px] truncate" title={employee.classifications.name}>
                      {employee.entities.entityname}
                    </TableCell>
                    <TableCell>{employee.classifications.description}</TableCell>
                    <TableCell>{employee.categories.description}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{employee?.project?.projectname}</TableCell>

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
                        {/* <EmployeeActionsCell
                          employee={{
                            id: employee.emp_id,
                            name: employee.name,
                            hasFaceEnrolled: employee.image
                          }}
                          onEnrollFace={handleFaceEnrollment}
                        /> */}
                        
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
                    No employees found matching the search criteria
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

     
      {selectedFaceEmployee && (
        <FaceEnrollmentModal
          isOpen={isFaceModalOpen}
          onClose={() => setIsFaceModalOpen(false)}
          employeeName={selectedFaceEmployee.name}
          employeeId={selectedFaceEmployee.id}
          isUpdate={selectedFaceEmployee.hasFaceEnrolled}
        />
      )}
      
      <EmployeeDetailModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default AllEmployees;
