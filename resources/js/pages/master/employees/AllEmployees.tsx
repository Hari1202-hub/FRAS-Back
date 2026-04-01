import { useState } from "react";
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
import EmployeeActionsCell from "../EmployeeActionsCell";
import FaceEnrollmentModal from "../FaceEnrollmentModal";
import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";

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

// Mock data for all employees with assignedRoles as array
const initialEmployees = [
  { 
    id: 1, 
    name: "Ahmed Al-Mansouri", 
    employeeId: "EMP001", 
    assignedRoles: [], // No roles assigned
    category: "Laborer",
    classification: "Laborer",
    entity: "Tanseeq Investment",
    contactNumber: "+971 50 123 4567",
    email: "ahmed.almansouri@tanseeq.ae",
    faceEnrolled: true,
    status: "Active", 
    loginEnabled: true 
  },
  { 
    id: 2, 
    name: "Fatima Al-Hashimi", 
    employeeId: "EMP002", 
    assignedRoles: ["Supervisor", "Report Admin"], // Multiple roles
    category: "Supervisor",
    classification: "Staff",
    entity: "Tanseeq Landscaping LLC",
    contactNumber: "+971 52 234 5678",
    email: "fatima.alhashimi@tanseeq.ae",
    faceEnrolled: true,
    status: "Active", 
    loginEnabled: true 
  },
  { 
    id: 3, 
    name: "Mohammed Al-Farsi", 
    employeeId: "EMP003", 
    assignedRoles: [], // No roles assigned
    category: "Laborer",
    classification: "Laborer",
    entity: "Al Maha Projects",
    contactNumber: "+971 55 345 6789",
    email: "mohammed.alfarsi@almaha.ae",
    faceEnrolled: false,
    status: "Active", 
    loginEnabled: false 
  },
  { 
    id: 4, 
    name: "Aisha Al-Blooshi", 
    employeeId: "EMP004", 
    assignedRoles: ["Medical Officer"], // Single role
    category: "Driver",
    classification: "Staff",
    entity: "Gulf Builders International",
    contactNumber: "+971 54 456 7890",
    email: "aisha.alblooshi@gulfbuilders.ae",
    faceEnrolled: true,
    status: "Active", 
    loginEnabled: true 
  },
  { 
    id: 5, 
    name: "Yusuf Al-Qasimi", 
    employeeId: "EMP005", 
    assignedRoles: ["Camp Boss", "Supervisor"], // Multiple roles
    category: "Engineer",
    classification: "Staff",
    entity: "Zenith Infrastructure",
    contactNumber: "+971 56 567 8901",
    email: "yusuf.alqasimi@zenith.ae",
    faceEnrolled: true,
    status: "Active", 
    loginEnabled: true 
  },
  { 
    id: 6, 
    name: "Mariam Al-Zaabi", 
    employeeId: "EMP006", 
    assignedRoles: [], // No roles assigned
    category: "Consultant",
    classification: "Staff",
    entity: "Tanseeq Investment",
    contactNumber: "+971 50 678 9012",
    email: "mariam.alzaabi@tanseeq.ae",
    faceEnrolled: false,
    status: "Inactive", 
    loginEnabled: false 
  },
  { 
    id: 7, 
    name: "Khalid Al-Mansoori", 
    employeeId: "EMP007", 
    assignedRoles: ["Super Admin"], // Single role
    category: "Manager",
    classification: "Staff",
    entity: "Tanseeq Landscaping LLC",
    contactNumber: "+971 52 789 0123",
    email: "khalid.almansoori@tanseeq.ae",
    faceEnrolled: true,
    status: "Active", 
    loginEnabled: true 
  },
  { 
    id: 8, 
    name: "Omar Al-Shamsi", 
    employeeId: "EMP008", 
    assignedRoles: [], // No roles assigned
    category: "Laborer",
    classification: "Laborer",
    entity: "Al Maha Projects",
    contactNumber: "+971 55 890 1234",
    email: "omar.alshamsi@almaha.ae",
    faceEnrolled: false,
    status: "Active", 
    loginEnabled: false 
  },
];

const AllEmployees = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const [isTanseeqModalOpen, setIsTanseeqModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [selectedFaceEmployee, setSelectedFaceEmployee] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const filteredEmployees = employees.filter((employee) => {
    const searchMatch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = 
      statusFilter === "all" || 
      employee.status.toLowerCase() === statusFilter.toLowerCase();
    const categoryMatch = 
      categoryFilter === "all" || 
      employee.category.toLowerCase() === categoryFilter.toLowerCase();
    const entityMatch = 
      entityFilter === "all" || 
      employee.entity === entityFilter;
    const classificationMatch = 
      classificationFilter === "all" || 
      employee.classification === classificationFilter;
    const roleMatch = 
      roleFilter.length === 0 || 
      employee.assignedRoles.some(role => roleFilter.includes(role));

    return searchMatch && statusMatch && categoryMatch && entityMatch && classificationMatch && roleMatch;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-4">
        <button 
          onClick={() => setIsTanseeqModalOpen(true)}
          className="flex items-center bg-proscape hover:bg-proscape-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <CloudDownload className="h-4 w-4 mr-2" />
          Import from Tanseeq API
        </button>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                  <option key={index} value={category.toLowerCase()}>{category}</option>
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
                    <TableCell>{employee.category}</TableCell>
                    <TableCell>
                      {employee.assignedRoles && employee.assignedRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {employee.assignedRoles.map((role, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No Roles Assigned</span>
                      )}
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
                        <EmployeeActionsCell
                          employee={{
                            id: employee.employeeId,
                            name: employee.name,
                            hasFaceEnrolled: employee.faceEnrolled
                          }}
                          onEnrollFace={handleFaceEnrollment}
                        />
                        
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

      {isTanseeqModalOpen && (
        <TanseeqImportModal 
          open={isTanseeqModalOpen}
          onOpenChange={() => setIsTanseeqModalOpen(false)}
          onImportComplete={handleTanseeqImport}
        />
      )}
      
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
