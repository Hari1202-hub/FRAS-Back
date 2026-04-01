
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAttendanceTypeDialogProps {
  item: any;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAttendanceTypeDialog({ item, onCancel, onConfirm }: DeleteAttendanceTypeDialogProps) {
  if (!item) return null;

  return (
    <AlertDialog open={!!item} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attendance Type</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item.attendance_type}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
