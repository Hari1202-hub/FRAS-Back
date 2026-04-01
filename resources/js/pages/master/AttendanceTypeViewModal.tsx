
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AttendanceTypeViewModalProps {
  item: any;
  onClose: () => void;
}

export function AttendanceTypeViewModal({ item, onClose }: AttendanceTypeViewModalProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View Attendance Type</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Attendance Type</label>
            <p className="mt-1 text-sm text-gray-900">{item.attendanceType}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{item.description}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <Badge 
                variant={item.status === "Active" ? "default" : "secondary"}
                className={item.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {item.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
