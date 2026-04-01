
import { Card } from "@/components/ui/card";
import { Eye, Edit, Trash } from "lucide-react";

export default function ProjectCard({ project }: { project: any }) {
  const badgeClass =
    project.status === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : project.status === "Planning"
      ? "bg-purple-100 text-purple-800"
      : project.status === "On Hold"
      ? "bg-amber-100 text-amber-800"
      : project.status === "Completed"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  return (
    <Card className="p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">{project.name}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
          {project.status}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Location:</span> {project.location}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Assigned:</span>{" "}
        {(project.employees && project.employees.length > 0) ? (
          project.employees.join(", ")
        ) : (
          <span className="italic text-xs text-gray-400">None</span>
        )}
      </div>
      <div className="flex space-x-3 text-gray-500">
        <button title="View Project" className="hover:text-blue-700">
          <Eye className="h-4 w-4" />
        </button>
        <button title="Edit Project" className="hover:text-gray-700">
          <Edit className="h-4 w-4" />
        </button>
        <button title="Delete Project" className="hover:text-red-700">
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
