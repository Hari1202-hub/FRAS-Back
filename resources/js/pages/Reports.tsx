import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Users, Clock, AlertTriangle, UserX, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportFilters } from "@/components/reports/ReportFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

// Mock data with authentic Muslim names and role-specific attendance
const mockAttendanceData = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Ahmed Al-Rashid",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: "07:00",
    checkOutTime: "17:00",
    status: "Present",
    markedBy: "Supervisor",
    timestamp: "2024-01-15 07:00:00",
    project: "Main Building Construction",
    reason: "Regular Work"
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Mohammed Al-Zahra",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: "07:15",
    checkOutTime: null,
    status: "Exception",
    markedBy: "Self",
    timestamp: "2024-01-15 07:15:00",
    project: "Highway Project",
    reason: "Forgot to check out"
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Omar Hassan",
    role: "Supervisor",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Sick Leave",
    markedBy: "Medical Officer",
    timestamp: "2024-01-15 08:00:00",
    project: "Bridge Construction",
    reason: "Fever and flu symptoms"
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Abdullah Al-Mansouri",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Present (Visa/ID)",
    markedBy: "United Emirates Officer",
    timestamp: "2024-01-15 09:00:00",
    project: "Main Building Construction",
    reason: "Document verification"
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Khalid Al-Shamsi",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Casual Leave",
    markedBy: "Camp Boss",
    timestamp: "2024-01-15 08:30:00",
    project: "Highway Project",
    reason: "Family emergency"
  },
  {
    id: 6,
    employeeId: "EMP006",
    name: "Rashid Al-Maktoum",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Absent",
    markedBy: "System",
    timestamp: "2024-01-15 23:59:59",
    project: "Bridge Construction",
    reason: "No attendance recorded"
  },
  {
    id: 7,
    employeeId: "EMP007",
    name: "Hassan Al-Qasimi",
    role: "Staff",
    date: "2024-01-15",
    checkInTime: "08:00",
    checkOutTime: "18:00",
    status: "Present",
    markedBy: "Self",
    timestamp: "2024-01-15 08:00:00",
    project: "Main Building Construction",
    reason: "Regular Work"
  },
  {
    id: 8,
    employeeId: "EMP008",
    name: "Saif Al-Nuaimi",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Present (Visa/ID)",
    markedBy: "United Emirates Officer",
    timestamp: "2024-01-15 10:00:00",
    project: "Highway Project",
    reason: "Visa renewal process"
  },
  {
    id: 9,
    employeeId: "EMP009",
    name: "Yousef Al-Falasi",
    role: "Labour",
    date: "2024-01-15",
    checkInTime: "07:30",
    checkOutTime: null,
    status: "Exception",
    markedBy: "Self",
    timestamp: "2024-01-15 07:30:00",
    project: "Bridge Construction",
    reason: "Equipment malfunction"
  },
  {
    id: 10,
    employeeId: "EMP010",
    name: "Hamad Al-Thani",
    role: "Supervisor",
    date: "2024-01-15",
    checkInTime: null,
    checkOutTime: null,
    status: "Sick Leave",
    markedBy: "Medical Officer",
    timestamp: "2024-01-15 09:30:00",
    project: "Main Building Construction",
    reason: "Medical treatment required"
  }
];

const reportTypes = [
  { value: "all", label: "All Attendance", icon: FileText },
  { value: "medical", label: "Medical Officer Report", icon: UserCheck },
  { value: "campboss", label: "Camp Boss Report", icon: Users },
  { value: "ueo", label: "United Emirates Officer Report", icon: UserCheck },
  { value: "absent", label: "Absent Report", icon: UserX },
  { value: "exception", label: "Exception Report", icon: AlertTriangle }
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "Present", label: "Present" },
  { value: "Absent", label: "Absent" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Present (Visa/ID)", label: "Present (Visa/ID)" },
  { value: "Exception", label: "Exception" }
];

// Define which reports are role-specific and should have simplified interface
const roleSpecificReports = ["medical", "campboss", "ueo"];

// Helper function to determine if project/reason should be hidden
const shouldHideProjectReason = (status: string, markedBy: string) => {
  const hiddenStatuses = ["Sick Leave", "Casual Leave", "ID/Visa Verified", "Absent"];
  const hiddenMarkedBy = ["Medical Officer", "Camp Boss", "United Emirates Officer", "System"];
  
  return hiddenStatuses.includes(status) && hiddenMarkedBy.includes(markedBy);
};

