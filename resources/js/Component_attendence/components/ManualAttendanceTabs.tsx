
import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CheckInTab from "./CheckInTab";
import CheckOutTab from "./CheckOutTab";
import ExceptionTab from "./ExceptionTab";
import { AttendanceFilters } from "../types/attendance";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ManualAttendanceTabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  filteredRecords: any[];
  filters: AttendanceFilters;
  projects: { id: number; name: string; coordinates?: { geofenceData: string }; location?: string }[];
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  dateSelected: boolean;
  setDateSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

const ManualAttendanceTabs: React.FC<ManualAttendanceTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredRecords,
  filters,
  projects,
  selectedDate,
  setSelectedDate,
  dateSelected,
  setDateSelected
}) => {
  // Empty array for locations since we're not using them anymore
  const emptyLocations: { id: number; name: string }[] = [];

  // For debugging
  console.log("Current active tab:", activeTab);
  
  // Force tab to be one of the valid options if it's invalid
  useEffect(() => {
    const validTabs = ["check-in", "check-out", "exceptions"];
    if (!validTabs.includes(activeTab)) {
      console.log("Setting active tab to check-in as current tab is invalid:", activeTab);
      setActiveTab("check-in");
    }
  }, [activeTab, setActiveTab]);

  return (
    <div className="space-y-4">
      {/* Date Picker Component - Now defaults to today's date */}
      <div className="flex justify-end items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Attendance Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Select Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" sideOffset={4}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="rounded-md border shadow-lg"
                // Disable future dates
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="check-in">Check In</TabsTrigger>
          <TabsTrigger value="check-out">Check Out</TabsTrigger>
        </TabsList>
        
        <TabsContent value="check-in" className="mt-0">
          <CheckInTab 
            searchQuery={filters.name || filters.employeeId}
            searchId={filters.employeeId}
            selectedProject={filters.project}
            selectedClassification={filters.classification}
            selectedCategory={filters.category}
            selectedStatus={filters.status}
            selectedEntity={filters.entity}
            projects={projects}
            locations={emptyLocations}
            selectedDate={selectedDate}
            dateSelected={dateSelected}
          />
        </TabsContent>
        
        <TabsContent value="check-out" className="mt-0">
          <CheckOutTab 
            searchQuery={filters.name }
             searchId={filters.employeeId}
            selectedProject={filters.project}
            selectedClassification={filters.classification}
            selectedCategory={filters.category}
            selectedStatus={filters.status}
            selectedEntity={filters.entity}
            projects={projects}
            locations={emptyLocations}
            selectedDate={selectedDate}
            dateSelected={dateSelected}
          />
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default ManualAttendanceTabs;
