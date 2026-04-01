import { useState,useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import {BASEURL} from '../../app';
import { TOKEN } from "../../app";
import { AssignProjectModal } from "@/components/employees/AssignProjectModal";
import { Edit,  Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface EmployeeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any | null;
}

export function EmployeeDetailModal({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailModalProps) {
  if (!employee) return null;
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [assignedProjects, setassignedProjects] = useState([]);
  const [assignedId, setassignedId] = useState('');
  const [selectedProject, SetselectedProject] = useState('');
  const [viewProjectModalOpen, setViewProjectModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const loadAttendanceHistory = ()=>{
    axios.post(BASEURL+'web_history',{emp_id:employee.guid},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let attendanceHistory = response.data.data;
      setAttendanceHistory(attendanceHistory);
      console.log(attendanceHistory);
    })
  }
  const loadAssignedProjects = ()=>{
    console.log(employee);
    axios.post(BASEURL+'get_assigned_projects',{user_id:employee.id},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let assigned_projects = response.data.data;
      setassignedProjects(assigned_projects);
    })
  }
  const handleProjectView = () => {
    setViewProjectModalOpen(true);
  };
  const handleEditAssignedProject = (assign_id)=>{
    if (assign_id) {
      axios.post(BASEURL+'show_assigned_project',{assign_id:assign_id},{
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
        console.log(response)
        SetselectedProject(response.data.data.project_id);
        setassignedId(response.data.data.id)
        setViewProjectModalOpen(true);
      })
    }
  }
  const handleDeleteAssignedProject = (assign_id) =>{
    setDeleteConfirmOpen(true);
    setassignedId(assign_id);
  }
  const confirmDelete = () => {
    if (assignedId) {
      axios.post(BASEURL+'delete_assigned_project',{assign_id:assignedId},{
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
        loadAssignedProjects();
        setassignedId('');
        setDeleteConfirmOpen(false);
        toast({
          title: "Assigned Project Deleted",
          description: `Assigned Project deleted successfully.`,
        });
      })
    }
  };
  useEffect(()=>{
    if (open && employee) {
      loadAttendanceHistory();
      loadAssignedProjects();
    }
  },[open, employee])
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Employee Details</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="attendance">Attendance History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              {/* Employee Profile Section */}
              <div className="flex items-center space-x-4">
                {employee.image && employee.image !== '' ? (
                  <img src={employee.image} className="h-20 w-20 rounded-full object-cover"/>
                ):(
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" alt={employee.name} />
                    <AvatarFallback className="text-2xl bg-gray-200">
                      <User size={40} className="text-gray-500" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 className="text-lg font-medium">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                  <div className="mt-1">
                    <Badge
                      className={
                        employee.isactive === true 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {employee.isactive?'Active':'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* General Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">GENERAL INFORMATION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Employee ID</p>
                    <p className="text-sm text-gray-500">{employee.user.emp_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entity</p>
                    <p className="text-sm text-gray-500">{employee.entities.entityname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-gray-500">{employee.categories.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Classification</p>
                    <p className="text-sm text-gray-500">{employee.classifications.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contact Number</p>
                    <p className="text-sm text-gray-500">{employee.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Role</p>
                      {employee.roles.map((role, index) => (
                          <p key={index} className="text-sm text-gray-500">
                            {role.rolename}
                          </p>
                        ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Face Enrollment Status */}
              {employee.hasOwnProperty('faceEnrolled') && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">FACE ENROLLMENT</h4>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        employee.faceEnrolled 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.faceEnrolled ? "Enrolled" : "Not Enrolled"}
                    </Badge>
                    {employee.faceEnrolled && (
                      <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end mb-2">
                <Button className="p-2" onClick={() => handleProjectView()}>Add Project</Button>
              </div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Assigned Project</h4>
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Name</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedProjects.map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3  text-sm text-gray-900 font-medium">
                          {record.project.projectid} - {record.project.projectname}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.project.entity.entityname}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">{record.project.location_shotname}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">{(record.project?.isactive)?'Active':'Inactive'}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">
                           <div className="flex items-center space-x-3">
                            <Edit className="h-4 w-4  cursor-pointer" onClick={()=>handleEditAssignedProject(record.id)}/>
                            <Trash className="h-4 w-4 text-red-500 cursor-pointer" onClick={()=>handleDeleteAssignedProject(record.id)}/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">ATTENDANCE HISTORY</h4>
              
              {/* Improved Attendance History UI */}
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th> */}
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceHistory.map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3  text-sm text-gray-900 font-medium">
                          {record.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.checkin}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">{record.checkout}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">{record.project?.projectname}</td>
                        <td className="px-4 py-3  text-sm text-gray-900">
                          {record.project?.location_shotname}
                        </td>
                        {/* <td className="px-4 py-3  text-sm">
                          <Badge
                            className={record.mode === "Face" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}
                          >
                            {record.mode}
                          </Badge>
                        </td> */}
                        <td className="px-4 py-3  text-sm text-gray-900 font-medium">{record.worked_hours}</td>
                        <td className="px-4 py-3  text-sm text-gray-900 font-medium">{record.created_user.name}</td>
                        <td className="px-4 py-3  text-sm text-gray-900 font-medium">{record.attendance_type}</td>
                      {/* <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={record.comments}>
                          {record.comments || "-"}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        
        </DialogContent>
      </Dialog>
      <AssignProjectModal
          openProject={viewProjectModalOpen}
          onOpenProjectChange={(open) => {
            setViewProjectModalOpen(open);
            if (!open) {
              SetselectedProject('');
              setassignedId('');
            }
          }}
          selectEmployee={employee}
          onProjectAssigned={loadAssignedProjects} 
          projectId={selectedProject}
          assignedId={assignedId}
        />
        {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assigned Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
