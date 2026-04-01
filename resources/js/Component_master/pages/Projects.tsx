import { useState,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ProjectTable from "../components/ProjectTable";
import ProjectCardMobile from "../components/ProjectCardMobile";
import ProjectViewModal from "../components/ProjectViewModal";
import AssignLocationModal from "../components/AssignLocationModal";
import ImportProjectsModal from "../components/ImportProjectsModal";
import TanseeqProjectsImportModal from "../components/TanseeqProjectsImportModal";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";
import { toast } from "@/components/ui/use-toast";
import { DeleteProjectDialog } from "../components/DeleteProjectDialog";
export default function Projects() {
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [tanseeqImportModalOpen, setTanseeqImportModalOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState(null);
  const [entities,setEntities] = useState([]);

  const loadProjects = ()=>{
    axios.post(BASEURL+'web_get_projects',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let pojects = response.data.data;
      setProjects(pojects);
    })
  }

  const loadEntities = ()=>{
    axios.post(BASEURL+'entities',{},{
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      let entities = response.data.data;
      setEntities(entities);
    })
  }

  const filteredProjects = projects.filter(project => {
    //console.log(project);
    return project;
  });

  const handleView = (project: any) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleAssignLocation = (project: any) => {
    setSelectedProject(project);
    setLocationModalOpen(true);
  };

  const handleDelete = (project: any) => {
    setDeleteProject(project);
  };

  const handleLocationSave = (projectId: any, latitude: string, longitude: string,address:string) => {
    const postData = new FormData();
    postData.append('project_id', projectId);
    postData.append('latitude', latitude);
    postData.append('address', address);
     // Add filters to the request
    postData.append('longitude', longitude);
    axios.post(BASEURL+'update_project',postData, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
        toast({
            title: "Success",
            description: "Project updated successfully.",
          });
          loadProjects();
      setLocationModalOpen(false);
    })
  };
  const confirmDelete = () => {
    if(deleteProject){
        const formData = new FormData();
        formData.append('id',deleteProject.guid)
        axios.post(BASEURL+'delete_project', formData, {
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
        }).then(response => {
            
            toast({
              title: "Success",
              description: "Role deleted successfully.",
            });
            loadProjects();
        }).catch(error => {
            if (error.response && error.response.status === 400) {
              toast.error("Login failed");
            }
        });
    }
  }

  /* const handleImportProjects = (newProjects: any[]) => {
    const maxId = Math.max(...projects.map(p => p.id));
    const projectsToAdd = newProjects.map((project, index) => ({
      ...project
    }));
    if(projectsToAdd){
      const formData = new FormData();
      formData.append("project", JSON.stringify(projectsToAdd));
      axios.post(BASEURL+'create_project',formData,{
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
      }).then(response=>{
        loadProjects();
        //let pojects = response.data.data;
        //setProjects(pojects);
      })
    }
  }; */
  useEffect(() => {
    loadProjects();
    loadEntities();
  }, [])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track all project information</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
              placeholder="Search projects by name, ID, or entity"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="all">All Entities</option>
              {entities.map((entity1,index1) => (
                <option value={entity1.id} key={index1}>{entity1.entityname}</option>
              ))}
            </select>

            {!isMobile && (
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("grid")}
                  className="rounded-l-none border-l"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Projects Display */}
      <Card className="p-0 overflow-hidden">
        {isMobile || viewType === "grid" ? (
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map(project => (
                <ProjectCardMobile
                  key={project.id}
                  project={project}
                  onView={handleView}
                  onDelete={handleDelete}
                  onAssignLocation={handleAssignLocation}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ProjectTable
              projects={filteredProjects}
              onView={handleView}
              onDelete={handleDelete}
              onAssignLocation={handleAssignLocation}
            />
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No projects found matching the search criteria</p>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-proscape">{projects.length}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.isactive === true).length}
            </div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {projects.filter(p => !p.location_shotname).length}
            </div>
            <div className="text-sm text-gray-600">Pending Location</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{entities.length}</div>
            <div className="text-sm text-gray-600">Entities</div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <ProjectViewModal
        project={selectedProject}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      <AssignLocationModal
        project={selectedProject}
        isOpen={locationModalOpen}
         GOOGLE_MAPS_API_KEY="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"
        onClose={() => setLocationModalOpen(false)}
        onSave={handleLocationSave}
      />

     {/*  <ImportProjectsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportProjects}
      />

      <TanseeqProjectsImportModal
        isOpen={tanseeqImportModalOpen}
        onClose={() => setTanseeqImportModalOpen(false)}
        onImport={handleImportProjects}
      /> */}
      <DeleteProjectDialog 
            item={deleteProject}
            onCancel={() => setDeleteProject(null)}
            onConfirm={confirmDelete}
          />
    </div>
  );
}
