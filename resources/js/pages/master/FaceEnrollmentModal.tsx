
import { useState } from "react";
import { toast } from "sonner";
import { X, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
  isUpdate: boolean;
}

const FaceEnrollmentModal = ({
  isOpen,
  onClose,
  employeeName,
  employeeId,
  isUpdate
}: FaceEnrollmentModalProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  
  const handleCapture = () => {
    setIsCapturing(true);
    
    // Simulate face capture process
    setTimeout(() => {
      setIsCapturing(false);
      
      // Store enrollment info in a real app
      const enrollmentInfo = {
        doneBy: "Admin User", // This would come from the user context in a real app
        doneOn: new Date().toLocaleString()
      };
      
      // In a real app, this would be saved to the backend
      console.log("Face enrollment completed:", enrollmentInfo);
      
      // Show success message
      toast.success(isUpdate 
        ? "Face ID updated successfully" 
        : "Face ID setup completed successfully"
      );
      
      onClose();
    }, 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update Face ID" : "Setup Face ID"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate 
              ? `Update facial data for ${employeeName} (ID: ${employeeId})` 
              : `Setup face recognition for ${employeeName} (ID: ${employeeId})`
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Camera preview area */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="w-64 h-64 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden"
          >
            {isCapturing ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-sm">Processing...</p>
              </div>
            ) : (
              <>
                <Camera className="h-16 w-16 text-gray-400" />
                <div className="absolute inset-0 bg-transparent border-2 border-dashed border-gray-300 rounded-lg pointer-events-none"></div>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCapturing ? "Processing..." : isUpdate ? "Update Face ID" : "Capture Face"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceEnrollmentModal;
