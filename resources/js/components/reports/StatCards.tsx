
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface StatCardsProps {
  stats: {
    present: number;
    absent: number;
    avgHours: number;
    manualEntries: number;
    missedCheckouts: number;
    pendingApprovals: number;
  };
  selectedDate?: Date;
}

export function StatCards({ stats, selectedDate }: StatCardsProps) {
  const pendingCheckouts = stats.missedCheckouts > 0 ? stats.missedCheckouts : 0;
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-6">
      {/* Present */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Present</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.present}</p>
        </div>
      </Card>
      
      {/* Absent */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.absent}</p>
        </div>
      </Card>
      
      {/* Avg Hours */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Avg Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgHours}</p>
        </div>
      </Card>
      
      {/* Manual Entries */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Manual Entries</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.manualEntries}</p>
        </div>
      </Card>
      
      {/* Missed Checkouts */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Missed Checkouts</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-gray-900">{stats.missedCheckouts}</p>
            {pendingCheckouts > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex">
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>{pendingCheckouts}</span>
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{pendingCheckouts} pending check-outs for {selectedDate ? 
                      selectedDate.toLocaleDateString('en-US', {day: '2-digit', month: 'short', year: 'numeric'}) :
                      'today'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>
      
      {/* Pending Approvals */}
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
        </div>
      </Card>
    </div>
  );
}
