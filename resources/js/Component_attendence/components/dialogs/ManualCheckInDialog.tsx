
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { BASEURL } from "../../../app";
import { TOKEN } from "../../../app";
interface Employee {
  id: number;
  name: string;
  employeeId: string;
  role: string;
}

interface ManualCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  projects: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  selectedDate: any;
  onComplete: (projectId: string, locationId: string, time: string, reason: string) => void;
}

const ManualCheckInDialog = ({
  open,
  onOpenChange,
  employee,
  projects,
  locations,
  selectedDate,
  onComplete
}: ManualCheckInDialogProps) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (selectedProject && time) {
     
      const dateObj = new Date(selectedDate);
      const [hours, minutes] = time.split(":");
      dateObj.setHours(parseInt(hours, 10));
      dateObj.setMinutes(parseInt(minutes, 10));
      dateObj.setSeconds(0);

      // Format the result as "YYYY-MM-DD HH:mm:ss"
      const formatted = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")} ${dateObj
        .getHours()
        .toString()
        .padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}:00`;


      axios.post(BASEURL+'web_check_in_out',{type:'checkin',empguid:employee.guid,date_time:formatted,project:selectedProject}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
    })

      onComplete(selectedProject, selectedLocation, time, reason);
      // Reset form
      setSelectedProject("");
      setSelectedLocation("");
      setTime(() => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
      });
      setReason("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manual Check In</DialogTitle>
        </DialogHeader>
        
        {employee && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{employee.name}</p>
              <p className="text-sm text-gray-600">ID: {employee.user.emp_id}</p>
              {employee.roles && employee.roles.length>0 ? (
              <p className="text-sm text-gray-600">Role: 
                {employee.roles?.map((role, index) => (
                        <span key={index} className="text-sm text-gray-500">
                          {role.rolename}
                        </span>
                      ))}
              </p>
              ):''}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  
                    <SelectItem key={employee?.project?.id} value={employee?.project?.guid}>
                      {employee?.project?.projectname}
                    </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* {locations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )} */}

            <div className="space-y-2">
              <Label htmlFor="time">Check-in Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

           {/*  <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for manual check-in"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div> */}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedProject || !time}
              >
                Check In
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManualCheckInDialog;
