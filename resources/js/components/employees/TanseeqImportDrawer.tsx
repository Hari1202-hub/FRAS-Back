
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CloudDownload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTanseeqEmployees, departments, projects } from "./tanseeq-mock-data";
import { useToast } from "@/hooks/use-toast";

interface TanseeqImportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (employees: typeof mockTanseeqEmployees) => void;
}

export function TanseeqImportDrawer({ 
  open, 
  onOpenChange,
  onImportComplete 
}: TanseeqImportDrawerProps) {
  const [department, setDepartment] = useState("All Departments");
  const [project, setProject] = useState("All Projects");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedEmployees, setFetchedEmployees] = useState<typeof mockTanseeqEmployees | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFetch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const employees = mockTanseeqEmployees;
      setFetchedEmployees(employees);
      setSelectedEmployees(employees.map(emp => emp.id));
      setIsLoading(false);
    }, 2000);
  };

  const handleSelectEmployee = (checked: boolean, employeeId: string) => {
    setSelectedEmployees(prev => 
      checked 
        ? [...prev, employeeId]
        : prev.filter(id => id !== employeeId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedEmployees(
      checked && fetchedEmployees 
        ? fetchedEmployees.map(emp => emp.id)
        : []
    );
  };

  const handleImport = () => {
    if (fetchedEmployees) {
      const selectedRecords = fetchedEmployees
        .filter(emp => selectedEmployees.includes(emp.id))
        .map(emp => {
          // Automatically assign roles based on classification
          let assignedRole = null;
          if (emp.classification === "Laborer") {
            assignedRole = "Labour";
          } else if (emp.classification === "Staff") {
            assignedRole = "Staff";
          }

          return {
            ...emp,
            // If there's an assigned role based on classification, set it
            role: assignedRole || emp.role
          };
        });

      onImportComplete(selectedRecords);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${selectedRecords.length} employees from Tanseeq.`,
      });
      
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Import Employees from Tanseeq API</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Use this tool to import employee records directly from the Tanseeq system.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(proj => (
                    <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleFetch}
              disabled={isLoading}
              className="w-full bg-proscape hover:bg-proscape-dark"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Employees...
                </>
              ) : (
                <>
                  <CloudDownload className="mr-2 h-4 w-4" />
                  Fetch Employees
                </>
              )}
            </Button>
          </div>

          {fetchedEmployees && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 py-2 px-2 bg-gray-50 rounded-md">
                <Checkbox 
                  checked={selectedEmployees.length === fetchedEmployees.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label 
                  htmlFor="select-all" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All Records
                </label>
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-4 space-y-4">
                  {fetchedEmployees.map((employee) => (
                    <div 
                      key={employee.id} 
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
                    >
                      <Checkbox 
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => 
                          handleSelectEmployee(checked as boolean, employee.id)
                        }
                        id={employee.id}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor={employee.id}
                          className="text-sm font-medium leading-none"
                        >
                          {employee.name}
                        </label>
                        <p className="text-sm text-gray-500">
                          {employee.employeeId} · {employee.role} · {employee.classification}
                        </p>
                        <p className="text-sm text-gray-500">
                          {employee.project} · {employee.location}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {employee.classification === "Laborer" ? "Will be assigned Labour role" : 
                           employee.classification === "Staff" ? "Will be assigned Staff role" : 
                           "No default role will be assigned"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedEmployees.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Import Selected ({selectedEmployees.length})
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
