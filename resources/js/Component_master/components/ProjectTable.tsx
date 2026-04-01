
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MapPin, Trash2 } from "lucide-react";

interface ProjectTableProps {
  projects: any[];
  onView: (project: any) => void;
  onDelete: (project: any) => void;
  onAssignLocation: (project: any) => void;
}

export default function ProjectTable({ projects, onView, onDelete, onAssignLocation }: ProjectTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project,index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{project.projectid}</TableCell>
            <TableCell>{project.projectname}</TableCell>
            <TableCell>{project.entity.entityname}</TableCell>
            <TableCell>
              {project.location_shotname ? (
                <span className="text-green-600">{project.location_shotname}</span>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Not Assigned
                </Badge>
              )}
            </TableCell>
            <TableCell>{project.startdate}</TableCell>
            <TableCell>{project.enddate}</TableCell>
            <TableCell>
              <Badge 
                variant={project.isactive === true ? "default" : "secondary"}
                className={project.isactive === true ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {project.isactive?'Active':'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(project)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAssignLocation(project)}
                  className="h-8 w-8 p-0"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(project)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
