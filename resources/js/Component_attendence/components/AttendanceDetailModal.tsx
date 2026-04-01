
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  employeeId: string;
  name: string;
  project: string;
  category: string;
  classification: string;
  entity: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  mode: string;
  comment?: string;
}

interface AttendanceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

const AttendanceDetailModal = ({
  open,
  onOpenChange,
  record
}: AttendanceDetailModalProps) => {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Employee ID</label>
              <p className="font-medium">{record.employeeId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="font-medium">{record.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p>{record.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Classification</label>
              <p>{record.classification}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Entity</label>
            <p>{record.entity}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Project</label>
            <p>{record.project}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p>{format(new Date(record.date), "PPP")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mode</label>
              <Badge variant={record.mode === 'Face' ? 'default' : 'secondary'}>
                {record.mode}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Check-in Time</label>
              <p className="font-medium text-green-600">{record.checkInTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Check-out Time</label>
              <p className="font-medium text-red-600">{record.checkOutTime || 'Not checked out'}</p>
            </div>
          </div>

          {record.comment && (
            <div>
              <label className="text-sm font-medium text-gray-500">Comment</label>
              <p className="bg-gray-50 p-2 rounded border">{record.comment}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDetailModal;
