
import Toaster from "@/Component_Dashboard/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { PermissionGuard } from "./components/auth/PermissionGuard";

// Core microservice imports - now using the correct Component_Dashboard folder
import Login from "./Component_Dashboard/pages/Login";
import Resetpasswrod from "./Component_Dashboard/pages/Resetpassword";
import Dashboard from "./Component_Dashboard/pages/Dashboard";
import Profile from "./Component_Dashboard/pages/Profile";

// Attendance microservice imports
import ManualAttendanceRecords from "./Component_attendence/pages/ManualAttendance";
import BulkAttendance from "./Component_attendence/pages/BulkAttendance";
import AttendanceHistory from "./Component_attendence/pages/AttendanceHistory";

// Master microservice imports
import Employees from "./Component_master/pages/Employees";
import Roles from "./pages/master/Roles";
import Projects from "./Component_master/pages/Projects";
import AttendanceType from "./Component_master/pages/AttendanceType";
import RoleAttendanceLogic from "./Component_master/pages/RoleAttendanceLogic";
import AppClients from "./Component_master/pages/AppClients";

// Reports microservice imports
import Reports from "./Component_report/pages/Reports";

import NotFound from "./pages/NotFound";
import { BASENAME } from "./app";

// Create a new QueryClient instance inside the component to ensure it's created when React is ready
const App = () => {
  // Initialize QueryClient inside the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={BASENAME}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/resetpassword" element={<Resetpasswrod />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            
            {/* Protected routes with permission guards */}
            <Route path="/manual-attendance" element={
              <PermissionGuard requiredPermission="Manual Attendance">
                <Layout><ManualAttendanceRecords /></Layout>
              </PermissionGuard>
            } />
            <Route path="/bulk-attendance" element={
              <PermissionGuard requiredPermission="Manual Attendance">
                <Layout><BulkAttendance /></Layout>
              </PermissionGuard>
            } />
            <Route path="/attendance-history" element={<Layout><AttendanceHistory /></Layout>} />
            <Route path="/reports" element={
              <PermissionGuard requiredPermission="View Reports">
                <Layout><Reports /></Layout>
              </PermissionGuard>
            } />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            {/* Master routes with permission guards */}
            <Route path="/master/employees" element={
              <PermissionGuard requiredPermission="Manage Employees">
                <Layout><Employees /></Layout>
              </PermissionGuard>
            } />
            <Route path="/master/roles" element={
              <PermissionGuard requiredPermission="Manage Roles">
                <Layout><Roles /></Layout>
              </PermissionGuard>
            } />
            <Route path="/master/projects" element={
              <PermissionGuard requiredPermission="Manage Projects">
                <Layout><Projects /></Layout>
              </PermissionGuard>
            } />
            <Route path="/master/attendance-type" element={
              <PermissionGuard requiredPermission="Manage Projects">
                <Layout><AttendanceType /></Layout>
              </PermissionGuard>
            } />
            <Route path="/master/role-attendance-logic" element={
              <PermissionGuard requiredPermission="Attendance Role Logic">
                <Layout><RoleAttendanceLogic /></Layout>
              </PermissionGuard>
            } />
            <Route path="/master/app-clients" element={
              <PermissionGuard requiredPermission="Manage App Clients">
                <Layout><AppClients /></Layout>
              </PermissionGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
