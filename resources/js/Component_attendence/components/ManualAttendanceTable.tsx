import React from "react";

interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  category: string;
  classification: string;
  status: string;
  checkInProject: string;
  entity: string;
}

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    employeeId: "EMP123",
    employeeName: "John Doe",
    category: "Engineer",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project A",
    entity: "Tanseeq LLC"
  },
  {
    id: 2,
    employeeId: "EMP456",
    employeeName: "Jane Smith",
    category: "Technician",
    classification: "Laborer",
    status: "Inactive",
    checkInProject: "Project B",
    entity: "Test Company"
  },
  {
    id: 3,
    employeeId: "EMP789",
    employeeName: "Alice Johnson",
    category: "Manager",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project C",
    entity: "Example Inc"
  },
  {
    id: 4,
    employeeId: "EMP101",
    employeeName: "Bob Williams",
    category: "Supervisor",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project A",
    entity: "Tanseeq LLC"
  },
  {
    id: 5,
    employeeId: "EMP112",
    employeeName: "Charlie Brown",
    category: "Operator",
    classification: "Laborer",
    status: "Inactive",
    checkInProject: "Project B",
    entity: "Test Company"
  },
  {
    id: 6,
    employeeId: "EMP131",
    employeeName: "Diana Miller",
    category: "Analyst",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project C",
    entity: "Example Inc"
  },
  {
    id: 7,
    employeeId: "EMP415",
    employeeName: "Eva Davis",
    category: "Assistant",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project A",
    entity: "Tanseeq LLC"
  },
  {
    id: 8,
    employeeId: "EMP161",
    employeeName: "Frank White",
    category: "Driver",
    classification: "Laborer",
    status: "Inactive",
    checkInProject: "Project B",
    entity: "Test Company"
  },
  {
    id: 9,
    employeeId: "EMP178",
    employeeName: "Grace Taylor",
    category: "Coordinator",
    classification: "Staff",
    status: "Active",
    checkInProject: "Project C",
    entity: "Example Inc"
  },
  {
    id: 10,
    employeeId: "EMP109",
    employeeName: "Hank Moore",
    category: "Mechanic",
    classification: "Laborer",
    status: "Active",
    checkInProject: "Project A",
    entity: "Tanseeq LLC"
  }
];
