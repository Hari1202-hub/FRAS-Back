
import { AttendanceEmployee, AttendanceProject } from "../types/attendance";

export const attendanceMockProjects: AttendanceProject[] = [
  {
    id: 1,
    name: "Main Building Construction",
    location: "Site A",
    coordinates: { geofenceData: "25.2048,55.2708,100" }
  },
  {
    id: 2,
    name: "Bridge Expansion Project",
    location: "Site B", 
    coordinates: { geofenceData: "25.2548,55.3008,150" }
  },
  {
    id: 3,
    name: "Highway Renovation",
    location: "Highway Site",
    coordinates: { geofenceData: "25.1948,55.2408,200" }
  },
  {
    id: 4,
    name: "Dubai Mall Expansion",
    location: "Mall Site",
    coordinates: { geofenceData: "25.1975,55.2796,120" }
  },
  {
    id: 5,
    name: "Marina Towers",
    location: "Marina Site",
    coordinates: { geofenceData: "25.0772,55.1390,180" }
  }
];

export const attendanceMockEmployees: AttendanceEmployee[] = [
  {
    id: 1,
    employeeId: "10001",
    name: "John Smith",
    role: "Construction Worker",
    category: "Carpenter",
    classification: "Laborer",
    activeStatus: "Active",
    location: "Site A",
    locationId: 1,
    status: "notcheckedin",
    checkInTime: "",
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    entity: "Tanseeq Landscaping LLC"
  },
  {
    id: 2,
    employeeId: "10002",
    name: "Sarah Johnson",
    role: "Supervisor",
    category: "Mason",
    classification: "Staff",
    activeStatus: "Active",
    location: "Site B",
    locationId: 2,
    status: "notcheckedin",
    checkInTime: "",
    imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    entity: "Tanseeq Construction Ltd"
  }
];
