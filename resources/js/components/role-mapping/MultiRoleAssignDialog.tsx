
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

type MultiRoleAssignDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  availableRoles: string[];
  onAssignRoles: (roles: string[]) => void;
};

export function MultiRoleAssignDialog({ 
  open, 
  onOpenChange, 
  employee, 
  availableRoles, 
  onAssignRoles 
}: MultiRoleAssignDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedRoles([]);
    }
  }, [open]);

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleSubmit = () => {
    onAssignRoles(selectedRoles);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Roles</DialogTitle>
          <DialogDescription>
            Select one or more roles to assign to {employee?.name} (Employee ID: {employee?.employeeId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Available Roles</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(checked) => handleRoleToggle(role, !!checked)}
                  />
                  <label
                    htmlFor={role}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={selectedRoles.length === 0}
          >
            Assign Roles ({selectedRoles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
