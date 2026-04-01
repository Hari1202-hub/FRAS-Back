
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Users, Clock, AlertTriangle, UserX, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportFilters } from "@/components/reports/ReportFilters";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

// Mock data with authentic Muslim names and role-specific attendance


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
  const [entityFilter, setEntityFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [entryMethodFilter, setEntryMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mockAttendanceData,setAttendaceData] = useState([]);

  // Check if current report is role-specific
  const isRoleSpecificReport = roleSpecificReports.includes(selectedReport);

  const loadAttendaceData = ()=>{
    axios.post(BASEURL+'reports',{},{
      headers:{
        'Content-Type':'multipart/form-data',
        'Authorization':`Bearer ${TOKEN()}`
      }
    }).then(response=>{
      let reports = response.data.data;
      setAttendaceData(reports);
    });
  }

  // Set smart defaults based on report type
  useEffect(() => {
    loadAttendaceData();
  }, [selectedReport]);

  // Filter data based on selected report type and status
  const getFilteredData = () => {
    let filtered = [...mockAttendanceData];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }
    // Filter by search term if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date); // assuming record.date is a string
        return recordDate >= start && recordDate <= end;
      });
    }
    if(entityFilter){
      filtered = filtered.filter(record => {
        return entityFilter === "all" || record.entity.id === entityFilter;
      });
    }
    if(classificationFilter){
      filtered = filtered.filter(record => {
        return classificationFilter === "all" || record.classification.code === classificationFilter;
      });
    }
    if(categoryFilter){
      filtered = filtered.filter(record => {
        return categoryFilter === "all" || record.category.code === categoryFilter;
      });
    }
    if(projectFilter){
      filtered = filtered.filter(record => {
        return projectFilter === "all" || record.project.id === projectFilter;
      });
    }
    if (searchTerm) {
       filtered = filtered.filter((record) =>{
        const searchMatch = record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.user_login.emp_id.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
       } 
      
       
      ); 
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const handleExportReport = () => {
   /*  const reportName = reportTypes.find(type => type.value === selectedReport)?.label || "Report";
    toast({
      title: "Export Started",
      description: `${reportName} is being exported to Excel format.`,
    }); */
    const exportData = filteredData.map((record) => ({
      "Employee ID": record.user_login.emp_id,
      "Name": record.user.name,
      "Entity": record.entity.entityname,
      "Classification": record.classification.description,
      "Category": record.category.description,
      "Project": record.project.projectname,
      "Date": record.date,
      "Check In": record.checkin || "N/A",
      "Check Out": record.checkout || "N/A",
      "Working Hours": record.worked_hours || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(fileData, `Attendance_Report_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "The report has been downloaded as an Excel file.",
    });
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
              entityFilter={entityFilter}
              setEntityFilter={setEntityFilter}
              classificationFilter={classificationFilter}
              setClassificationFilter={setClassificationFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={categoryFilter}
              projectFilter={projectFilter}
              setProjectFilter={setProjectFilter}
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
             {/*  {reportTypes.find(type => type.value === selectedReport)?.label || "Report"} */}
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredData.length} records
            </Badge>
          </div>
        </div>

        {isMobile ? (
          <div className="divide-y divide-gray-200">
            {filteredData.map((record,index) => (
              <div key={index} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{record.user.name}</h3>
                    <p className="text-sm text-gray-500">{record.user_login.emp_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Date:</span> {record.date}
                  </div>
                  <div>
                    <span className="font-medium">Check In:</span> {record.checkin || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Check Out:</span> {record.checkout || "N/A"}
                  </div>
                 
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
                <TableHead>Entity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Working Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.user_login.emp_id}</TableCell>
                  <TableCell>{record.user.name}</TableCell>
                  <TableCell>{record.entity.entityname}</TableCell>
                  <TableCell>{record.classification.description}</TableCell>
                  <TableCell>{record.category.description}</TableCell>
                  <TableCell>{record.project.projectname }</TableCell>
                  <TableCell>{record.date }</TableCell>
                  <TableCell>{record.checkin }</TableCell>
                  <TableCell>{record.checkout }</TableCell>
                  <TableCell>{record.worked_hours }</TableCell>
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
