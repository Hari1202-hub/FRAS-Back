
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface ImportProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: any[]) => void;
}

export default function ImportProjectsModal({ isOpen, onClose, onImport }: ImportProjectsModalProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    
    // Simulate import delay
    setTimeout(() => {
      const mockImportedProjects = [
        {
          entity: "Sample Entity 1",
          projectId: "IMP001",
          name: "Imported Project 1",
          location: "Sample Location 1",
          startDate: "2024-06-01",
          endDate: "2024-12-31",
        },
        {
          entity: "Sample Entity 2",
          projectId: "IMP002",
          name: "Imported Project 2",
          location: null,
          startDate: "2024-07-01",
          endDate: "2025-01-31",
        }
      ];
      
      onImport(mockImportedProjects);
      setIsImporting(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Import Method</Label>
            <p className="text-sm text-gray-600">Import projects from Excel file or CSV</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Click to upload file or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">Excel (.xlsx) or CSV files only</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Projects"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
