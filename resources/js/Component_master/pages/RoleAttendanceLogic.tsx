
import { useState,useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { RoleAttendanceLogicForm } from "../components/RoleAttendanceLogicForm";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
// Default role attendance logic entries
const RoleAttendanceLogic = () => {
  const isMobile = useIsMobile();
  const [roleLogicData, setRoleLogicData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
   

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
    axios.post(BASEURL+'edit_role_attendance_logic',{'guid':item.guid}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let edit_item = response.data.data;
       setEditingItem(edit_item);
    }).catch(error => {
       
    })
  };

  const handleDelete = (id: number) => {
     axios.post(BASEURL+'delete_role_attendance_logic',{'guid':id}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       toast({
        title: "Role Logic Deleted",
        description: ``,
      });
      loadAttendanceRoleLogic();
    }).catch(error => {
       
    })
    
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      // Check for duplicate role (excluding current item)
      const isDuplicate = roleLogicData.some(
        item => item.roleName === data.roleName && item.id !== editingItem.id
      );
      
      if (isDuplicate) {
       
      }
      console.log(data);
      var cur_project_required1  = data.projectRequired==true?1:0;
      var cur_location_required1 = data.locationRequired==true?1:0;
      var cur_comment_required1  = data.requiresComment==true?1:0;
      axios.post(BASEURL+'update_role_attendance_logic',{guid:data.guid,role_id:data.roleName,attendance_type:data.attendanceType,project_required:cur_project_required1,location_required:cur_location_required1,comment_required:cur_comment_required1,default_comment:data.defaultCommentLabel,description:data.description}, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      })
      .then(response => {
        if(response.status && response.status == 200){
          toast({
            title: "Role Logic Updated",
            description: `Role attendance logic updated `,
          });
          loadAttendanceRoleLogic();
          setIsFormOpen(false);
          setEditingItem(null);
        }
        else{
          toast({
            title: "Duplicate Role",
            description: `Role already exists.`,
            variant: "destructive",
          });
        }
       // setRoleLogicData(attendance_types);
      }).catch(error => {
           toast({
          title: "Duplicate Role",
          description: `Role already exists.`,
          variant: "destructive",
        });
        return;
      })

      
    } else {
      // Check for duplicate role
      const isDuplicate = roleLogicData.some(item => item.roleName === data.roleName);
      
      if (isDuplicate) {
       
      }
      var cur_project_required  = data.projectRequired==true?1:0;
      var cur_location_required = data.locationRequired==true?1:0;
      var cur_comment_required  = data.requiresComment==true?1:0;
      axios.post(BASEURL+'create_role_attendance_logic',{role_id:data.roleName,attendance_type:data.attendanceType,project_required:cur_project_required,location_required:cur_location_required,comment_required:cur_comment_required,default_comment:data.defaultCommentLabel,description:data.description}, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      })
      .then(response => {
        if(response.status && response.status == 200){
          toast({
            title: "Role Logic Added",
            description: `Role attendance logic created`,
          });
          loadAttendanceRoleLogic();
          setIsFormOpen(false);
          setEditingItem(null);
        }
        else{
          toast({
            title: "Duplicate Role",
            description: `Role already exists.`,
            variant: "destructive",
          });
        }
       
        
       // setRoleLogicData(attendance_types);
      }).catch(error => {
         toast({
            title: "Duplicate Role",
            description: `Role already exists.`,
            variant: "destructive",
          });
          return;
      })

      // Add new item
      
    }
    
    
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Sick Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Casual Leave":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Present (Visa/ID)":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const loadAttendanceRoleLogic = ()=>{
    axios.post(BASEURL+'get_role_attendance_logic',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let attendance_types = response.data.data;
       setRoleLogicData(attendance_types);
    }).catch(error => {
       
    })

  }

   useEffect(()=>{
    loadAttendanceRoleLogic();
   },[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role Attendance Logic</h1>
          <p className="text-gray-600 mt-1">Configure attendance behavior and requirements for different roles</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Role Logic
        </Button>
      </div>

      {/* Data Table Section */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Role Configuration List</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {roleLogicData.length} configurations
            </Badge>
          </div>
        </div>

        {isMobile ? (
          <div className="divide-y divide-gray-200">
            {roleLogicData.map((config,index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{config.roleName}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role Logic</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this role attendance logic? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(config.guid)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Attendance Type:</span>
                    <Badge className={`ml-2 ${getStatusBadgeColor(config.attendanceType)}`}>
                      {config.attendanceType}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Project Required:</span>
                    <span className="ml-2">{config.projectRequired ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Location Required:</span>
                    <span className="ml-2">{config.locationRequired ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Requires Comment:</span>
                    <span className="ml-2">{config.requiresComment ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Attendance Type</TableHead>
                <TableHead>Project Required</TableHead>
                <TableHead>Location Required</TableHead>
                <TableHead>Requires Comment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleLogicData.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.roles.rolename}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(config?.attendance_types?.attendance_type)}>
                      {config?.attendance_types?.attendance_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.project_required} disabled />
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.location_required} disabled />
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.comment_required} disabled />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role Logic</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this role attendance logic? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(config.guid)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {roleLogicData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No role attendance logic configurations found</p>
            <p className="text-sm">Click "Add Role Logic" to get started</p>
          </div>
        )}
      </Card>

      <RoleAttendanceLogicForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default RoleAttendanceLogic;
