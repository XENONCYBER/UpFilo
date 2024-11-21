import React, { useState } from "react";
import {
  MessageSquare,
  Image,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ChannelList from "./ChannelList";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleChannelSelect: (channelId: number) => void; // New prop
}

export default function Sidebar({
  open,
  setOpen,
  activeSection,
  setActiveSection,
  handleChannelSelect,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showTooltip, setShowTooltip] = useState("");
  const [showGroups, setShowGroups] = useState(false); // State to manage ChannelList visibility

  const sidebarItems = [
    {
      id: "directMessages",
      icon: MessageSquare,
      label: "Direct Messages",
      notification: 3,
    },
    {
      id: "mediaGallery",
      icon: Image,
      label: "Media Gallery",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      notification: 5,
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
    },
    {
      id: "groups",
      icon: Users,
      label: "Groups",
    },
  ];

  const handleItemClick = (sectionId: string) => {
    if (sectionId === "groups") {
      setShowGroups((prev) => !prev);
    } else {
      setActiveSection(sectionId);
      setShowGroups(false);
    }
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col 
          bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900
          border-r border-white/10 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-64"} 
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">UF</span>
                </div>
                <span className="font-semibold text-blue-100">UpFilo</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-blue-300 hover:text-blue-100 hover:bg-white/10"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Button
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={`w-full group relative
                    ${collapsed ? "justify-center px-2" : "justify-start px-4"} 
                    ${
                      activeSection === item.id
                        ? "bg-white/10 text-blue-100"
                        : "text-blue-300 hover:text-blue-100 hover:bg-white/5"
                    }`}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={() => collapsed && setShowTooltip(item.id)}
                  onMouseLeave={() => setShowTooltip("")}
                >
                  <div className="relative">
                    <item.icon className={`h-5 w-5 ${!collapsed && "mr-3"}`} />
                  </div>
                  {!collapsed && <span>{item.label}</span>}

                  {/* Tooltip */}
                  {collapsed && showTooltip === item.id && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-blue-100 text-sm rounded whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Groups Sub-Sidebar */}
        {showGroups && (
          <div className="border-t border-white/10">
            <ChannelList
              onChannelSelect={handleChannelSelect} // Pass the function
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-white/10 backdrop-blur-md bg-white/5">
          <div
            className={`flex ${
              collapsed ? "justify-center" : "items-center space-x-3"
            }`}
          >
            {!collapsed && (
              <>
                <img
                  src="/api/placeholder/32/32"
                  alt="User"
                  className="w-8 h-8 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-100">
                    John Doe
                  </h3>
                  <p className="text-xs text-blue-300">Online</p>
                </div>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => setOpen(false)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
