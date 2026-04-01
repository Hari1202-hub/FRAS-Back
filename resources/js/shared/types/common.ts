
export interface Project {
  id: number;
  name: string;
  location?: string;
  coordinates?: { geofenceData: string };
}

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  imageUrl: string;
  classification: string;
  category: string;
  status: "Active" | "Inactive";
  entity?: string;
}

export interface AttendanceFilters {
  employeeId: string;
  name: string;
  category: string;
  classification: string;
  status: string;
  project: string;
  entity: string;
}
