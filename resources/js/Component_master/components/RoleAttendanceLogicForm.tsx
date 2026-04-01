import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

interface RoleAttendanceLogicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingItem: any;
}

export const RoleAttendanceLogicForm: React.FC<RoleAttendanceLogicFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [roleName, setRoleName] = useState("");
  const [guid, setGuid] = useState("");
  const [attendanceType, setAttendanceType] = useState("");
  const [projectRequired, setProjectRequired] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);
  const [requiresComment, setRequiresComment] = useState(false);
  const [defaultCommentLabel, setDefaultCommentLabel] = useState("");
  const [description, setDescription] = useState("");
  const [roles,setRoles] = useState([]);
  const [attendancetypes,setAttendanceTypes] = useState([]);

  const loadRoles = () => {
     axios.post(BASEURL+'roles',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let roles = response.data.data;
       setRoles(roles);
    }).catch(error => {
       
    })
    
  };
  const loadAttendanceTypes = () => {
    axios.post(BASEURL+'attendancetypes',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response => {
       let attendance_types = response.data.data;
       setAttendanceTypes(attendance_types);
    }).catch(error => {
       
    })
    
  };

  useEffect(() => {
    loadRoles();
    loadAttendanceTypes();
    if (editingItem) {
      setGuid(editingItem.guid || "");
      setRoleName(editingItem.roles.guid || "");
      setAttendanceType(editingItem?.attendance_types?.guid || "");
      setProjectRequired(editingItem.project_required || false);
      setLocationRequired(editingItem.location_required || false);
      setRequiresComment(editingItem.comment_required || false);
      setDefaultCommentLabel(editingItem.default_comment || "");
      setDescription(editingItem.description || "");
    } else {
      // Reset form fields when not editing
      setGuid("");
      setRoleName("");
      setAttendanceType("");
      setProjectRequired(false);
      setLocationRequired(false);
      setRequiresComment(false);
      setDefaultCommentLabel("");
      setDescription("");
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      guid,
      roleName,
      attendanceType,
      projectRequired,
      locationRequired,
      requiresComment,
      defaultCommentLabel,
      description,
    };
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit Role Logic" : "Add Role Logic"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="roleName" className="w-100">Role Name</Label>
            <Select value={roleName} onValueChange={setRoleName} id="roleName">
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role, index) => (
                  <SelectItem key={index} value={role.guid}>{role.rolename}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="attendanceType">Attendance Type</Label>
            <Select value={attendanceType} onValueChange={setAttendanceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select attendance type" />
              </SelectTrigger>
              <SelectContent>
                {attendancetypes.length>0 && attendancetypes.map((attendance_type, index) => (
                  <SelectItem value={attendance_type.guid}>{attendance_type.attendance_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="projectRequired">Project Required</Label>
            <Switch
              id="projectRequired"
              checked={projectRequired}
              onCheckedChange={setProjectRequired}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="locationRequired">Location Required</Label>
            <Switch
              id="locationRequired"
              checked={locationRequired}
              onCheckedChange={setLocationRequired}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="requiresComment">Requires Comment</Label>
            <Switch
              id="requiresComment"
              checked={requiresComment}
              onCheckedChange={setRequiresComment}
            />
          </div>
          {requiresComment && (
            <div>
              <Label htmlFor="defaultCommentLabel">Default Comment Label</Label>
              <Input
                id="defaultCommentLabel"
                value={defaultCommentLabel}
                onChange={(e) => setDefaultCommentLabel(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
