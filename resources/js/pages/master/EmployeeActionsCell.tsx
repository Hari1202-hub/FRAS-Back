
import { Camera, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface EmployeeActionsCellProps {
  employee: {
    id: string;
    name: string;
    hasFaceEnrolled?: boolean;
  };
  onEnrollFace: (employee: { id: string; name: string; hasFaceEnrolled?: boolean }) => void;
}

const EmployeeActionsCell = ({ employee, onEnrollFace }: EmployeeActionsCellProps) => {
  return (
    <div className="flex justify-end space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEnrollFace(employee)}
            >
              {employee.hasFaceEnrolled ? (
                <IdCard className="h-4 w-4 text-orange-500" />
              ) : (
                <Camera className="h-4 w-4 text-blue-500" />
              )}
              <span className="sr-only">
                {employee.hasFaceEnrolled ? "Update Face ID" : "Setup Face ID"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{employee.hasFaceEnrolled ? "Update Face ID" : "Setup Face ID"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default EmployeeActionsCell;
