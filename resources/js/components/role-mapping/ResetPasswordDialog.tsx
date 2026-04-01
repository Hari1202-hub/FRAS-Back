import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Eye, EyeOff } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    name: string;
    employeeId: string;
    loginMethod?: string;
    email?: string;
  } | null;
  onPasswordReset?: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  employee,
  onPasswordReset,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState<string>("");
  const [loginValue, setLoginValue] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Store the current login method display separately to keep it static
  const [currentLoginMethodDisplay, setCurrentLoginMethodDisplay] = useState<string>("");
  
  // Initialize state when dialog opens or employee changes
  useEffect(() => {
    if (employee) {
      // Default to employeeId if no login method is set
      const initialLoginMethod = employee.loginMethod || "employeeId";
      setLoginMethod(initialLoginMethod);
      
      // Set the current login method display (this won't change with radio selections)
      if (employee.loginMethod === "email" && employee.email) {
        setCurrentLoginMethodDisplay(`Current Login Method: Email ID – ${employee.email}`);
        setLoginValue(employee.email);
      } else {
        setCurrentLoginMethodDisplay(`Current Login Method: Employee ID – ${employee?.user?.emp_id}`);
        setLoginValue(employee?.user?.emp_ids);
      }
      
      // Set the editable login value based on login method
      if (initialLoginMethod === "email") {
        setLoginValue(employee.email || "");
      } else {
        setLoginValue(employee?.user?.emp_id);
      }
    }
  }, [employee, open]);
  
  if (!employee) return null;
  
  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog closes
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
    
    onOpenChange(open);
  };
  
  // Handle login method change
  const handleLoginMethodChange = (value: string) => {
    setLoginMethod(value);
    
    // Update login value based on selected method (without changing the display at the top)
    if (value === "email") {
      setLoginValue(employee?.email || "");
    } else {
      setLoginValue(employee?.user?.emp_id);
    }
  };
  
  const handleReset = () => {
    // Form validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

      axios.post(BASEURL+'web_reset_password',{new_password:newPassword,new_password_confirmation:confirmPassword,guid:employee.guid},{
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
          toast({
            title: "Success!",
            description: `Password has been set.`,
          });
          // Call the onPasswordReset callback if provided
          if (onPasswordReset) {
            onPasswordReset();
          }
          // Reset form and close dialog
          setNewPassword("");
          setConfirmPassword("");
          setError("");
          onOpenChange(false);
      });
    
    
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Update login credentials for {employee.name} ({employee?.user?.emp_id})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Display current login method - this is now static */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              {currentLoginMethodDisplay}
            </AlertDescription>
          </Alert>
          
          {/* Login Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Login Method</label>
            <RadioGroup 
              value={loginMethod} 
              onValueChange={handleLoginMethodChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employeeId" id="reset-employeeId" />
                <label htmlFor="reset-employeeId" className="text-sm">
                  Employee ID: {employee?.user?.emp_id}
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="reset-email" />
                <label htmlFor="reset-email" className="text-sm">
                  Email ID
                </label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Login Value - Only editable if using email */}
          {loginMethod === "email" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="Enter email address" readonly=""
              />
            </div>
          )}
          
          {/* Password fields with visibility toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReset}>
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
