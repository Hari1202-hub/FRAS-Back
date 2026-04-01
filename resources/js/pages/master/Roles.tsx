import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Plus, Search, Edit, Trash, X, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

import { useEffect } from "react";
// Updated lists of all possible permissions separated by platform
const webPermissions = [
  "Manage Employees",
  "Manage Roles",
  "Assign Roles",
  "Projects",
  "Attendance Type",
  "Role Attendance Logic"
/*   "View Reports",
  "Export Reports" */
];

const mobilePermissions = [
  "Dashboard",
  "Check In",
  "Check Out",
  "History",
  "Enroll",
  "View Employees",
  "Update Employees"
];

// System-defined roles that have special behavior and should not be shown in UI
const systemDefinedRoles = ["Labour", "Staff"];

const Roles = () => {
  // Filter out system-defined roles from initial display
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({
    code: "",
    name: "",
    description: "",
    webPermissions: [],
    mobilePermissions: ['Dashboard']
  });
  const [activeTab, setActiveTab] = useState("web");
  const [validationError, setValidationError] = useState("");

  // Helper function to check if a role is system-defined
  const isSystemDefinedRole = (role) => {
    return systemDefinedRoles.includes(role.id);
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) => 
    role.rolename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.rolecode.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const handleWebPermissionChange = (permission) => {
    if (isEditModalOpen) {
      // For editing
      const updatedRole = {...selectedRole};
      if (updatedRole.webPermissions.includes(permission)) {
        updatedRole.webPermissions = updatedRole.webPermissions.filter(p => p !== permission);
      } else {
        updatedRole.webPermissions = [...updatedRole.webPermissions, permission];
      }
      
      
      setSelectedRole(updatedRole);
    } else {
      // For creating
      const updatedNewRole = {...newRole};
      if (updatedNewRole.webPermissions.includes(permission)) {
        updatedNewRole.webPermissions = updatedNewRole.webPermissions.filter(p => p !== permission);
      } else {
        updatedNewRole.webPermissions = [...updatedNewRole.webPermissions, permission];
      }
      setNewRole(updatedNewRole);
    }
  };

  const handleMobilePermissionChange = (permission) => {
    console.log(permission);
    if (permission === "Dashboard") return;
    if (isEditModalOpen) {
      // For editing
      const updatedRole = {...selectedRole};
       let updatedPermissions = [...updatedRole.mobilePermissions];
      if (updatedRole.mobilePermissions.includes(permission)) {
        updatedRole.mobilePermissions = updatedRole.mobilePermissions.filter(p => p !== permission);
        if (permission === "Enroll") {
          // Uncheck dependents when Enroll is unchecked
          updatedPermissions = updatedPermissions.filter(
            p => p !== "Enroll" && p !== "View Employees" && p !== "Update Employees"
          );
        }
        else if(permission!="View Employees" && permission!="Update Employees"){
          updatedPermissions = updatedPermissions.filter(p => p !== permission);
        }
      } 
      else {
        updatedRole.mobilePermissions = [...updatedRole.mobilePermissions, permission];
        updatedPermissions.push(permission);

        if (permission === "Enroll") {
        // Auto-check dependents
        if (!updatedPermissions.includes("View Employees")) updatedPermissions.push("View Employees");
          if (!updatedPermissions.includes("Update Employees")) updatedPermissions.push("Update Employees");
        }
        else if(permission!="View Employees" && permission!="Update Employees"){
          updatedPermissions.push(permission);
        }
      }
      updatedRole.mobilePermissions = updatedPermissions;
      //updatedRole.mobilePermissions = updatedPermissions
        setSelectedRole(updatedRole);
    } else {
      // For creating
      const updatedNewRole = {...newRole};
      let updatedPermissions = [...updatedNewRole.mobilePermissions];
      if (updatedNewRole.mobilePermissions.includes(permission)) {
        updatedNewRole.mobilePermissions = updatedNewRole.mobilePermissions.filter(p => p !== permission);
       
        if (permission === "Enroll") {
          updatedPermissions = updatedPermissions.filter(
            p => p !== "View Employees" && p !== "Update Employees" && p !== "Enroll"
          );
        }
        else if(permission!="View Employees" && permission!="Update Employees"){
          updatedPermissions = updatedPermissions.filter(p => p !== permission);
        }
      } else {
        updatedNewRole.mobilePermissions = [...updatedNewRole.mobilePermissions, permission];
        if (permission === "Enroll") {
          if (!updatedPermissions.includes("View Employees")) updatedPermissions.push("View Employees");
          if (!updatedPermissions.includes("Update Employees")) updatedPermissions.push("Update Employees");
          updatedPermissions.push("Enroll");
        }
        else if(permission!="View Employees" && permission!="Update Employees"){
          updatedPermissions.push(permission);
        }
      }
      updatedNewRole.mobilePermissions = updatedPermissions;
      setNewRole(updatedNewRole);
    }
  };

    const loadRole = () => {
     axios.post(BASEURL+'roles',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let roles = response.data.data;
       setRoles(roles);
    }).catch(error => {
        navigate("/login");
        console.log(error);
    })
    
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", newRole.name);
    formData.append("code", newRole.code);
    formData.append("description", newRole.description);
    formData.append("webPermissions", newRole.webPermissions);
    formData.append("mobilePermissions", newRole.mobilePermissions);

    
    axios.post(BASEURL+'create_role', formData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
        setNewRole({
          code: "",
          name: "",
          description: "",
          webPermissions: [],
          mobilePermissions: []
        });
        toast({
          title: "Success",
          description: "Role created successfully.",
        });
        loadRole();
        setIsCreateModalOpen(false);
    }).catch(error => {
        if (error.response && error.response.status === 400) {
         // setError("Invalid email or password");
          toast.error("Login failed");
        }
    })
    
  };

  const handleEditRole = (role) => {
    // Don't allow editing system-defined roles like Labour or Staff
    if (isSystemDefinedRole(role)) {
      toast({
        title: "Cannot Edit System Role",
        description: `The ${role.name} role is system-defined and cannot be edited.`,
        variant: "destructive"
      });
      return;
    }

    const webPermissions = typeof role.web_permission === 'string'
  ? JSON.parse(role.web_permission || '[]')
  : role.web_permission || [];

    const mobilePermissions = typeof role.mobile_permission === 'string'
      ? JSON.parse(role.mobile_permission || '[]')
      : role.mobile_permission || [];
      console.log(role);
    role.id = role.guid;
      console.log(webPermissions);
      console.log(mobilePermissions);
    
    setSelectedRole({
      ...role,
      webPermissions,
      mobilePermissions
    });
    setIsEditModalOpen(true);
  };

  const saveEditedRole = (e) => {
    e.preventDefault();
    console.info(selectedRole);
    // Validate new name isn't a system-defined role
    const formData = new FormData();
    formData.append('id',selectedRole.id)
    formData.append("name", selectedRole.rolename);
    formData.append("code", selectedRole.rolecode);
    formData.append("description", selectedRole.roledesc);
    formData.append("webPermissions", selectedRole.webPermissions);
    formData.append("mobilePermissions", selectedRole.mobilePermissions);

    axios.post(BASEURL+'update_role', formData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response => {
        setNewRole({
          code: "",
          name: "",
          description: "",
          webPermissions: [],
          mobilePermissions: []
        });
        toast({
          title: "Success",
          description: "Role updated successfully.",
        });
        loadRole();
        setIsEditModalOpen(false);
    }).catch(error => {
        if (error.response && error.response.status === 400) {
         // setError("Invalid email or password");
          toast.error("Login failed");
        }
    })
  
  };

  const deleteRole = (roleId) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    
    // Don't allow deleting system-defined roles or Super Admin
    if (roleToDelete && (isSystemDefinedRole(roleToDelete))) {
      toast({
        title: "Cannot Delete System Role",
        description: isSystemDefinedRole(roleToDelete) ? 
          `The ${roleToDelete.name} role is system-defined and cannot be deleted.` :
          "The Super Admin role cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      const formData = new FormData();
      formData.append('id',roleId)
      axios.post(BASEURL+'delete_role', formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response => {
          
          toast({
            title: "Success",
            description: "Role deleted successfully.",
          });
          loadRole();
      }).catch(error => {
          if (error.response && error.response.status === 400) {
          // setError("Invalid email or password");
            toast.error("Login failed");
          }
      });
    }
  };

  // Helper function to get combined permissions display for table
  const getCombinedPermissionsDisplay = (role) => {
    const webPermissions = typeof role.web_permission === 'string'
    ? JSON.parse(role.web_permission || '[]')
    : role.web_permission || [];
    const mobilePermissions = typeof role.mobile_permission === 'string'
    ? JSON.parse(role.mobile_permission || '[]')
    : role.mobile_permission || [];
    const combinedPermissions = [...webPermissions, ...mobilePermissions];
    const uniquePermissions = Array.from(new Set(combinedPermissions));
    
    return uniquePermissions.length > 0 ? (
      <>
        {uniquePermissions.slice(0, 2).map((permission, index) => (
          <span 
            key={index} 
            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
          >
            {permission}
          </span>
        ))}
        {uniquePermissions.length > 2 && (
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            +{uniquePermissions.length - 2} more
          </span>
        )}
      </>
    ) : (
      <span className="text-gray-500 text-sm">No permissions</span>
    );
  };
  useEffect(()=>{
    loadRole();
  },[]);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Roles Management</h1>
        <button 
          onClick={() => {setIsCreateModalOpen(true)}}
          className="flex items-center bg-proscape hover:bg-proscape-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </button>
      </div>

      <Card className="p-4 overflow-hidden">
        <div className="pb-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
              placeholder="Search by role name or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Code</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.rolecode}
                      {role.isSystemDefined && (
                        <span className="ml-2 text-xs text-gray-500">(System)</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{role.rolename}</TableCell>
                    <TableCell>{role.roledesc}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getCombinedPermissionsDisplay(role)}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <button 
                          onClick={() => handleEditRole(role)}
                          className={`text-blue-500 hover:text-blue-700 ${
                            isSystemDefinedRole(role) ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={isSystemDefinedRole(role) ? "System role cannot be edited" : "Edit Role"}
                          disabled={isSystemDefinedRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteRole(role.guid)}
                          className={`text-red-500 hover:text-red-700 ${
                            isSystemDefinedRole(role) ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={
                            isSystemDefinedRole(role)
                              ? "System role cannot be deleted" 
                              : role.id === "1" 
                                ? "Super Admin role cannot be deleted" 
                                : "Delete Role"
                          }
                          disabled={ role.id === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No roles found matching the search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Role</h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setValidationError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Code *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      placeholder="Enter role code (e.g., ADMIN)"
                      value={newRole.code}
                      onChange={(e) => setNewRole({...newRole, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      placeholder="Enter role name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter role description"
                    rows={3}
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  ></textarea>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions {!isSystemDefinedRole(newRole) && <span className="text-red-500">*</span>}
                    </label>
                    
                    {isSystemDefinedRole(newRole) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-amber-500">
                              <span className="text-xs italic mr-1">Special role exemption</span>
                              <Info className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The {newRole.name} role is system-defined and does not require permissions.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {isSystemDefinedRole(newRole) ? (
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-600 text-sm italic">
                        The {newRole.name} role is system-defined and does not require permissions.
                      </p>
                    </div>
                  ) : (
                    <Tabs defaultValue="web" className="w-full" onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="web">Web Permissions</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile Permissions</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="web" className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {webPermissions.map((permission, index) => (
                            <div key={index} className="flex items-center">
                              <Checkbox
                                id={`web-permission-${index}`}
                                checked={newRole.webPermissions.includes(permission)}
                                onCheckedChange={() => handleWebPermissionChange(permission)}
                              />
                              <label htmlFor={`web-permission-${index}`} className="ml-2 block text-sm text-gray-900">
                                {permission}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="mobile" className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mobilePermissions.map((permission, index) => (
                            <div key={index} className="flex items-center">
                              <Checkbox
                                id={`mobile-permission-${index}`}
                                checked={(newRole.mobilePermissions.includes(permission) || permission=='Dashboard')  }
                                onCheckedChange={() => handleMobilePermissionChange(permission)}
                              />
                              <label htmlFor={`mobile-permission-${index}`} className="ml-2 block text-sm text-gray-900">
                                {permission}
                              </label>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                  
                  {validationError && !isSystemDefinedRole(newRole) && (
                    <p className="mt-2 text-sm text-red-500">{validationError}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setValidationError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-proscape hover:bg-proscape-dark text-white rounded-md text-sm font-medium transition-colors"
                
                >
                  Create Role
                </button>
              </div>
            </form>    
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={saveEditedRole}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Role</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setValidationError("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Code *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape bg-gray-100"
                      value={selectedRole.rolecode} name="code"
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">Role code cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                      value={selectedRole.rolename} onChange={(e) => setSelectedRole({...selectedRole, rolename: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    rows={3}
                    value={selectedRole.roledesc}
                  onChange={(e) => setSelectedRole({...selectedRole, roledesc: e.target.value})}></textarea>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions {!isSystemDefinedRole(selectedRole) && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                  
                  <Tabs defaultValue="web" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="web">Web Permissions</TabsTrigger>
                      <TabsTrigger value="mobile">Mobile Permissions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="web" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {webPermissions.map((permission, index) => (
                          <div key={index} className="flex items-center">
                            <Checkbox
                              id={`edit-web-permission-${index}`}
                              checked={selectedRole.webPermissions.includes(permission)}
                             onCheckedChange={() => handleWebPermissionChange(permission)}
                              
                            />
                            <label htmlFor={`edit-web-permission-${index}`} className="ml-2 block text-sm text-gray-900">
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="mobile" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mobilePermissions.map((permission, index) => (
                          <div key={index} className="flex items-center">
                            <Checkbox
                              id={`edit-mobile-permission-${index}`}
                             
                            checked={(selectedRole.mobilePermissions.includes(permission) || permission=='Dashboard')}
                             onCheckedChange={() => handleMobilePermissionChange(permission)}
                            />
                            <label htmlFor={`edit-mobile-permission-${index}`} className="ml-2 block text-sm text-gray-900">
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {selectedRole.code === "SADM" && (
                    <p className="mt-2 text-xs text-amber-500">
                      Note: Some permissions cannot be removed from the Super Admin role
                    </p>
                  )}
                  
                  {validationError && !isSystemDefinedRole(selectedRole) && (
                    <p className="mt-2 text-sm text-red-500">{validationError}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setValidationError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-proscape hover:bg-proscape-dark text-white rounded-md text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
