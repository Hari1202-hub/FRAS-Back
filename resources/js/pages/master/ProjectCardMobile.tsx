
// Create this file if it doesn't exist already
import { Eye, MapPin, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectCardMobile({
  project,
  onView,
  onDelete,
  onAssignLocation,
}: {
  project: any;
  onView: (p: any) => void;
  onDelete: (p: any) => void;
  onAssignLocation: (p: any) => void;
}) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Entity</p>
            <p className="font-medium">{project.entity || "N/A"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Project ID</p>
            <p className="font-medium">{project.projectId || project.id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Project Name</p>
          <p className="font-semibold text-proscape">{project.name}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Location</p>
          {project.location ? (
            <span className="inline-block px-2 py-0.5 rounded-full font-medium text-xs bg-proscape/10 text-proscape">
              {project.location}
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded-full font-medium text-xs bg-gray-200 text-gray-500">
              Not Configured
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="text-sm flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              {formatDate(project.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className="text-sm flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              {formatDate(project.endDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className={`inline-block px-2 py-0.5 rounded-full font-medium text-xs ${
              project.status === "Active"
                ? "bg-proscape/10 text-proscape"
                : "bg-gray-200 text-gray-500"
            }`}>
              {project.status}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onView(project)}
              className="h-8 px-2"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> View
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAssignLocation(project)}
              className="h-8 px-2"
            >
              <MapPin className="h-3.5 w-3.5 mr-1" /> Location
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
