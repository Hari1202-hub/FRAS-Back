
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllEmployees from "./employees/AllEmployees";
import UnassignedEmployees from "./employees/UnassignedEmployees";
import AssignedEmployees from "./employees/AssignedEmployees";
import { Card } from "@/components/ui/card";

const Employees = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Employees Management</h1>
        
        <Card className="p-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned Employees</TabsTrigger>
              <TabsTrigger value="assigned">Assigned Employees</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <AllEmployees />
            </TabsContent>
            
            <TabsContent value="unassigned" className="mt-4">
              <UnassignedEmployees />
            </TabsContent>
            
            <TabsContent value="assigned" className="mt-4">
              <AssignedEmployees />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Employees;
