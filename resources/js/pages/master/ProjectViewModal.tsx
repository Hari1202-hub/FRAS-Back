
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectViewModal({ project, onClose }: { project: any, onClose: () => void }) {
  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-proscape">{project.name}</DialogTitle>
          <DialogDescription>Project Details</DialogDescription>
        </DialogHeader>
        <div className="text-sm space-y-3 py-2">
          <div>
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            <span>{project.location}</span>
          </div>
          <div className="flex gap-2">
            <div>
              <span className="font-semibold text-gray-700">Start:</span>{" "}
              {formatDate(project.startDate)}
            </div>
            <div>
              <span className="font-semibold text-gray-700">End:</span>{" "}
              {formatDate(project.endDate)}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Assigned Employees:</span>
            <ul className="list-disc pl-5 text-[13px]">
              {project.assignedEmployees && project.assignedEmployees.length
                ? project.assignedEmployees.map((e:any) => (
                  <li key={e.id}>{e.name}</li>
                ))
                : <li className="italic text-xs text-gray-400">None</li>
              }
            </ul>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Status:</span>{" "}
            <span className={`ml-1 px-2 py-0.5 rounded-full font-medium text-xs ${project.status === "Active"
              ? "bg-proscape/10 text-proscape"
              : "bg-gray-200 text-gray-500"
            }`}>{project.status}</span>
          </div>
        </div>
        <Button variant="outline" className="mt-2" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
