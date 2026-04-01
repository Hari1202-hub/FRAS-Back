
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AttendanceTypeViewModalProps {
  item: any;
  onClose: () => void;
}

export function AttendanceTypeViewModal({ item, onClose }: AttendanceTypeViewModalProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attendance Type Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Attendance Type</label>
            <p className="text-lg font-semibold">{item.attendance_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{item.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge 
                variant={item.isactive === true ? "default" : "secondary"}
                className={item.isactive === true ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {item.isactive?'Active':'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
