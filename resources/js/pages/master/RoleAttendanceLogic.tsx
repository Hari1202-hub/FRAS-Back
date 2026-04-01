import { useState } from "react";
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
import { RoleAttendanceLogicForm } from "@/Component_master/components/RoleAttendanceLogicForm";
import { Switch } from "@/components/ui/switch";

// Default role attendance logic entries
const defaultRoleLogicData = [
  {
    id: 1,
    roleName: "Supervisor",
    attendanceType: "Present",
    projectRequired: true,
    locationRequired: true,
    requiresComment: false,
    defaultCommentLabel: "",
    description: "Standard attendance for supervisors"
  },
  {
    id: 2,
    roleName: "Medical Officer",
    attendanceType: "Sick Leave",
    projectRequired: false,
    locationRequired: false,
    requiresComment: true,
    defaultCommentLabel: "Enter sick leave reason",
    description: "Medical officer sick leave approval"
  },
  {
    id: 3,
    roleName: "Camp Boss",
    attendanceType: "Casual Leave",
    projectRequired: false,
    locationRequired: false,
    requiresComment: true,
    defaultCommentLabel: "Enter casual leave reason",
    description: "Camp boss casual leave management"
  },
  {
    id: 4,
    roleName: "United Emirates Officer",
    attendanceType: "Present (Visa/ID)",
    projectRequired: false,
    locationRequired: false,
    requiresComment: true,
    defaultCommentLabel: "Enter ID/Visa status",
    description: "UAE officer presence verification"
  }
];

const RoleAttendanceLogic = () => {
  const isMobile = useIsMobile();
  const [roleLogicData, setRoleLogicData] = useState(defaultRoleLogicData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    const deletedItem = roleLogicData.find(item => item.id === id);
    setRoleLogicData(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Role Logic Deleted",
      description: `Role attendance logic for ${deletedItem?.roleName} has been removed.`,
    });
  };

  const handleSave = (data: any) => {
    setIsFormOpen(false);
    setEditingItem(null);
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
            {roleLogicData.map((config) => (
              <div key={config.id} className="p-4 space-y-3">
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
                          <AlertDialogAction onClick={() => handleDelete(config.id)}>
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
                  <TableCell className="font-medium">{config.roleName}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(config.attendanceType)}>
                      {config.attendanceType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.projectRequired} disabled />
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.locationRequired} disabled />
                  </TableCell>
                  <TableCell>
                    <Switch checked={config.requiresComment} disabled />
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
                            <AlertDialogAction onClick={() => handleDelete(config.id)}>
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
