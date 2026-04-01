
export interface AttendanceEmployee {
  id: number;
  employeeId: string;
  name: string;
  role: string;
  project?: string;
  projectId?: number;
  location?: string;
  locationId?: number;
  checkInTime: string;
  imageUrl: string;
  classification: string;
  category: string;
  status: "checkedin" | "notcheckedin";
  activeStatus: "Active" | "Inactive";
  entity?: string;
  attendanceDate?: Date;
  checkedInProject?: string;
  exceptionReason?: string;
  exceptionResolved?: boolean;
  exceptionResolvedDate?: Date;
  checkedOutDate?: Date;
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

export interface AttendanceProject {
  id: number;
  name: string;
  location?: string;
  coordinates?: { geofenceData: string };
}
