
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Settings, Users, Calendar, FileText, User, ChevronDown, ChevronRight, ChevronLeft, Briefcase, CheckCircle, Tag, Menu, X, LogOut, Clock, UserCog, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { BASEURL } from "../../app";
import axios from "axios";
import { useEffect } from "react";
import { BASEPATH } from "../../app";
import { TOKEN } from "../../app";

// Mock function to get current user permissions - in a real app, this would come from an auth context
const getUserPermissions = () => {
  // For testing, return Super Admin permissions
  return [ "View Reports", "Manage Employees", "Manage Projects", "Manage Locations", "Export Reports", "Face Enroll", "Manage Roles", "Role Mapping", "Manage Users", "Attendance Role Logic", "Manage App Clients"];
};

type SubMenuItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  requiredPermission?: string;
};
type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  subMenus?: SubMenuItem[];
  hidden?: boolean;
  requiredPermission?: string;
  microservice?: string;
};

const menuItems: MenuItem[] = [{
  name: "Dashboard",
  path: "/dashboard",
  icon: <Home className="h-5 w-5" />,
  
}, {
  name: "Master",
  path: "/master",
  icon: <Settings className="h-5 w-5" />,
 
  subMenus: [{
    name: "Employees",
    path: "/master/employees",
    icon: <Users className="h-4 w-4" />,
    requiredPermission: "Manage Employees"
  }, {
    name: "Roles",
    path: "/master/roles",
    icon: <UserCog className="h-4 w-4" />,
    requiredPermission: "Manage Roles"
  }, {
    name: "Projects",
    path: "/master/projects",
    icon: <Briefcase className="h-4 w-4" />,
    requiredPermission: "Manage Projects"
  }, {
    name: "Attendance Type",
    path: "/master/attendance-type",
    icon: <Clock className="h-4 w-4" />,
    requiredPermission: "Manage Projects"
  }, {
    name: "Role Attendance Logic",
    path: "/master/role-attendance-logic",
    icon: <Settings className="h-4 w-4" />,
    requiredPermission: "Attendance Role Logic"
  }, {
    name: "App Clients",
    path: "/master/app-clients",
    icon: <ShieldCheck className="h-4 w-4" />,
    requiredPermission: "Manage App Clients"
  }]
}, /* {
  name: "Manual Attendance",
  path: "/manual-attendance",
  icon: <Calendar className="h-5 w-5" />,
  requiredPermission: "Manual Attendance",
  
}, */ /* {
  name: "Bulk Attendance",
  path: "/bulk-attendance",
  icon: <CheckCircle className="h-5 w-5" />,
  requiredPermission: "Attendance Role Logic",
  
}, */ {
  name: "Attendance History",
  path: "/attendance-history",
  icon: <Calendar className="h-5 w-5" />,
  hidden: true,
 
}/* , {
  name: "Reports",
  path: "/reports",
  icon: <FileText className="h-5 w-5" />,
  requiredPermission: "View Reports",
 
} */, {
  name: "Profile",
  path: "/profile",
  icon: <User className="h-5 w-5" />,
 
}];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>("Master");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const userPermissions = getUserPermissions();
  const [loggedUserName,setLoggedUserName] = useState(null);
  const toggleSubmenu = (menuName: string) => {
    setExpanded(expanded === menuName ? null : menuName);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const loadtoken = () =>{
    axios.post(BASEURL+'me',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response=>{
      if(response.data.data.id){
        setLoggedUserName(response.data.data.name);
      }
    }).catch(error => {
        navigate("/login");
        console.log(error);
        closeMobileMenu();
    })
  }
  const handleLogout = () => {
    axios.post(BASEURL+'logout',{}, {
      headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${TOKEN()}` }
    })
    .then(response=>{
       navigate("/login");
      toast.success("Successfully signed out");
      closeMobileMenu();
    }).catch(error => {
        navigate("/login");
        closeMobileMenu();
    })
    
  };

  // Filter and transform menu items
  const processedMenuItems = menuItems.filter(item => !item.hidden).filter(item => !item.requiredPermission || userPermissions.includes(item.requiredPermission)).map(item => {
    if (item.subMenus) {
      if (item.name === "Master") {
        const organizedSubMenus = item.subMenus.filter(subItem => !subItem.requiredPermission || userPermissions.includes(subItem.requiredPermission));
        return {
          ...item,
          subMenus: organizedSubMenus
        };
      }
      return {
        ...item,
        subMenus: item.subMenus.filter(subItem => !subItem.requiredPermission || userPermissions.includes(subItem.requiredPermission))
      };
    }
    return item;
  }).filter(item => !item.subMenus || item.subMenus.length > 0);

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
    >
      {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Mobile Overlay
  const MobileOverlay = () => (
    isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        onClick={closeMobileMenu}
      />
    )
  );

  useEffect(()=>{
    loadtoken();
  },[]);

  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />
      
      <div className="relative">
        {/* Desktop Sidebar */}
        <div className={`
          fixed h-screen bg-sidebar transition-all duration-300 z-40
          ${isMobile 
            ? `w-72 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : `${isCollapsed ? 'w-16' : 'w-64'}`
          }
        `}>
          <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center">
                <img 
                  src={`${BASEPATH}lovable-uploads/05179fc8-d11b-4d37-bd27-20cd7447beaa.png`} 
                  alt="Tanseeq Investment Logo" 
                  className="h-8 w-8 mr-2" 
                />
                <h1 className="text-white text-lg font-bold">Tanseeq</h1>
              </div>
            )}
            {(isCollapsed && !isMobile) && (
              <img 
                src={`${BASEPATH}lovable-uploads/05179fc8-d11b-4d37-bd27-20cd7447beaa.png`} 
                alt="Tanseeq Investment Logo" 
                className="h-8 w-8 mx-auto" 
              />
            )}
            {!isMobile && (
              <button 
                onClick={toggleSidebar} 
                className="text-white p-1 rounded hover:bg-sidebar-accent"
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            )}
          </div>

          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 py-4">
              <nav>
                <ul className="space-y-1 px-2">
                  {processedMenuItems.map(item => (
                    <li key={item.name}>
                      {item.subMenus ? (
                        <div>
                          <button 
                            onClick={() => toggleSubmenu(item.name)} 
                            className={`
                              flex items-center w-full px-3 py-2 text-sidebar-foreground 
                              hover:bg-sidebar-accent rounded-md transition-colors
                              ${expanded === item.name ? 'bg-sidebar-accent' : ''} 
                              ${(isCollapsed && !isMobile) ? 'justify-center' : 'justify-between'}
                            `}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              {(!isCollapsed || isMobile) && (
                                <div className="flex items-center ml-3">
                                  <span>{item.name}</span>
                                </div>
                              )}
                            </div>
                            {(!isCollapsed || isMobile) && (
                              expanded === item.name ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {expanded === item.name && (!isCollapsed || isMobile) && (
                            <ul className="pl-8 mt-1 space-y-1">
                              {item.subMenus.map(subItem => (
                                <li key={subItem.name}>
                                  <Link 
                                    to={subItem.path} 
                                    onClick={isMobile ? closeMobileMenu : undefined}
                                    className={`
                                      flex items-center px-3 py-2 text-sm rounded-md transition-colors
                                      ${location.pathname === subItem.path ? 
                                        'bg-sidebar-primary text-sidebar-primary-foreground' : 
                                        'text-sidebar-foreground hover:bg-sidebar-accent'
                                      }
                                    `}
                                  >
                                    {subItem.icon}
                                    <span className="ml-2">{subItem.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link 
                          to={item.path} 
                          onClick={isMobile ? closeMobileMenu : undefined}
                          className={`
                            flex items-center px-3 py-2 rounded-md transition-colors
                            ${location.pathname === item.path ? 
                              'bg-sidebar-primary text-sidebar-primary-foreground' : 
                              'text-sidebar-foreground hover:bg-sidebar-accent'
                            } 
                            ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                          `}
                        >
                          {item.icon}
                          {(!isCollapsed || isMobile) && (
                            <div className="flex items-center ml-3">
                              <span>{item.name}</span>
                            </div>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </ScrollArea>

            <div className="border-t border-sidebar-border">
              {(!isCollapsed || isMobile) && (
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Super Admin</p>
                        <p className="text-xs opacity-70">{loggedUserName}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
              {(isCollapsed && !isMobile) && (
                <div className="p-4 space-y-2">
                  <div className="flex justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleLogout}
                      className="p-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer for main content */}
        <div className={`
          transition-all duration-300
          ${isMobile 
            ? 'w-0' 
            : `${isCollapsed ? 'w-16' : 'w-64'}`
          }
        `} />
      </div>
    </>
  );
}
