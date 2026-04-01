
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: number;
  name: string;
}

interface ProjectFieldProps {
  projects: Project[];
  value: string;
  onChange: (value: string) => void;
}

const ProjectField: React.FC<ProjectFieldProps> = ({ projects, value, onChange }) => {
  return (
    <div>
      <Label htmlFor="project">Project</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectField;
