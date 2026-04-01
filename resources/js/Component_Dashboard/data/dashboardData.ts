
import { DashboardStats, DashboardProject } from "../types/dashboard";

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 150,
  activeProjects: 8,
  todayAttendance: 142,
  pendingTasks: 23
};

export const mockDashboardProjects: DashboardProject[] = [
  {
    id: 1,
    name: "Main Building Construction",
    progress: 75,
    status: "Active"
  },
  {
    id: 2,
    name: "Bridge Expansion",
    progress: 60,
    status: "Active"
  }
];
