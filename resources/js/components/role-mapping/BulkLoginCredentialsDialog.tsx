
import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeCredential {
  id: number;
  employeeId: string;
  name: string;
  email?: string;
  loginMethod?: "employeeId" | "email";
  status: "pending" | "complete";
}

interface BulkLoginCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: {
    id: number;
    name: string;
    employeeId: string;
    email?: string;
    currentLoginMethod?: "employeeId" | "email";
  }[];
}

export function BulkLoginCredentialsDialog({
  open,
  onOpenChange,
  employees,
}: BulkLoginCredentialsDialogProps) {
  const [employeesData, setEmployeesData] = useState<EmployeeCredential[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Initialize employeesData when the dialog opens
  useEffect(() => {
    if (open && employees.length > 0) {
      const initialData = employees.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        // Set initial login method based on availability
        loginMethod: emp.currentLoginMethod || 
                     (emp.email ? "email" : "employeeId"),
        status: "pending" as const
      }));
      
      setEmployeesData(initialData);
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [employees, open]);

  const handleLoginMethodChange = (employeeId: number, method: "employeeId" | "email") => {
    setEmployeesData(prev => 
      prev.map(emp => 
        emp.id === employeeId ? { ...emp, loginMethod: method } : emp
      )
    );
  };

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
    
    // Check if all employees have a login method selected
    const allEmployeesHaveLoginMethod = employeesData.every(emp => emp.loginMethod);
    if (!allEmployeesHaveLoginMethod) {
      toast.error("All employees must have a login method selected");
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    // In a real app, this would call an API to save the credentials for all employees
    console.log("Storing credentials for:", employeesData, password);
    
    // Count email and employeeId login methods
    const emailLogins = employeesData.filter(emp => emp.loginMethod === "email").length;
    const employeeIdLogins = employeesData.filter(emp => emp.loginMethod === "employeeId").length;
    
    // In a real app, this would trigger emails for email logins
    if (emailLogins > 0) {
      console.log(`Sending emails to ${emailLogins} employees`);
    }
    
    // Show success toast with counts
    toast.success(
      `Login created for ${employeesData.length} employees. ${emailLogins} will receive an email. ${employeeIdLogins} must be informed offline.`
    );
    
    // If there are any employeeId logins, show instructions
    if (employeeIdLogins > 0) {
      toast("Credentials created. Please share passwords offline for Employee ID logins.", {
        icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />
      });
    }
    
    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Login Credentials for Assigned Employees</DialogTitle>
          <DialogDescription>
            Configure login methods and set credentials for {employees.length} employees
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Employee Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email ID</TableHead>
                  <TableHead>Login Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeesData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email || "–"}</TableCell>
                    <TableCell>
                      <RadioGroup 
                        value={employee.loginMethod}
                        onValueChange={(value) => handleLoginMethodChange(employee.id, value as "employeeId" | "email")}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="employeeId" id={`employeeId-${employee.id}`} />
                          <Label htmlFor={`employeeId-${employee.id}`} className="text-xs">
                            Emp ID
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem 
                            value="email" 
                            id={`email-${employee.id}`} 
                            disabled={!employee.email}
                          />
                          <Label 
                            htmlFor={`email-${employee.id}`} 
                            className={!employee.email ? "text-gray-400 text-xs" : "text-xs"}
                          >
                            Email ID
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100">
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Common Credentials Section */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-4">Common Credential Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Set Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
            <Mail className="h-4 w-4 text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-700">
              Employees with Email ID login will receive an email with login instructions.
              For Employee ID logins, you'll need to share passwords offline.
            </p>
          </div>
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
