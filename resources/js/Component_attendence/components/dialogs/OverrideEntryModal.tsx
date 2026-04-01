import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OverrideEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  date: Date;
  projects: { id: number; name: string }[];
}

export const OverrideEntryModal = ({ isOpen, onClose, employee, date, projects }: OverrideEntryModalProps) => {
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  
  const handleSubmit = () => {
    if (!checkInTime || !checkOutTime || !selectedProject) {
      toast.error("Missing fields", {
        description: "Please fill in all fields."
      });
      return;
    }
    
    // Find the selected project name
    const projectName = projects.find(project => project.id.toString() === selectedProject)?.name;
    
    toast.success("Attendance Overridden", {
      description: `Attendance for ${employee.employeeName} has been overridden for ${format(date, "PPP")}. Project: ${projectName}, Check-in: ${checkInTime}, Check-out: ${checkOutTime}`
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Override Attendance Entry</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="employeeName">Employee Name</Label>
            <Input id="employeeName" value={employee?.employeeName} disabled />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-[240px] pl-3 text-left font-normal" +
                    (selectedDate ? " text-foreground" : " text-muted-foreground")
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="checkInTime">Check-In Time</Label>
            <Input
              id="checkInTime"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              placeholder="Enter check-in time"
            />
          </div>
          <div>
            <Label htmlFor="checkOutTime">Check-Out Time</Label>
            <Input
              id="checkOutTime"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              placeholder="Enter check-out time"
            />
          </div>
          <div>
            <Label htmlFor="project">Project</Label>
            <select
              id="project"
              className="w-full border rounded-md py-2 px-3"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id.toString()}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
