import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { BASEURL } from "../../../app";
import { TOKEN } from "../../../app";
interface ManualCheckOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: { id: number; name: string } | null;
  selectedDate:any,
  projects: { id: number; name: string }[];
  onComplete: (projectId: string, time: string, reason: string) => void;
}

const ManualCheckOutDialog = ({
  open,
  onOpenChange,
  employee,
  selectedDate,
  projects,
  onComplete
}: ManualCheckOutDialogProps) => {
  const [projectId, setProjectId] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (employee && projectId && time) {
      console.log(employee);
      console.log(projectId);
      console.log(time);

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


      axios.post(BASEURL+'web_check_in_out',{type:'checkout',empguid:employee.guid,date_time:formatted,project:projectId}, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
      })

      onComplete(projectId, time, reason);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manual Check Out</DialogTitle>
          <DialogDescription>
            Mark attendance for <b>{employee?.name}</b>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project
            </Label>
            <Select onValueChange={setProjectId} defaultValue={projectId} >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem key={employee?.project?.id} value={employee?.project?.guid}>
                    {employee?.project?.projectname}
                  </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input id="time" value={time} onChange={(e) => setTime(e.target.value)} className="col-span-3" type="time" />
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3" />
          </div> */}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Mark Attendance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualCheckOutDialog;
