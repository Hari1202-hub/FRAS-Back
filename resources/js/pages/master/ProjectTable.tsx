
import { Eye, MapPin } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectTable({
  projects,
  onView,
  onDelete,
  onAssignLocation,
}: {
  projects: any[];
  onView: (p: any) => void;
  onDelete: (p: any) => void;
  onAssignLocation: (p: any) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Entity</TableHead>
          <TableHead>Project ID</TableHead>
          <TableHead>Project Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length ? (
          projects.map((project) => (
            <TableRow key={project.id}>
              {/* Entity */}
              <TableCell>{project.entity || "N/A"}</TableCell>
              
              {/* Project ID */}
              <TableCell>{project.projectId || project.id}</TableCell>
              
              {/* Project Name */}
              <TableCell className="font-medium">{project.name}</TableCell>
              
              {/* Location */}
              <TableCell>
                {project.location ? (
                  <span className="inline-block px-2 py-0.5 rounded-full font-medium text-xs bg-proscape/10 text-proscape">
                    {project.location}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full font-medium text-xs bg-gray-200 text-gray-500">
                    Not Configured
                  </span>
                )}
              </TableCell>
              
              {/* Start Date */}
              <TableCell>{formatDate(project.startDate)}</TableCell>
              
              {/* End Date */}
              <TableCell>{formatDate(project.endDate)}</TableCell>
              
              {/* Status */}
              <TableCell>
                <span className={`inline-block px-2 py-0.5 rounded-full font-medium text-xs ${
                  project.status === "Active"
                    ? "bg-proscape/10 text-proscape"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {project.status}
                </span>
              </TableCell>
              
              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="View Details"
                          onClick={() => onView(project)}
                          className="hover:bg-proscape/10 text-proscape"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">View Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Assign Location"
                          onClick={() => onAssignLocation(project)}
                          className="hover:bg-proscape/10 text-proscape"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Assign Location</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-400">No projects found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
