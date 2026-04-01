
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ProjectFilters({
  filters,
  setFilters,
  locations,
}: {
  filters: any, 
  setFilters: (v: any) => void, 
  locations: string[]
}) {
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);
  const { toast } = useToast();

  // Validate date selection
  useEffect(() => {
    if (filters.fromDate && filters.toDate) {
      if (new Date(filters.fromDate) > new Date(filters.toDate)) {
        toast({
          title: "Invalid date range",
          description: "From Date cannot be after To Date",
          variant: "destructive"
        });
        
        // Reset the to date
        setFilters(f => ({ ...f, toDate: null }));
      }
    }
  }, [filters.fromDate, filters.toDate, setFilters, toast]);

  return (
    <div className="bg-card/80 rounded-md p-4 mb-2 flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4 md:items-end">
      {/* Entity */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Entity</label>
        <select
          value={filters.entity || ""}
          onChange={e => setFilters(f => ({ ...f, entity: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape text-base"
        >
          <option value="">All Entities</option>
          <option value="Tanseeq Construction Ltd">Tanseeq Construction Ltd</option>
          <option value="Tanseeq Engineering Co">Tanseeq Engineering Co</option>
          <option value="Tanseeq Landscaping LLC">Tanseeq Landscaping LLC</option>
        </select>
      </div>

      {/* Project ID & Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Project ID & Name</label>
        <Input
          placeholder="Search by ID or name..."
          value={filters.name}
          onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          className="text-base"
        />
      </div>
      
      {/* Location Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
        <select
          value={filters.location}
          onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape text-base"
        >
          <option value="">All</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      
      {/* FROM Date Picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left" type="button">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {filters.fromDate ? (
                format(new Date(filters.fromDate), "dd-MMM-yyyy")
              ) : (
                <span className="text-gray-400">Select start date</span>
              )}
              <ChevronDown className="w-4 h-4 ml-auto opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.fromDate ? new Date(filters.fromDate) : undefined}
              onSelect={(date) => {
                setFilters(f => ({ ...f, fromDate: date }));
                setFromDateOpen(false);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <div className="flex justify-between p-2 border-t">
              <Button 
                variant="link" 
                className="px-0 text-xs text-gray-700" 
                onClick={() => {
                  setFilters(f => ({ ...f, fromDate: null }));
                  setFromDateOpen(false);
                }}
              >
                Clear
              </Button>
              <Button 
                variant="link" 
                className="px-0 text-xs text-proscape" 
                onClick={() => setFromDateOpen(false)}
              >
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* TO Date Picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left" type="button">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {filters.toDate ? (
                format(new Date(filters.toDate), "dd-MMM-yyyy")
              ) : (
                <span className="text-gray-400">Select end date</span>
              )}
              <ChevronDown className="w-4 h-4 ml-auto opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.toDate ? new Date(filters.toDate) : undefined}
              onSelect={(date) => {
                setFilters(f => ({ ...f, toDate: date }));
                setToDateOpen(false);
              }}
              disabled={(date) => filters.fromDate ? date < new Date(filters.fromDate) : false}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <div className="flex justify-between p-2 border-t">
              <Button 
                variant="link" 
                className="px-0 text-xs text-gray-700" 
                onClick={() => {
                  setFilters(f => ({ ...f, toDate: null }));
                  setToDateOpen(false);
                }}
              >
                Clear
              </Button>
              <Button 
                variant="link" 
                className="px-0 text-xs text-proscape" 
                onClick={() => setToDateOpen(false)}
              >
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-proscape text-base"
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
