
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface DeleteAttendanceTypeDialogProps {
  item: any;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAttendanceTypeDialog({ item, onCancel, onConfirm }: DeleteAttendanceTypeDialogProps) {
  return (
    <AlertDialog open={!!item} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attendance Type?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the attendance type <span className="font-semibold">"{item?.attendanceType}"</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
