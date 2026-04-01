
import { Navigate } from "react-router-dom";

// Mock function to get current user permissions - in a real app, this would come from an auth context
const getUserPermissions = () => {
  // For testing, return Super Admin permissions
  return [
    "Manual Attendance", 
    "View Reports", 
    "Manage Employees", 
    "Manage Projects", 
    "Manage Locations", 
    "Export Reports", 
    "Face Enroll", 
    "Manage Roles", 
    "Role Mapping", 
    "Manage Users",
    "Attendance Role Logic"
  ];
};

type PermissionGuardProps = {
  requiredPermission: string;
  children: React.ReactNode;
};

export const PermissionGuard = ({ requiredPermission, children }: PermissionGuardProps) => {
  const userPermissions = getUserPermissions();
  
  if (userPermissions.includes(requiredPermission)) {
    return <>{children}</>;
  }
  
  // Redirect to dashboard if user doesn't have permission
  return <Navigate to="/dashboard" replace />;
};
