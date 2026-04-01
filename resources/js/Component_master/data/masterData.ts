
import { MasterProject, MasterEmployee, MasterRole } from "../types/master";

export const masterMockProjects: MasterProject[] = [
  {
    id: 1,
    name: "Main Building Construction",
    location: "Site A",
    coordinates: { geofenceData: "25.2048,55.2708,100" },
    status: "Active",
    description: "Main construction project for the new building"
  },
  {
    id: 2,
    name: "Bridge Expansion Project",
    location: "Site B", 
    coordinates: { geofenceData: "25.2548,55.3008,150" },
    status: "Active",
    description: "Expansion of the existing bridge infrastructure"
  }
];

export const masterMockEmployees: MasterEmployee[] = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "John Doe",
    role: "Project Manager",
    department: "Construction",
    status: "Active",
    classification: "Staff",
    category: "Management",
    entity: "Tanseeq Construction Ltd",
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Jane Smith",
    role: "Engineer",
    department: "Engineering",
    status: "Active",
    classification: "Staff",
    category: "Technical",
    entity: "Tanseeq Engineering Co",
    imageUrl: "https://randomuser.me/api/portraits/women/1.jpg"
  }
];
