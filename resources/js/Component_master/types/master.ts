
export interface MasterEmployee {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  department?: string;
  project?: string;
  projectId?: number;
  status: "Active" | "Inactive";
  classification: string;
  category: string;
  entity?: string;
  imageUrl?: string;
  assignedProject?: string;
}

export interface MasterProject {
  id: number;
  name: string;
  location?: string;
  coordinates?: { geofenceData: string };
  status?: string;
  description?: string;
}

export interface MasterRole {
  id: number;
  name: string;
  permissions: string[];
  description?: string;
}
