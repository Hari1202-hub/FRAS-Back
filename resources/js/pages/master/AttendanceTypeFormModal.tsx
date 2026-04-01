
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AttendanceTypeFormModalProps {
  item?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, isEdit: boolean) => void;
}

export function AttendanceTypeFormModal({ item, isOpen, onClose, onSave }: AttendanceTypeFormModalProps) {
  const [formData, setFormData] = useState({
    attendanceType: "",
    description: "",
    status: "Active"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        attendanceType: item.attendanceType || "",
        description: item.description || "",
        status: item.status || "Active"
      });
    } else {
      setFormData({
        attendanceType: "",
        description: "",
        status: "Active"
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.attendanceType.trim()) {
      newErrors.attendanceType = "Attendance Type is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData, !!item);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Attendance Type" : "Add New Attendance Type"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="attendanceType">Attendance Type *</Label>
            <Input
              id="attendanceType"
              value={formData.attendanceType}
              onChange={(e) => handleChange("attendanceType", e.target.value)}
              className={errors.attendanceType ? "border-red-500" : ""}
              placeholder="Enter attendance type"
            />
            {errors.attendanceType && (
              <p className="text-sm text-red-500 mt-1">{errors.attendanceType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Enter description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
