
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const TANSEEQ_PROJECTS = [
  {
    id: "tp1",
    entity: "Tanseeq Investment",
    projectId: "TAN001",
    name: "Smart City Development",
    location: "Dubai South",
    startDate: "2024-06-01",
    endDate: "2025-12-31",
  },
  {
    id: "tp2",
    entity: "Tanseeq Landscaping LLC",
    projectId: "TAN002",
    name: "Green Corridor Project",
    location: null,
    startDate: "2024-07-15",
    endDate: "2025-06-30",
  }
];

interface TanseeqProjectsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: any[]) => void;
}

export default function TanseeqProjectsImportModal({ isOpen, onClose, onImport }: TanseeqProjectsImportModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [fetchComplete, setFetchComplete] = useState(false);

  const handleFetch = () => {
    setLoading(true);
    setTimeout(() => {
      setProjects(TANSEEQ_PROJECTS);
      setLoading(false);
      setFetchComplete(true);
    }, 2000);
  };

  const toggleProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleImport = () => {
    const selectedProjectsData = projects.filter(p => selectedProjects.has(p.id));
    onImport(selectedProjectsData);
    onClose();
    setProjects([]);
    setSelectedProjects(new Set());
    setFetchComplete(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setProjects([]);
      setSelectedProjects(new Set());
      setFetchComplete(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import from Tanseeq API</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!fetchComplete && (
            <div className="flex justify-center">
              <Button onClick={handleFetch} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Projects...
                  </>
                ) : (
                  "Fetch Projects"
                )}
              </Button>
            </div>
          )}

          {fetchComplete && (
            <div className="space-y-4">
              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2 text-left">Project Name</th>
                      <th className="px-4 py-2 text-left">Entity</th>
                      <th className="px-4 py-2 text-left">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b">
                        <td className="px-4 py-2">
                          <Checkbox
                            checked={selectedProjects.has(project.id)}
                            onCheckedChange={() => toggleProject(project.id)}
                          />
                        </td>
                        <td className="px-4 py-2">{project.name}</td>
                        <td className="px-4 py-2">{project.entity}</td>
                        <td className="px-4 py-2">{project.location || "Not assigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {fetchComplete && (
            <Button
              onClick={handleImport}
              disabled={selectedProjects.size === 0}
            >
              Import Selected Projects
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
