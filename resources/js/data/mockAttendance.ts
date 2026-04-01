/**
 * Mock attendance data for reports 
 * Features:
 * - 10+ employees with multiple records
 * - Records spanning multiple dates
 * - Some overtime values
 * - Multiple projects per employee
 * - Different attendance modes (Face/Manual)
 */
export const MOCK_ATTENDANCE_DATA: {
  id: number;
  employeeId: string;
  name: string;
  entity: string;
  classification: string;
  category: string;
  project: string;
  date: string;
  checkIn: string;
  checkInMode: "Face" | "Manual";
  checkOut: string;
  checkOutMode: "Face" | "Manual";
  location?: string; // Added location as optional property
}[] = [
  // Employee 1: John Smith - Multiple dates and projects
  {
    id: 1,
    employeeId: "EMP001",
    name: "John Smith",
    entity: "Tanseeq Construction",
    classification: "Staff",
    category: "Engineer",
    project: "Main Building Construction",
    date: "2025-04-22",
    checkIn: "08:30 AM",
    checkInMode: "Face",
    checkOut: "05:45 PM", // Overtime
    checkOutMode: "Face"
  },
  
  // Employee 2: Sarah Johnson - Multiple dates and projects
  {
    id: 4,
    employeeId: "EMP002",
    name: "Sarah Johnson",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Mason",
    project: "Bridge Expansion",
    date: "2025-04-22",
    checkIn: "07:45 AM",
    checkInMode: "Face",
    checkOut: "04:30 PM",
    checkOutMode: "Face"
  },
  {
    id: 5,
    employeeId: "EMP002",
    name: "Sarah Johnson",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Mason",
    project: "Commercial Complex",
    date: "2025-04-23",
    checkIn: "07:30 AM",
    checkInMode: "Face",
    checkOut: "05:15 PM", // Slight overtime
    checkOutMode: "Manual"
  },
  {
    id: 6,
    employeeId: "EMP002",
    name: "Sarah Johnson",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Mason",
    project: "Bridge Expansion",
    date: "2025-04-24",
    checkIn: "07:45 AM",
    checkInMode: "Face", 
    checkOut: "04:15 PM",
    checkOutMode: "Face"
  },
  
  // Employee 3: Mohammed Al Farsi - Multiple dates and projects
  {
    id: 7,
    employeeId: "EMP003",
    name: "Mohammed Al Farsi",
    entity: "Tanseeq Construction",
    classification: "Staff",
    category: "Supervisor",
    project: "Main Building Construction",
    date: "2025-04-22",
    checkIn: "07:30 AM",
    checkInMode: "Face",
    checkOut: "06:45 PM", // Significant overtime
    checkOutMode: "Face"
  },
  {
    id: 8,
    employeeId: "EMP003", 
    name: "Mohammed Al Farsi",
    entity: "Tanseeq Construction",
    classification: "Staff",
    category: "Supervisor",
    project: "Main Building Construction",
    date: "2025-04-23",
    checkIn: "07:45 AM",
    checkInMode: "Face",
    checkOut: "06:30 PM", // Overtime
    checkOutMode: "Face"
  },
  {
    id: 9,
    employeeId: "EMP003",
    name: "Mohammed Al Farsi",
    entity: "Tanseeq Construction",
    classification: "Staff",
    category: "Supervisor",
    project: "Highway Project",
    date: "2025-04-23", // Same day, different project
    checkIn: "07:00 PM",
    checkInMode: "Manual",
    checkOut: "09:00 PM", // Evening shift
    checkOutMode: "Manual"
  },
  
  // Employee 4: Lisa Wong - Multiple dates
  {
    id: 10,
    employeeId: "EMP004",
    name: "Lisa Wong",
    entity: "Beta Services Ltd",
    classification: "Laborer",
    category: "Carpenter",
    project: "Interior Finishing",
    date: "2025-04-22",
    checkIn: "08:00 AM",
    checkInMode: "Manual",
    checkOut: "04:45 PM",
    checkOutMode: "Manual"
  },
  {
    id: 11,
    employeeId: "EMP004",
    name: "Lisa Wong",
    entity: "Beta Services Ltd",
    classification: "Laborer",
    category: "Carpenter",
    project: "Interior Finishing",
    date: "2025-04-24",
    checkIn: "08:15 AM",
    checkInMode: "Face",
    checkOut: "04:30 PM",
    checkOutMode: "Face"
  },
  
  // Employee 5: Ahmed Hassan - Multiple projects same day
  {
    id: 12,
    employeeId: "EMP005",
    name: "Ahmed Hassan",
    entity: "Tanseeq Engineering",
    classification: "Staff",
    category: "Engineer",
    project: "Highway Project",
    date: "2025-04-22",
    checkIn: "08:00 AM",
    checkInMode: "Face",
    checkOut: "12:30 PM", // Half day
    checkOutMode: "Face"
  },
  {
    id: 13,
    employeeId: "EMP005",
    name: "Ahmed Hassan",
    entity: "Tanseeq Engineering",
    classification: "Staff", 
    category: "Engineer",
    project: "Bridge Expansion",
    date: "2025-04-22", // Same day, different project
    checkIn: "01:30 PM",
    checkInMode: "Face",
    checkOut: "05:30 PM",
    checkOutMode: "Face"
  },
  {
    id: 14,
    employeeId: "EMP005",
    name: "Ahmed Hassan",
    entity: "Tanseeq Engineering",
    classification: "Staff",
    category: "Engineer",
    project: "Highway Project",
    date: "2025-04-23",
    checkIn: "08:15 AM",
    checkInMode: "Face",
    checkOut: "06:30 PM", // Overtime
    checkOutMode: "Manual"
  },
  
  // Employee 6: Maria Rodriguez - Multiple dates
  {
    id: 15,
    employeeId: "EMP006",
    name: "Maria Rodriguez",
    entity: "Beta Services Ltd",
    classification: "Supervisor",
    category: "Supervisor",
    project: "Stadium Renovation",
    date: "2025-04-22",
    checkIn: "07:30 AM",
    checkInMode: "Face",
    checkOut: "05:30 PM",
    checkOutMode: "Face"
  },
  {
    id: 16,
    employeeId: "EMP006",
    name: "Maria Rodriguez",
    entity: "Beta Services Ltd",
    classification: "Supervisor",
    category: "Supervisor",
    project: "Stadium Renovation",
    date: "2025-04-23",
    checkIn: "07:45 AM",
    checkInMode: "Face",
    checkOut: "07:15 PM", // Significant overtime
    checkOutMode: "Face"
  },
  
  // Employee 7: Raj Patel - Multiple dates
  {
    id: 17,
    employeeId: "EMP007",
    name: "Raj Patel",
    entity: "Tanseeq Construction",
    classification: "Laborer",
    category: "Electrician",
    project: "Hospital Wing",
    date: "2025-04-22",
    checkIn: "08:00 AM",
    checkInMode: "Manual",
    checkOut: "04:30 PM",
    checkOutMode: "Manual"
  },
  {
    id: 18,
    employeeId: "EMP007",
    name: "Raj Patel",
    entity: "Tanseeq Construction",
    classification: "Laborer",
    category: "Electrician",
    project: "Commercial Complex",
    date: "2025-04-23",
    checkIn: "08:15 AM",
    checkInMode: "Face",
    checkOut: "05:45 PM", // Slight overtime
    checkOutMode: "Face"
  },
  {
    id: 19,
    employeeId: "EMP007",
    name: "Raj Patel",
    entity: "Tanseeq Construction",
    classification: "Laborer",
    category: "Electrician",
    project: "Hospital Wing",
    date: "2025-04-24",
    checkIn: "08:00 AM",
    checkInMode: "Face",
    checkOut: "04:45 PM",
    checkOutMode: "Face"
  },
  
  // Employee 8: Fatima Al Zahra - Multiple dates and projects
  {
    id: 20,
    employeeId: "EMP008",
    name: "Fatima Al Zahra",
    entity: "Delta Operations",
    classification: "Staff",
    category: "Engineer",
    project: "Highway Project",
    date: "2025-04-22",
    checkIn: "08:30 AM",
    checkInMode: "Face",
    checkOut: "05:30 PM", // Regular hours
    checkOutMode: "Face"
  },
  {
    id: 21,
    employeeId: "EMP008",
    name: "Fatima Al Zahra",
    entity: "Delta Operations",
    classification: "Staff",
    category: "Engineer",
    project: "Bridge Expansion",
    date: "2025-04-23",
    checkIn: "08:00 AM",
    checkInMode: "Face",
    checkOut: "07:00 PM", // Significant overtime
    checkOutMode: "Manual"
  },
  
  // Employee 9: Chen Wei - Multiple dates
  {
    id: 22,
    employeeId: "EMP009",
    name: "Chen Wei",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Painter",
    project: "Interior Finishing",
    date: "2025-04-22",
    checkIn: "07:45 AM",
    checkInMode: "Face",
    checkOut: "04:15 PM",
    checkOutMode: "Face"
  },
  {
    id: 23,
    employeeId: "EMP009",
    name: "Chen Wei",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Painter",
    project: "Commercial Complex",
    date: "2025-04-23",
    checkIn: "07:30 AM",
    checkInMode: "Face",
    checkOut: "04:30 PM",
    checkOutMode: "Face"
  },
  {
    id: 24,
    employeeId: "EMP009",
    name: "Chen Wei",
    entity: "Alpha Contractors",
    classification: "Laborer",
    category: "Painter", 
    project: "Interior Finishing",
    date: "2025-04-24",
    checkIn: "08:00 AM",
    checkInMode: "Manual",
    checkOut: "04:45 PM",
    checkOutMode: "Manual"
  },
  
  // Employee 10: Tariq Al Musa - Multiple dates and projects
  {
    id: 25,
    employeeId: "EMP010",
    name: "Tariq Al Musa",
    entity: "Tanseeq Engineering",
    classification: "Staff",
    category: "Supervisor",
    project: "Stadium Renovation",
    date: "2025-04-22",
    checkIn: "07:30 AM",
    checkInMode: "Face",
    checkOut: "05:00 PM",
    checkOutMode: "Face"
  },
  {
    id: 26,
    employeeId: "EMP010",
    name: "Tariq Al Musa",
    entity: "Tanseeq Engineering",
    classification: "Staff",
    category: "Supervisor",
    project: "Hospital Wing",
    date: "2025-04-23", 
    checkIn: "08:00 AM",
    checkInMode: "Face",
    checkOut: "04:45 PM",
    checkOutMode: "Face"
  },
  {
    id: 27,
    employeeId: "EMP010",
    name: "Tariq Al Musa",
    entity: "Tanseeq Engineering",
    classification: "Staff",
    category: "Supervisor",
    project: "Stadium Renovation",
    date: "2025-04-24",
    checkIn: "07:45 AM",
    checkInMode: "Face",
    checkOut: "06:15 PM", // Overtime
    checkOutMode: "Manual"
  },
];