// Helper function to get display value for project/reason
const getDisplayValue = (originalValue: string, status: string, markedBy: string, isManualReason: boolean = false) => {
  if (shouldHideProjectReason(status, markedBy)) {
    // For reason field, show manual entries but hide auto-generated ones
    if (isManualReason && originalValue && !["Regular Work", "No attendance recorded", "Document verification", "Visa renewal process"].includes(originalValue)) {
      return originalValue;
    }
    return "–";
  }
  return originalValue;
};

const Reports = () => {
  const isMobile = useIsMobile();
  const [selectedReport, setSelectedReport] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Report filter states to match ReportFilters component interface
  const [projectFilter, setProjectFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState("all");
  const [entryMethodFilter, setEntryMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Check if current report is role-specific
  const isRoleSpecificReport = roleSpecificReports.includes(selectedReport);

  // Set smart defaults based on report type
  useEffect(() => {
    switch (selectedReport) {
      case "campboss":
        setStatusFilter("Casual Leave");
        break;
      case "medical":
        setStatusFilter("Sick Leave");
        break;
      case "ueo":
        setStatusFilter("Present (Visa/ID)");
        break;
      case "absent":
        setStatusFilter("Absent");
        break;
      default:
        setStatusFilter("all");
    }
  }, [selectedReport]);

  // Filter data based on selected report type and status
  const getFilteredData = () => {
    let filtered = [...mockAttendanceData];

    // Filter by report type
    switch (selectedReport) {
      case "medical":
        filtered = filtered.filter(record => record.markedBy === "Medical Officer");
        break;
      case "campboss":
        filtered = filtered.filter(record => record.markedBy === "Camp Boss");
        break;
      case "ueo":
        filtered = filtered.filter(record => record.markedBy === "United Emirates Officer");
        break;
      case "absent":
        filtered = filtered.filter(record => record.status === "Absent");
        break;
      case "exception":
        filtered = filtered.filter(record => record.status === "Exception");
        break;
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const handleExportReport = () => {
    const reportName = reportTypes.find(type => type.value === selectedReport)?.label || "Report";
    toast({
      title: "Export Started",
      description: `${reportName} is being exported to Excel format.`,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Sick Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Casual Leave":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Present (Visa/ID)":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Exception":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <Button onClick={handleExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Type Selection and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status filter - only show for role-specific reports */}
            {isRoleSpecificReport && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Additional Filters - only show for non-role-specific reports */}
          {!isRoleSpecificReport && (
            <ReportFilters
              projectFilter={projectFilter}
              setProjectFilter={setProjectFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              attendanceTypeFilter={attendanceTypeFilter}
              setAttendanceTypeFilter={setAttendanceTypeFilter}
              entryMethodFilter={entryMethodFilter}
              setEntryMethodFilter={setEntryMethodFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          )}
        </div>
      </Card>

      {/* Report Results */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {reportTypes.find(type => type.value === selectedReport)?.label || "Report"}
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredData.length} records
            </Badge>
          </div>
        </div>

        {isMobile ? (
          <div className="divide-y divide-gray-200">
            {filteredData.map((record) => (
              <div key={record.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{record.name}</h3>
                    <p className="text-sm text-gray-500">{record.employeeId}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Date:</span> {record.date}
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span> {record.timestamp}
                  </div>
                  <div>
                    <span className="font-medium">Check In:</span> {record.checkInTime || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Check Out:</span> {record.checkOutTime || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Marked By:</span> {record.markedBy}
                  </div>
                  {/* Show Project and Reason only for non-role-specific reports */}
                  {!isRoleSpecificReport && (
                    <>
                      <div>
                        <span className="font-medium">Project:</span> {getDisplayValue(record.project, record.status, record.markedBy)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Reason:</span> {getDisplayValue(record.reason, record.status, record.markedBy, true)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked By</TableHead>
                <TableHead>Timestamp</TableHead>
                {/* Show Project and Reason columns only for non-role-specific reports */}
                {!isRoleSpecificReport && (
                  <>
                    <TableHead>Project</TableHead>
                    <TableHead>Reason</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeId}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkInTime || "N/A"}</TableCell>
                  <TableCell>{record.checkOutTime || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.markedBy}</TableCell>
                  <TableCell>{record.timestamp}</TableCell>
                  {/* Show Project and Reason cells only for non-role-specific reports */}
                  {!isRoleSpecificReport && (
                    <>
                      <TableCell>{getDisplayValue(record.project, record.status, record.markedBy)}</TableCell>
                      <TableCell>{getDisplayValue(record.reason, record.status, record.markedBy, true)}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No records found for the selected filters</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
