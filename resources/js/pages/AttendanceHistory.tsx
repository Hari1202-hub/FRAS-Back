import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AttendanceDetailModal from '@/Component_attendence/components/AttendanceDetailModal';

// Updated mock data with realistic examples
const MOCK_ATTENDANCE = [
  {
    id: 1,
    employeeId: '1001',
    name: 'Ahmed Khan',
    project: 'Project A',
    category: 'Carpenter',
    classification: 'Laborer',
    entity: 'Tanseeq Investment',
    date: '2024-04-01',
    checkInTime: '08:30',
    checkOutTime: '17:15',
    mode: 'Face',
    comment: null
  },
  {
    id: 2,
    employeeId: '1002',
    name: 'R. Iyer',
    project: 'Project B',
    category: 'Mason',
    classification: 'Staff',
    entity: 'Tanseeq Investment',
    date: '2024-04-01',
    checkInTime: '09:00',
    checkOutTime: '18:00',
    mode: 'Manual',
    comment: 'Late'
  },
  {
    id: 3,
    employeeId: '1003',
    name: 'L. Kumar',
    project: 'Project A',
    category: 'Plumber',
    classification: 'Laborer',
    entity: 'Skyline Builders',
    date: '2024-04-02',
    checkInTime: '08:45',
    checkOutTime: '17:30',
    mode: 'Face',
    comment: null
  },
  {
    id: 4,
    employeeId: 'EMP004',
    name: 'Robert Williams',
    project: 'Bridge Expansion',
    category: 'Electrician',
    classification: 'Staff',
    entity: 'Skyline Builders',
    date: '2025-04-24',
    checkInTime: '08:05',
    checkOutTime: '17:00',
    mode: 'Face',
    comment: null
  },
  {
    id: 5,
    employeeId: 'EMP005',
    name: 'Michael Brown',
    project: 'Warehouse Project',
    category: 'Supervisor',
    classification: 'Staff',
    entity: 'Acme Construction',
    date: '2025-04-24',
    checkInTime: '07:45',
    checkOutTime: '18:15',
    mode: 'Manual',
    comment: 'Stayed late to complete urgent task'
  },
];

// Mock filter options
const PROJECTS = ['Project A', 'Project B', 'Bridge Expansion', 'Warehouse Project'];
const CATEGORIES = ['Carpenter', 'Mason', 'Electrician', 'Plumber', 'Supervisor'];
const ENTITIES = ['Tanseeq Investment', 'Skyline Builders', 'Acme Construction'];
const CLASSIFICATIONS = ['Laborer', 'Staff'];

const AttendanceHistory = () => {
  // Filter states
  const [employeeId, setEmployeeId] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [project, setProject] = useState('');
  const [category, setCategory] = useState('');
  const [entity, setEntity] = useState('');
  const [mode, setMode] = useState('');
  const [classification, setClassification] = useState('');
  
  // Modal state for viewing attendance details
  const [selectedRecord, setSelectedRecord] = useState<typeof MOCK_ATTENDANCE[0] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Apply filters to attendance data
  const filteredAttendance = MOCK_ATTENDANCE.filter((record) => {
    if (employeeId && !record.employeeId.toLowerCase().includes(employeeId.toLowerCase()) &&
        !record.name.toLowerCase().includes(employeeId.toLowerCase())) return false;
        
    const recordDate = new Date(record.date);
    if (fromDate && recordDate < fromDate) return false;
    if (toDate && recordDate > toDate) return false;
    
    if (project && record.project !== project) return false;
    if (category && record.category !== category) return false;
    if (entity && record.entity !== entity) return false;
    if (mode && record.mode !== mode) return false;
    if (classification && record.classification !== classification) return false;
    
    return true;
  });
  
  // Handle opening the detail modal
  const handleViewRecord = (record: typeof MOCK_ATTENDANCE[0]) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setEmployeeId('');
    setFromDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setToDate(new Date());
    setProject('');
    setCategory('');
    setEntity('');
    setMode('');
    setClassification('');
  };

  return (
    <div className="space-y-6 px-1 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-5">Attendance History</h1>
        
        {/* Filters */}
        <Card className="p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employee ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="employee-id">Employee ID/Name</Label>
              <Input
                id="employee-id"
                placeholder="Search by ID or name..."
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                }}
              />
            </div>

            {/* From Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="from-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {fromDate ? format(fromDate, 'PPP') : 'Select date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="to-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {toDate ? format(toDate, 'PPP') : 'Select date'}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-projects">All Projects</SelectItem>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classification Filter */}
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger id="classification">
                  <SelectValue placeholder="All Classifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-classifications">All Classifications</SelectItem>
                  {CLASSIFICATIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Filter */}
            <div className="space-y-2">
              <Label htmlFor="entity">Entity (Company)</Label>
              <Select value={entity} onValueChange={setEntity}>
                <SelectTrigger id="entity">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-entities">All Entities</SelectItem>
                  {ENTITIES.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attendance Mode Filter */}
            <div className="space-y-2">
              <Label htmlFor="mode">Attendance Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-modes">All Modes</SelectItem>
                  <SelectItem value="Face">Face</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Buttons */}
            <div className="space-y-2 flex items-end">
              <div className="flex gap-2 w-full">
                <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                  <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  className="text-gray-600" 
                  onClick={handleResetFilters}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance History Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In Time</TableHead>
                <TableHead>Check-Out Time</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {record.project.length > 25 
                              ? `${record.project.substring(0, 25)}...` 
                              : record.project}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{record.project}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{record.checkInTime}</TableCell>
                    <TableCell>{record.checkOutTime || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          record.mode === 'Face'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {record.mode}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewRecord(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    No attendance records found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAttendance.length} of {MOCK_ATTENDANCE.length} records
        </div>
      </div>
      
      {/* Detail Modal */}
      <AttendanceDetailModal
        record={selectedRecord}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
};

export default AttendanceHistory;
