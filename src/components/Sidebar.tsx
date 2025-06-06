import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Rocket,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: (value: boolean) => void;
  onLogout: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar, onLogout }: SidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onLogout();
    navigate("/login"); // Redirect to login page after sign out
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar toggle button and logo area aligned with Header height */}
      <div className="h-16 flex items-center px-4 border-b">
        <button onClick={() => toggleSidebar(!isCollapsed)} className="mr-4">
          {isCollapsed ? (
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {!isCollapsed && (
          <div className="flex items-center">
            <Rocket className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">Propel</h1>
          </div>
        )}
      </div>

      {/* Sidebar nav content */}
      <nav className="flex-1 overflow-y-auto py-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard
            className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`}
          />
          {!isCollapsed && "Dashboard"}
        </NavLink>

        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Users className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`} />
          {!isCollapsed && "Employees"}
        </NavLink>

        <NavLink
          to="/departments"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Building2
            className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`}
          />
          {!isCollapsed && "Departments"}
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <FolderKanban
            className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`}
          />
          {!isCollapsed && "Projects"}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Settings
            className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`}
          />
          {!isCollapsed && "Settings"}
        </NavLink>

        <NavLink
          to="#"
          onClick={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
        >
          <LogOut className={`w-5 h-5 mr-3 ${isCollapsed ? "mx-auto" : ""}`} />
          {!isCollapsed && "Sign Out"}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
