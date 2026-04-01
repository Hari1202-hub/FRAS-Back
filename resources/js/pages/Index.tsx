
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, FileText, User, Users } from "lucide-react";
import { BASEURL } from "../app";
import { BASEPATH } from "../app";

const Index = () => {
  const navigate = useNavigate();
  
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <img 
            src={`${BASEPATH}lovable-uploads/a0d8ed56-0cf0-440c-8865-50cfc30ca8a0.png`} 
            alt="Proscape Logo" 
            className="h-16 w-16 mb-3"
          />
          <h1 className="text-3xl font-bold text-proscape">Proscape Facial Attendance System</h1>
          <p className="text-gray-600 mt-2">Construction employee attendance management with face recognition</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/dashboard')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Dashboard</h2>
            <p className="text-gray-600 text-sm">View attendance summary and key metrics</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/attendance')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Mark Attendance</h2>
            <p className="text-gray-600 text-sm">Record check-ins and check-outs using facial recognition</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/attendance-history')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Attendance History</h2>
            <p className="text-gray-600 text-sm">View and manage employee attendance records</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/master/employees')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Employees</h2>
            <p className="text-gray-600 text-sm">Manage employees and enroll faces</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/reports')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Reports</h2>
            <p className="text-gray-600 text-sm">Generate and export attendance reports</p>
          </Card>
          
          <Card 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
            onClick={() => navigateTo('/profile')}
          >
            <div className="h-12 w-12 rounded-lg bg-proscape-lighter flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-proscape" />
            </div>
            <h2 className="text-lg font-bold mb-2">Profile</h2>
            <p className="text-gray-600 text-sm">View and manage your profile settings</p>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 Proscape Construction Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
