
import { useState, useMemo } from "react";
import { Upload, Eye, Trash, Search } from "lucide-react";
import ProjectFilters from "./ProjectFilters";
import ProjectTable from "./ProjectTable";
import ProjectCardMobile from "./ProjectCardMobile";
import ImportProjectsModal from "./ImportProjectsModal";
import TanseeqImportModal from "./TanseeqProjectsImportModal";
import ProjectViewModal from "./ProjectViewModal";
import DeleteProjectDialog from "./DeleteProjectDialog";
import AssignLocationModal from "./AssignLocationModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const DUMMY_PROJECTS = [
  {
    id: "1",
    projectId: "P001",
    name: "Main Building Construction",
    location: "Downtown Site",
    entity: "Tanseeq Construction Ltd",
    assignedEmployees: [
      { id: "e1", name: "John Smith" },
      { id: "e2", name: "Sarah Johnson" }
    ],
    startDate: "2024-12-20",
    endDate: "2025-02-20",
    status: "Active"
  },
  {
    id: "2",
    projectId: "P002",
    name: "Bridge Expansion",
    location: "Bridge Zone A",
    entity: "Tanseeq Engineering Co",
    assignedEmployees: [{ id: "e3", name: "Emily Davis" }],
    startDate: "2025-01-15",
    endDate: "2025-06-01",
    status: "Inactive"
  },
  {
    id: "3",
    projectId: "P003",
    name: "Warehouse Project",
    location: "East Industrial",
    entity: "Tanseeq Landscaping LLC",
    assignedEmployees: [{ id: "e4", name: "Robert Williams" }],
    startDate: "2025-02-10",
    endDate: "2025-04-01",
    status: "Active"
  }
];

const DUMMY_EMPLOYEES = [
  { id: "e1", name: "John Smith" },
  { id: "e2", name: "Sarah Johnson" },
  { id: "e3", name: "Emily Davis" },
  { id: "e4", name: "Robert Williams" },
  { id: "e5", name: "Brian Carson" },
  { id: "e6", name: "Amy Howard" }
];

const DUMMY_LOCATIONS = [
  "Downtown Site", "Bridge Zone A", "East Industrial", "North Express", "Greenfield", "Central Med"
];

const DUMMY_IMPORTED_PROJECTS = [
  {
    id: "np101",
    projectId: "P004",
    name: "Highway Renovation",
    location: "North Express",
    entity: "Tanseeq Construction Ltd",
    assignedEmployees: [
      { id: "e5", name: "Brian Carson" },
      { id: "e6", name: "Amy Howard" }
    ],
    startDate: "2025-03-10",
    endDate: "2025-09-15",
    status: "Active"
  },
  {
    id: "np102",
    projectId: "P005",
    name: "School Campus",
    location: "Greenfield",
    entity: "Tanseeq Engineering Co",
    assignedEmployees: [{ id: "e2", name: "Sarah Johnson" }],
    startDate: "2025-07-01",
    endDate: "2026-02-15",
    status: "Inactive"
  },
  {
    id: "np103",
    projectId: "P006",
    name: "Hospital Wing",
    location: "Central Med",
    entity: "Tanseeq Landscaping LLC",
    assignedEmployees: [
      { id: "e4", name: "Robert Williams" },
      { id: "e3", name: "Emily Davis" }
    ],
    startDate: "2025-05-15",
    endDate: "2026-01-10",
    status: "Active"
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(DUMMY_PROJECTS);
  const [filters, setFilters] = useState({
    name: "",
    location: "",
    entity: "",
    status: "All",
    fromDate: null,
    toDate: null
  });
  const [importOpen, setImportOpen] = useState(false);
  const [tanseeqImportOpen, setTanseeqImportOpen] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [locationProject, setLocationProject] = useState(null);
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.name && !p.name.toLowerCase().includes(filters.name.trim().toLowerCase()) && 
          !p.projectId?.toLowerCase().includes(filters.name.trim().toLowerCase())) 
        return false;
      
      if (filters.entity && !p.entity?.toLowerCase().includes(filters.entity.trim().toLowerCase()))
        return false;
        
      if (filters.location && filters.location !== "" && p.location !== filters.location) 
        return false;
      
      if (filters.status && filters.status !== "All" && p.status !== filters.status) 
        return false;
      
      // Filter by from date
      if (filters.fromDate) {
        const projectStartDate = new Date(p.startDate);
        const fromDate = new Date(filters.fromDate);
        if (projectStartDate < fromDate) {
          return false;
        }
      }
      
      // Filter by to date
      if (filters.toDate) {
        const projectEndDate = new Date(p.endDate);
        const toDate = new Date(filters.toDate);
        if (projectEndDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [projects, filters]);

  const handleImport = () => {
    setProjects(prev => [
      ...prev,
      ...DUMMY_IMPORTED_PROJECTS.map(p => ({
        ...p,
        id: p.id + "-" + Math.random().toString(36).substring(2, 6)
      }))
    ]);
    setImportOpen(false);
  };

  const handleTanseeqImport = (tanseeqProjects) => {
    const maxId = Math.max(...projects.map(p => Number(p.id)));
    
    const projectsToAdd = tanseeqProjects.map((project, index) => ({
      id: String(maxId + index + 1),
      name: project.name,
      location: project.location,
      assignedEmployees: [],
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status === "Approved" ? "Active" : "Inactive"
    }));
    
    setProjects([...projects, ...projectsToAdd]);
  };

  const handleDelete = (project) => {
    setProjects((prev) => prev.filter(p => p.id !== project.id));
    setDeleteProject(null);
  };

  const handleAssignLocation = (projectId: string, geofenceData: string, locationName: string) => {
    setProjects(prev => 
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            location: locationName, // Store the location name
            coordinates: {
              geofenceData
            }
          };
        }
        return p;
      })
    );
  };

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  return (
    <div className="space-y-5 px-1 pt-5">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 md:mb-0">Projects</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <Button
            className="bg-proscape hover:bg-proscape-dark text-white font-medium flex gap-2"
            onClick={() => setTanseeqImportOpen(true)}
          >
            <Upload className="w-4 h-4" /> Import from Tanseeq API
          </Button>
        </div>
      </div>
      <ProjectFilters
        filters={filters}
        setFilters={setFilters}
        locations={DUMMY_LOCATIONS}
      />
      <div>
        <div className="hidden md:block">
          <ProjectTable
            projects={filteredProjects}
            onView={setViewProject}
            onDelete={setDeleteProject}
            onAssignLocation={setLocationProject}
          />
        </div>
        <div className="block md:hidden">
          {filteredProjects.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No projects found</Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <ProjectCardMobile
                  key={project.id}
                  project={project}
                  onView={setViewProject}
                  onDelete={setDeleteProject}
                  onAssignLocation={setLocationProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ImportProjectsModal 
        open={importOpen} 
        onOpenChange={setImportOpen} 
        onImport={handleImport} 
      />
      <TanseeqImportModal
        open={tanseeqImportOpen}
        onOpenChange={setTanseeqImportOpen}
        onImport={handleTanseeqImport}
      />
      <ProjectViewModal 
        project={viewProject} 
        onClose={() => setViewProject(null)} 
      />
      <DeleteProjectDialog 
        project={deleteProject} 
        onCancel={() => setDeleteProject(null)} 
        onConfirm={() => handleDelete(deleteProject)} 
      />
      <AssignLocationModal
        project={locationProject}
        open={!!locationProject}
        onOpenChange={(open) => !open && setLocationProject(null)}
        onSave={handleAssignLocation}
      />
    </div>
  );
}
