
import { useState,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
import { Info, Eye, EyeOff } from "lucide-react";

type RoleSelectionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  availableRoles: string[];
  onContinue: (selectedRoles: string[]) => void;
};

export function RoleSelectionModal({ 
  open, 
  onOpenChange, 
  employee, 
  availableRoles,
  onContinue 
}: RoleSelectionModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role]);
    } else {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setSelectedRoles(selectedRoles.filter(role => role !== roleToRemove));
  };

  const handleContinue = () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one role.",
        variant: "destructive"
      });
      return;
    }
    if( newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match.",
        variant: "destructive"
      });
      return;
    }
    if (newPassword!='' && newPassword.length < 8) {
      toast({
        title: "Password Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }
    axios.post(BASEURL+'web_assign_role', {role:selectedRoles,guid:employee.guid,password:newPassword}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
      .then(response => {
       if(response.status==200 && response.data.status==200){
        toast.success("Roles Assigned Successfully.");
        setSelectedRoles([]);
        onOpenChange(false);
       }
      }
      ).catch(error => {
         if (error.response && error.response.status === 400) {
       
         }
      });

  };

  const handleClose = () => {
    setSelectedRoles([]);
    onOpenChange(false);
  };
 
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Roles to Assign</DialogTitle>
          <DialogDescription>
            Select roles to assign to {employee?.name} (Employee ID: {employee?.employeeId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Available Roles *</Label>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.rolename}
                    checked={selectedRoles.includes(role.rolename)}
                    onCheckedChange={(checked) => handleRoleToggle(role.rolename, !!checked)}
                  />
                  <Label htmlFor={role} className="text-sm font-normal cursor-pointer">
                    {role.rolename}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {selectedRoles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Roles ({selectedRoles.length}):</Label>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <Badge key={role} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {role}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={selectedRoles.length === 0}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
