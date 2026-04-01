
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

// Define interface for component props
interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    name: string;
    employeeId: string;
    email?: string;
  } | null;
  roles: { name: string; id?: number }[];
  onAssignRole: (role: string) => void;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  employee,
  roles,
  onAssignRole,
}: AssignRoleDialogProps) {
  // State for step tracking (1: role selection, 2: login setup)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loginMethod, setLoginMethod] = useState<"employeeId" | "email">("employeeId");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mobile-only roles that don't require login credentials
  const mobileOnlyRoles = ["Medical Officer", "Camp Boss", "United Emirates Officer"];

  // Reset the dialog state when it opens or closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };
  
  // Reset all state to default values
  const resetState = () => {
    setStep(1);
    setSelectedRole("");
    setLoginMethod("employeeId");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Proceed to login method selection step
  const handleContinue = () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }
    
    setError("");
    
    // Skip login setup for mobile-only roles
    if (mobileOnlyRoles.includes(selectedRole)) {
      handleDirectAssignment();
      return;
    }
    
    setStep(2);
  };

  // Direct assignment for mobile-only roles
  const handleDirectAssignment = () => {
    onAssignRole(selectedRole);
    
    toast({
      title: "Role Assigned Successfully",
      description: `${employee?.name} has been assigned the role of ${selectedRole}. This is a mobile-only role.`,
    });
    
    resetState();
    onOpenChange(false);
  };

  // Submit the form to assign role and set credentials
  const handleSubmit = () => {
    // Validate form
    if (!loginMethod) {
      setError("Please select a login method");
      return;
    }
    
    if (!password || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    // If email login method is selected but no email is provided
    if (loginMethod === "email" && !employee?.email) {
      setError("Employee does not have an email address");
      return;
    }
    
    // Log the role assignment (in a real app, this would be sent to the backend)
    console.log("Assigning role to employee:", employee?.employeeId);
    console.log("Selected role:", selectedRole);
    console.log("Login method:", loginMethod);
    
    // Call the parent component's callback
    onAssignRole(selectedRole);
    
    toast({
      title: "Role Assigned Successfully",
      description: `${employee?.name} has been assigned the role of ${selectedRole}.`,
    });
    
    // Reset state and close dialog
    resetState();
    onOpenChange(false);
  };
  
  // Get login value based on selected method
  const getLoginValue = () => {
    if (employee) {
      return loginMethod === "email" ? employee.email : employee.employeeId;
    }
    return "";
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            Assign a role to {employee.name} ({employee.employeeId})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {step === 1 ? (
            // Step 1: Select Role
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Role</label>
                <Select 
                  value={selectedRole} 
                  onValueChange={(value) => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name}
                        {mobileOnlyRoles.includes(role.name) && (
                          <span className="ml-2 text-xs text-gray-500">(Mobile Only)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {mobileOnlyRoles.includes(selectedRole) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    This is a mobile-only role. No web login credentials are required.
                  </p>
                </div>
              )}
              
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          ) : (
            // Step 2: Login Method Selection
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Login Method</label>
                <RadioGroup 
                  value={loginMethod} 
                  onValueChange={(value) => setLoginMethod(value as "employeeId" | "email")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employeeId" id="employeeId" />
                    <label htmlFor="employeeId" className="text-sm">
                      Employee ID: {employee.employeeId}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="email" 
                      id="email" 
                      disabled={!employee.email}
                    />
                    <label 
                      htmlFor="email" 
                      className={`text-sm ${!employee.email ? "text-gray-400" : ""}`}
                    >
                      Email ID: {employee.email || "Not available"}
                    </label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Password fields with visibility toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
          )}
        </div>
        
        <DialogFooter>
          {step === 1 ? (
            // Step 1 Footer
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleContinue}>
                {mobileOnlyRoles.includes(selectedRole) ? "Assign" : "Continue"}
              </Button>
            </>
          ) : (
            // Step 2 Footer
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
