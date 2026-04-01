
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
type MultiRoleUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  availableRoles: any;
  onUpdateRoles: (roles: any) => void;
  onRemoveAllRoles: () => void;
};

export function MultiRoleUpdateDialog({ 
  open, 
  onOpenChange, 
  employee, 
  availableRoles, 
  onUpdateRoles,
  onRemoveAllRoles
}: MultiRoleUpdateDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (open && employee) {
       const roleNames = employee.roles?.map((role) => role.rolename) || [];
      setSelectedRoles(roleNames);
    }
  }, [open, employee]);

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleSubmit = () => {
    axios.post(BASEURL+'assign_role', {role:selectedRoles,guid:employee.guid}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
      .then(response => {
       if(response.status==200 && response.data.status==200){
        toast.success("Roles Assigned Successfully.");
         onOpenChange(false);
         if (typeof onUpdateRoles === 'function') {
          onUpdateRoles(); // ✅ trigger parent update
        }
       }
      }
      ).catch(error => {
         if (error.response && error.response.status === 400) {
       
         }
      });
   
  };

  const handleRemoveAll = () => {
    onRemoveAllRoles();
    onOpenChange(false);
  };

  const loadUserrole = (employee) => {

    axios.post(BASEURL+'get_user_role', {guid:employee.guid}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
      .then(response => {
       if(response.status==200 && response.data.status==200){
        console.log(response.data.data.roles);
        setSelectedRoles(response.data.data.roles)
       }
      }
      ).catch(error => {
         if (error.response && error.response.status === 400) {
       
         }
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Roles</DialogTitle>
          <DialogDescription>
            Update roles for {employee?.name} (Employee ID: {employee?.user?.emp_id})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Available Roles</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.rolename}
                    checked={selectedRoles.includes(role.rolename)}
                    onCheckedChange={(checked) => handleRoleToggle(role.rolename, !!checked)}
                  />
                  <label
                    htmlFor={role.rolename}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role.rolename}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {selectedRoles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Roles ({selectedRoles.length})</Label>
              <div className="flex flex-wrap gap-1">
                {selectedRoles.map((role) => (
                  <Badge key={role} className="bg-green-100 text-green-800">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleRemoveAll}
          >
            Remove All Roles
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
            >
              Update Roles ({selectedRoles.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
