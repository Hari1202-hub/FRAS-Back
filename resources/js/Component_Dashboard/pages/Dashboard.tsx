import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Users, 
  CheckCircle, 
  LogOut, 
  RefreshCw,
  UserCheck,
  Package,
  Upload,
  Folder,
  FileText,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { BASEURL } from "../../app";
import { TOKEN } from "../../app";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    // Try to retrieve last sync time from localStorage on component mount
    return localStorage.getItem('lastSyncTime');
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    checkedInToday: 0,
    checkedOutToday: 0,
    faceEnrolled: 0,
    pendingCheckouts: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Update dashboard data when date changes
  useEffect(() => {
    // In a real application, this would be an API call that fetches data for the selected date
    const fetchDashboardData = () => {
      // Simulate API delay
      setTimeout(() => {
       
        get_dashboard_data(selectedDate);
      }, 300);
    };
    
    fetchDashboardData();
  }, [selectedDate]);

  // Dashboard cards
  const dashboardCards = [
    /* { 
      title: "Assigned Employees", // Changed from "Total Employees" to "Assigned Employees"
      count: dashboardData.totalEmployees.toLocaleString(), 
      icon: <Users className="h-8 w-8 text-proscape" />
    }, */
    { 
      title: "Checked In Today", 
      count: dashboardData.checkedInToday.toLocaleString(), 
      icon: <CheckCircle className="h-8 w-8 text-green-500" />
    },
    { 
      title: "Checked Out Today", 
      count: dashboardData.checkedOutToday.toLocaleString(), 
      icon: <LogOut className="h-8 w-8 text-amber-500" />,
    //  pendingCheckouts: dashboardData.pendingCheckouts > 0 ? dashboardData.pendingCheckouts : null
    },
    { 
      title: "Face Enrolled", 
      count: `${dashboardData.faceEnrolled} / ${dashboardData.totalEmployees.toLocaleString()}`, 
      icon: <UserCheck className="h-8 w-8 text-blue-500" />
    }
  ];

  // Handle the sync operation
  const handleSync = () => {
    setIsSyncing(true);
    toast.info("Syncing data...", { duration: 2000 });
    
    // Simulate sync operation
    setTimeout(() => {
      // Format current date and time for display
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const syncTimestamp = `${formattedDate} ${formattedTime}`;
      
      // Update state and localStorage
      setLastSyncTime(syncTimestamp);
      localStorage.setItem('lastSyncTime', syncTimestamp);
      
      setIsSyncing(false);
      toast.success("Data synchronized successfully!");
    }, 2000);
  };
  
  // Quick actions - keeping the existing ones
  const quickActions = [
    { 
      label: "Bulk Attendance", 
      icon: <Package className="h-5 w-5" />,
      onClick: () => navigate("/bulk-attendance"),
      description: "Mark attendance for multiple employees"
    },
    { 
      label: "Employees", 
      icon: <Upload className="h-5 w-5" />,
      onClick: () => navigate("/master/employees"),
      description: "Import employee list via Tanseeq API or Excel"
    },
    { 
      label: "View Projects", 
      icon: <Folder className="h-5 w-5" />,
      onClick: () => navigate("/master/projects"),
      description: "Navigate directly to the Projects submenu"
    },
    { 
      label: "Attendance Reports", 
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate("/reports"),
      description: "View and export attendance history and records"
    },
   /*  { 
      label: "Sync Data", 
      icon: <RefreshCw className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`} />,
      onClick: handleSync,
      description: "Initiates data sync with central database"
    } */
  ];
  const get_dashboard_data = (date) =>{
    axios.post(BASEURL+'dashboard',{date:format(date, "yyyy-MM-dd")}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    }).then(response=>{
      setDashboardData({
          totalEmployees: response.data.data.total_employees,
          checkedInToday: response.data.data.check_in_today,
          checkedOutToday: response.data.data.check_out_today,
          faceEnrolled: response.data.data.face_entrolled_today,
          pendingCheckouts: response.data.data.project.length
        });
        //toast.info(`Dashboard updated for ${format(date, 'dd MMM yyyy')}`);
    })
  }
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      
      get_dashboard_data(date);
      
      // Data is fetched via the useEffect hook when selectedDate changes
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* Dashboard header with date picker */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          
          {/* Date Picker - Fixed implementation */}
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 bg-white"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                <Calendar className="h-4 w-4" />
                <span>
                  {format(selectedDate, "dd MMM yyyy")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                            if (date) {
                              handleDateChange(date);
                              setIsDatePickerOpen(false); // Close the popover after selection
                            }
                          }}
                 disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                classNames={{
                              day_disabled: "text-gray-400 bg-gray-100 opacity-50 cursor-not-allowed hover:bg-gray-100"
                            }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Dashboard Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                    {card.pendingCheckouts && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex">
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                <span>{card.pendingCheckouts.toLocaleString()}</span>
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{card.pendingCheckouts.toLocaleString()} pending check-outs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-full">
                  {card.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Quick Actions Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-sm font-medium text-gray-500 mb-3">QUICK ACTIONS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className="flex flex-col">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-4 h-auto border-gray-200 hover:bg-proscape/5 hover:border-proscape hover:shadow-sm transition-all"
                  onClick={action.onClick}
                  title={action.description}
                  disabled={action.label === "Sync Data" && isSyncing}
                >
                  <div className="w-10 h-10 rounded-full bg-proscape/10 flex items-center justify-center text-proscape">
                    {action.icon}
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </Button>
                {action.label === "Sync Data" && (
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {lastSyncTime ? `Last Synced: ${lastSyncTime}` : "Not synced yet"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
