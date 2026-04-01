
export interface ReportData {
  id: number;
  employeeName: string;
  project: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  project: string;
  employee: string;
  status: string;
}
