
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SetLoginCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    name: string;
    employeeId: string;
    email?: string;
    currentLoginMethod?: "employeeId" | "email";
  } | null;
  afterSave?: () => void; // Optional callback after successful save
}

export function SetLoginCredentialsDialog({
  open,
  onOpenChange,
  employee,
  afterSave,
}: SetLoginCredentialsDialogProps) {
  const [loginMethod, setLoginMethod] = useState<"employeeId" | "email">("employeeId");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // When the dialog opens, set the default login method based on employee data
  useEffect(() => {
    if (employee && open) {
      // If employee has a current login method, use that as default
      if (employee.currentLoginMethod) {
        setLoginMethod(employee.currentLoginMethod);
      } else if (employee.email) {
        // If no current method but email exists, default to email
        setLoginMethod("email");
      } else {
        // Default to employee ID if no email
        setLoginMethod("employeeId");
      }
      
      // Reset form fields
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [employee, open]);

  const validateForm = () => {
    const newErrors: {
      password?: string;
      confirmPassword?: string;
    } = {};
    
    // Check password length
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm() || !employee) return;
    
    // In a real app, this would call an API to save the credentials
    if (loginMethod === "employeeId") {
      // Store employee ID + password (would be API call in real app)
      console.log("Storing credentials for:", employee.employeeId, password);
      
      // Show success toast
      toast.success("Login created using Employee ID. Please share the password with the employee offline.");
    } else {
      // Store email + password (would be API call in real app)
      console.log("Storing credentials for email:", employee.email, password);
      
      // In a real app, this would trigger an email
      console.log("Sending email to:", employee.email);
      
      // Show success toast
      toast.success("Login created and email notification sent to the employee.");
    }
    
    // Reset form
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    
    // Close dialog
    onOpenChange(false);
    
    // Call afterSave callback if provided
    if (afterSave) {
      afterSave();
    }
  };

  if (!employee) return null;

  const hasCurrentLoginMethod = employee.currentLoginMethod !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Login Credentials</DialogTitle>
          <DialogDescription>
            {employee.name} ({employee.employeeId})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Display employee information */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="font-medium">Employee ID:</p>
            <p>{employee.employeeId}</p>
            
            <p className="font-medium">Email ID:</p>
            <p>{employee.email || "–"}</p>
            
            {/* Always display current login method section */}
            {hasCurrentLoginMethod && (
              <>
                <p className="font-medium">Current Login Method:</p>
                <Badge className="bg-purple-100 text-purple-800 inline-flex">
                  {employee.currentLoginMethod === "employeeId" ? "Employee ID" : "Email ID"}
                </Badge>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">How should this employee log in?</h4>
            <RadioGroup 
              value={loginMethod}
              onValueChange={(value) => setLoginMethod(value as "employeeId" | "email")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employeeId" id="employeeId" />
                <Label htmlFor="employeeId">Login via Employee ID</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="email" 
                  id="email" 
                  disabled={!employee.email}
                />
                <Label 
                  htmlFor="email" 
                  className={!employee.email ? "text-gray-400" : ""}
                >
                  Login via Email ID {!employee.email && "(Email not available)"}
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Set Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          {/* Display login method specific instructions */}
          {loginMethod === "employeeId" ? (
            <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <p className="text-sm text-blue-700">
                Password will be set for Employee ID login. You'll need to share the password with the employee offline.
              </p>
            </div>
          ) : employee.email && (
            <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-sm text-blue-700">
                An email will be sent to {employee.email} with login instructions.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
