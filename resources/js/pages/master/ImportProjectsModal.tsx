
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_URL =
  "https://docs.google.com/spreadsheets/d/1Yv8w9K9tQMVOuO7A4tuL0k5cF_fmY7Fsj6t4HZH7vmfM/export?format=csv";

export default function ImportProjectsModal({ open, onOpenChange, onImport }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Projects</DialogTitle>
          <DialogDescription>
            Upload a CSV or XLS file using the template below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <label
            htmlFor="project-import"
            className="flex items-center gap-2 bg-proscape/10 border-dashed border-2 border-proscape rounded-md px-4 py-3 cursor-pointer hover:bg-proscape/20 transition"
          >
            <Upload className="h-5 w-5 text-proscape" />
            <span className="text-proscape font-medium">Choose File</span>
            <input
              id="project-import"
              type="file"
              accept=".csv, .xls, .xlsx"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <div className="text-sm text-gray-800 mt-1">
              Selected file: <span className="font-medium">{file.name}</span>
            </div>
          )}
          <a
            href={SAMPLE_URL}
            target="_blank"
            className="text-xs text-proscape underline underline-offset-2 hover:text-proscape-dark"
            rel="noopener noreferrer"
          >
            Download sample template
          </a>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </DialogClose>
          <Button
            className="bg-proscape hover:bg-proscape-dark text-white"
            onClick={() => {
              onImport();
              setFile(null);
            }}
            disabled={!file}
            type="button"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
