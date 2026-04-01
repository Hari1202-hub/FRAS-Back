import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CheckInTab from "@/Component_attendence/components/CheckInTab";
import CheckOutTab from "@/Component_attendence/components/CheckOutTab";
import ExceptionTab from "@/Component_attendence/components/ExceptionTab";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Attendance = () => {
  const [tab, setTab] = useState("checkin");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  
  // Add new state variables for the additional filter properties
  const [selectedClassification, setSelectedClassification] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState("all");
  
  // Add a state for the selected date to pass to tab components
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateSelected, setDateSelected] = useState<boolean>(true); // Default to true since we're auto-selecting today

  // Mock projects with location data
  const projects = [
    { id: 1, name: "Main Building Construction", location: "Al Qusais Industrial Area, Dubai" },
    { id: 2, name: "Bridge Expansion Project", location: "Jebel Ali Industrial Area, Dubai" },
    { id: 3, name: "Highway Renovation", location: "Business Bay, Dubai" },
  ];

  // Entity options
  const entities = [
    { id: 1, name: "Tanseeq Landscaping LLC" },
    { id: 2, name: "Tanseeq Construction Ltd" },
    { id: 3, name: "Tanseeq Engineering Co" },
  ];

  // Classifications
  const classifications = [
    { id: 1, name: "Laborer" },
    { id: 2, name: "Staff" },
  ];

  // Categories
  const categories = [
    { id: 1, name: "Carpenter" },
    { id: 2, name: "Mason" },
    { id: 3, name: "Plumber" },
    { id: 4, name: "Electrician" },
    { id: 5, name: "Painter" },
  ];

  // Get the current location based on selected project
  const getProjectLocation = () => {
    if (selectedProject === "all") return null;
    const project = projects.find(p => p.id.toString() === selectedProject);
    return project ? project.location : null;
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProject("all");
    setSelectedClassification("all");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedEntity("all");
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDateSelected(true);
      toast(`Attendance date set to ${format(date, "PPP")}`, {
        description: "Employee list will update to reflect this date's attendance status."
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-proscape hover:bg-proscape-dark text-white flex items-center text-xs"
        >
          <Upload className="mr-1 h-3 w-3" />
          Sync Data
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-md border-0">
        {/* Date Picker - replacing static date display */}
        <div className="bg-proscape/5 p-3 border-b border-gray-200 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Attendance Date:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className="pointer-events-auto"
                  // Disable future dates
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Filter controls */}
        <div className="bg-gray-50 p-3 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Entity Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Entity</label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classification Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Classification</label>
              <Select value={selectedClassification} onValueChange={setSelectedClassification}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Classifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  {classifications.map((classification) => (
                    <SelectItem key={classification.id} value={classification.name}>
                      {classification.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="h-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-gray-500" />
                    <SelectValue placeholder="Project" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getProjectLocation() && (
                <div className="text-xs text-gray-500 mt-1 italic">
                  Assigned Location: {getProjectLocation()}
                </div>
              )}
            </div>

            {/* Employee Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Employee Name/ID</label>
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employee"
                  className="pl-8 h-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Clear Filters
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checkin" className="w-full" onValueChange={setTab}>
          <div className="flex justify-center px-3 py-2 border-b border-gray-200 bg-gradient-to-r from-proscape/10 to-proscape/5">
            <TabsList className="grid w-full max-w-[400px] rounded-md grid-cols-3 bg-white/90 p-1 shadow-sm">
              <TabsTrigger 
                value="checkin" 
                className="text-xs py-1 rounded-md data-[state=active]:bg-proscape data-[state=active]:text-white"
              >
                Check In
              </TabsTrigger>
              <TabsTrigger 
                value="checkout" 
                className="text-xs py-1 rounded-md data-[state=active]:bg-proscape data-[state=active]:text-white"
              >
                Check Out
              </TabsTrigger>
              <TabsTrigger 
                value="exception" 
                className="text-xs py-1 rounded-md data-[state=active]:bg-proscape data-[state=active]:text-white"
              >
                Exceptions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Warning alert if date not selected */}
          {!dateSelected && (
            <Alert className="bg-orange-50 border border-orange-200 m-4">
              <Calendar className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Please select an attendance date before marking attendance
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="checkin" className="p-4">
            <CheckInTab 
              searchQuery={searchQuery} 
              selectedProject={selectedProject} 
              selectedClassification={selectedClassification}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              selectedEntity={selectedEntity}
              projects={projects}
              locations={[]}
              selectedDate={selectedDate}
              dateSelected={dateSelected}
            />
          </TabsContent>

          <TabsContent value="checkout" className="p-4">
            <CheckOutTab 
              searchQuery={searchQuery} 
              selectedProject={selectedProject} 
              selectedClassification={selectedClassification}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              selectedEntity={selectedEntity}
              projects={projects}
              locations={[]}
              selectedDate={selectedDate}
              dateSelected={dateSelected}
            />
          </TabsContent>

          <TabsContent value="exception" className="p-4">
            <ExceptionTab 
              searchQuery={searchQuery} 
              selectedProject={selectedProject} 
              selectedClassification={selectedClassification}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              selectedEntity={selectedEntity}
              projects={projects}
              locations={[]}
              selectedDate={selectedDate}
              dateSelected={dateSelected}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Attendance;
