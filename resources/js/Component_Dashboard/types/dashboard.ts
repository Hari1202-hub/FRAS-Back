
export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  todayAttendance: number;
  pendingTasks: number;
}

export interface DashboardProject {
  id: number;
  name: string;
  progress: number;
  status: "Active" | "Completed" | "On Hold";
}
