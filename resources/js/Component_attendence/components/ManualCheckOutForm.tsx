import { useState } from "react";
import { User } from "lucide-react";
import EmployeeField from "../../Component_master/components/ManualFormFields/EmployeeField";
import ProjectField from "../../Component_master/components/ManualFormFields/ProjectField";
import TimeField from "../../Component_master/components/ManualFormFields/TimeField";
import ReasonField from "../../Component_master/components/ManualFormFields/ReasonField";
import { useToast } from "@/hooks/use-toast";

interface ManualCheckOutFormProps {
  projects: { id: number; name: string }[];
}

const ManualCheckOutForm = ({ projects }: ManualCheckOutFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeId: "",
    project: "",
    checkOutTime: "",
    reason: ""
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate employee ID is numeric
    if (formData.employeeId && !/^\d+$/.test(formData.employeeId)) {
      toast({
        title: "Invalid Employee ID",
        description: "Employee ID must contain only numeric values",
        variant: "destructive"
      });
      return;
    }
    
    // Validation (simplified)
    if (!formData.employeeId || !formData.project || !formData.checkOutTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Submit form logic would go here
    toast({
      title: "Manual Check-Out Recorded",
      description: `Employee ${formData.employeeId} checked out successfully`,
    });
    
    // Reset form
    setFormData({
      employeeId: "",
      project: "",
      checkOutTime: "",
      reason: ""
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto border-2 rounded-2xl p-12 bg-white shadow-2xl animate-fade-in">
      <h3 className="text-3xl font-semibold text-gray-900 mb-10 flex items-center gap-4">
        <User className="h-10 w-10 text-proscape" />
        Manual Check Out
      </h3>
      <form className="space-y-8" onSubmit={handleSubmit}>
        <EmployeeField 
          label="Employee ID or Name" 
          placeholder="Enter employee ID or name"
          value={formData.employeeId}
          onChange={(value) => handleChange("employeeId", value)}
        />
        <ProjectField 
          projects={projects}
          value={formData.project}
          onChange={(value) => handleChange("project", value)}
        />
        <TimeField 
          label="Check Out Time"
          value={formData.checkOutTime}
          onChange={(value) => handleChange("checkOutTime", value)}
        />
        <ReasonField 
          label="Reason for Manual Check Out" 
          placeholder="Enter reason"
          value={formData.reason}
          onChange={(value) => handleChange("reason", value)}
        />
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-proscape hover:bg-proscape-dark text-white px-10 py-4 rounded-xl text-xl font-medium transition-colors shadow-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualCheckOutForm;
