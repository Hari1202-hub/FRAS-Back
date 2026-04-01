
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Hash } from "lucide-react";

interface ProjectViewModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectViewModal({ project, isOpen, onClose }: ProjectViewModalProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Project ID</label>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="font-semibold">{project.projectid}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge 
                  variant={project.isactive === true ? "default" : "secondary"}
                  className={project.isactive === true ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {project.isactive?"Active":'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Project Name</label>
            <p className="text-lg font-semibold mt-1">{project.projectname}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Entity</label>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{project.entity.entityname}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              {project.location_shotname ? (
                <span className="text-green-600">{project.location_shotname}</span>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Not Assigned
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{project.startdate}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{project.enddate}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
