
import { AttendanceFilters } from "../types/attendance";

const mockAttendanceRecords = [
  {
    id: 1,
    employeeId: "EMP123",
    employeeName: "John Doe",
    category: "Engineer",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project A",
    entity: "Tanseeq LLC"
  }
];

// Initial filter state
export const initialFilters: AttendanceFilters = {
  employeeId: "",
  name: "",
  category: "all",
  classification: "all",
  status: "all",
  project: "all",
  entity: "all"
};

// Updated status options to match the new attendance types
export const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Present (Visa/ID)", label: "Present (Visa/ID)" },
  { value: "Exception", label: "Exception" }
];

// Filter attendance records based on filter criteria
export const filterRecords = (filters: AttendanceFilters) => {
  return mockAttendanceRecords.filter(record => {
    if (filters.employeeId && !record.employeeId.includes(filters.employeeId)) {
      return false;
    }
    if (filters.name && !record.employeeName.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    if (filters.category !== "all" && record.category !== filters.category) {
      return false;
    }
    if (filters.classification !== "all" && record.classification !== filters.classification) {
      return false;
    }
    if (filters.status !== "all" && record.status !== filters.status) {
      return false;
    }
    if (filters.project !== "all" && !record.checkInProject.includes(filters.project)) {
      return false;
    }
    if (filters.entity !== "all" && record.entity !== filters.entity) {
      return false;
    }
    return true;
  });
};
