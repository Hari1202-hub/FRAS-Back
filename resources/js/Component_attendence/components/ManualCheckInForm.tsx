import { useState } from "react";
import { User, MapPin, AlertCircle } from "lucide-react";
import EmployeeField from "../../Component_master/components/ManualFormFields/EmployeeField";
import ProjectField from "../../Component_master/components/ManualFormFields/ProjectField";
import TimeField from "../../Component_master/components/ManualFormFields/TimeField";
import ReasonField from "../../Component_master/components/ManualFormFields/ReasonField";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ManualCheckInFormProps {
  projects: { id: number; name: string; coordinates?: { geofenceData: string } }[];
}

const ManualCheckInForm = ({ projects }: ManualCheckInFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeId: "",
    project: "",
    checkInTime: "",
    reason: ""
  });
  
  // Location states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [assignedLocation, setAssignedLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // When project is selected, fetch assigned location
    if (field === "project" && value) {
      fetchAssignedLocation(value);
    } else if (field === "project" && !value) {
      // Reset location info if project is deselected
      setAssignedLocation(null);
      setLocationError(null);
    }
  };

  // Get assigned location for the selected project
  const fetchAssignedLocation = (projectId: string) => {
    setLocationError(null);
    setIsLoadingLocation(true);
    
    try {
      // Find the selected project
      const selectedProject = projects.find(p => p.id.toString() === projectId);
      
      // Dummy location assignment based on project
      if (selectedProject) {
        const dummyLocations: { [key: string]: string } = {
          "1": "Dubai Expo Zone - Sector 3B",
          "2": "Sheikh Zayed Road - Site 17",
          "3": "Al Quoz Industrial Area - Block C",
          "4": "Business Bay - Tower 4 Plot",
          "5": "Dubai Marina - Waterfront Development"
        };
        
        const locationName = dummyLocations[projectId] || `${selectedProject.name} Site`;
        
        setTimeout(() => {
          setIsLoadingLocation(false);
          setAssignedLocation(`Project Location: ${locationName}`);
          toast({
            title: "Location assigned",
            description: "Project's assigned location has been retrieved."
          });
        }, 500); // Short delay to simulate fetch
      } else {
        // If project doesn't exist
        setIsLoadingLocation(false);
        setLocationError("No location assigned to this project.");
      }
    } catch (error) {
      console.error("Error fetching assigned location:", error);
      setLocationError("Failed to retrieve project location. Please try again.");
      setIsLoadingLocation(false);
    }
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
    if (!formData.employeeId || !formData.project || !formData.checkInTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if location was successfully fetched
    if (!assignedLocation) {
      toast({
        title: "Location Required",
        description: "Project must have an assigned location to complete check-in",
        variant: "destructive"
      });
      return;
    }
    
    // Submit form logic would go here
    toast({
      title: "Manual Check-In Recorded",
      description: `Employee ${formData.employeeId} checked in successfully`,
    });
    
    // Reset form
    setFormData({
      employeeId: "",
      project: "",
      checkInTime: "",
      reason: ""
    });
    setAssignedLocation(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto border-2 rounded-2xl p-12 bg-white shadow-2xl animate-fade-in">
      <h3 className="text-3xl font-semibold text-gray-900 mb-10 flex items-center gap-4">
        <User className="h-10 w-10 text-proscape" />
        Manual Check In
      </h3>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Project selection comes first */}
        <ProjectField 
          projects={projects}
          value={formData.project}
          onChange={(value) => handleChange("project", value)}
        />
        
        {/* Location Status Section - only shown after project selection */}
        {formData.project && (
          <>
            {isLoadingLocation && (
              <div className="mb-4 flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-600">Retrieving assigned location...</span>
              </div>
            )}
            
            {locationError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}
            
            {assignedLocation && !locationError && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center text-green-700">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">{assignedLocation}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  This assigned location will be saved with the attendance record.
                </p>
              </div>
            )}
          </>
        )}
        
        <EmployeeField 
          label="Employee ID or Name" 
          placeholder="Enter employee ID or name" 
          value={formData.employeeId}
          onChange={(value) => handleChange("employeeId", value)}
        />
        
        <TimeField 
          label="Check In Time" 
          value={formData.checkInTime}
          onChange={(value) => handleChange("checkInTime", value)}
        />
        
        <ReasonField 
          label="Reason for Manual Check In" 
          placeholder="Enter reason" 
          value={formData.reason}
          onChange={(value) => handleChange("reason", value)}
        />
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-proscape hover:bg-proscape-dark text-white px-10 py-4 rounded-xl text-xl font-medium transition-colors shadow-md"
            disabled={isLoadingLocation || !assignedLocation}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualCheckInForm;
