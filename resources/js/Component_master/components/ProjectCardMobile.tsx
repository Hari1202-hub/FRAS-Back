
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Trash2, Calendar, Building2 } from "lucide-react";

interface ProjectCardMobileProps {
  project: any;
  onView: (project: any) => void;
  onDelete: (project: any) => void;
  onAssignLocation: (project: any) => void;
}

export default function ProjectCardMobile({ project, onView, onDelete, onAssignLocation }: ProjectCardMobileProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{project.projectname}</h3>
          <p className="text-sm text-gray-600">{project.projectid}</p>
        </div>
        <Badge 
          variant={project.isactive === true ? "default" : "secondary"}
          className={project.isactive === true ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {project.isactive?'Active':'Inactive'}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{project.entity.entityname}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          {project.location_shotname ? (
            <span className="text-green-600">{project.location_shotname}</span>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Not Assigned
            </Badge>
          )}
        </div>
        {/* <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{project.startDate} - {project.endDate}</span>
        </div> */}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(project)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAssignLocation(project)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(project)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
