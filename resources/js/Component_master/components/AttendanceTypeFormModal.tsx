
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceTypeFormModalProps {
  item: any;
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

  useEffect(() => {
    if (item) {
      setFormData({
        attendanceType: item.attendance_type || "",
        description: item.description || "",
        status: item.isactive?"Active":"Inactive"
      });
    } else {
      setFormData({
        attendanceType: "",
        description: "",
        status: "Active"
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, !!item);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} Attendance Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="attendanceType">Attendance Type</Label>
            <Input
              id="attendanceType"
              value={formData.attendanceType}
              onChange={(e) => setFormData({ ...formData, attendanceType: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3} required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
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
              {item ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
