import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState,useEffect } from 'react';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
import { toast } from "@/hooks/use-toast";

interface AssignProjectModalProps {
  openProject: boolean;
  onOpenProjectChange: (open: boolean) => void;
  selectEmployee:any;
  onProjectAssigned: () => void;
  projectId:any;
  assignedId:any;
}

export function AssignProjectModal({
  openProject,
  onOpenProjectChange,
  selectEmployee,
  onProjectAssigned,
  projectId,
  assignedId
}: AssignProjectModalProps) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const loadProjects = ()=>{
    axios.post(BASEURL+'web_get_projects',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let projects = response.data.data;
      setProjects(projects);
    })
  }
  const handleAssign = () => {
      console.log(selectedProject);
    if (!selectedProject || !selectEmployee?.guid) {
      alert("Please select a project.");
      return;
    }
    console.log("Project:"+selectedProject);
    console.log('Employee:'+selectEmployee.id);
    axios.post(BASEURL+'assign_project',{project_id:selectedProject,user_id:selectEmployee.id,assigned_id:assignedId},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      if(response.data.status==200){
        let projects = response.data.data;
        setSelectedProject(null);
        onOpenProjectChange(false);
        onProjectAssigned();
        toast({
            title: "Project Assigned",
            description: `Project Assigned successfully.`,
          });
      }
      else{
        toast({
            title: "Error",
            description: response.data.message.error_msg,
            variant: "destructive",
          });
      }
    })
  };
  useEffect(() => {
    if (openProject) {
      if(assignedId){
        setSelectedProject(projectId);
      }else{
        setSelectedProject(null); // Clear previous selection
      }
      loadProjects(); 
    }
    
  }, [openProject]);

  return (
    <Dialog open={openProject} onOpenChange={onOpenProjectChange}  >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Project to {selectEmployee.name}</DialogTitle>
        </DialogHeader>
        {/* Add your form or content here */}
        Select Project
        <select className="w-full border rounded-md py-2 px-3"
          onChange={(e) => {setSelectedProject(e.target.value)}} value={selectedProject || projectId || ''}>
          <option value="">Select a project</option>
          {projects.length > 0  && projects.map((project) => (
            <option key={project.id} value={project.id.toString()}>
              {project.projectid} - {project.projectname}
            </option>
          ))}
        </select>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenProjectChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedProject && !projectId}>
            Assign Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
