"use client";

import { Search, Bell, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface WorkspaceHeaderProps {
  workspaceName?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  onSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
  className?: string;
}

export function WorkspaceHeader({
  workspaceName = "UpFilo",
  onMenuToggle,
  onSearch,
  onSidebarCollapse,
  isSidebarCollapsed = false,
  className,
}: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "h-14 flex-shrink-0 bg-neomorphic-bg border-b border-neomorphic-border/40 flex items-center justify-between px-4 z-40",
        className
      )}
    >
      {/* Left Section: Logo & Workspace Name */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          className="p-2 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-neomorphic-text md:hidden transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar collapse button - desktop only */}
        <button
          className="p-2 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-neomorphic-text hidden md:flex transition-colors"
          onClick={onSidebarCollapse}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="h-5 w-px bg-neomorphic-border/50 hidden md:block" />

        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-blue to-electric-purple flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
            {workspaceName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-neomorphic-text hidden sm:block group-hover:text-electric-blue transition-colors">
            {workspaceName}
          </span>
        </div>
      </div>

      {/* Center Section: Global Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text/50" />
          <Input
            placeholder="Search... ⌘K"
            className="pl-9 h-9 text-sm bg-neomorphic-surface/40 border-neomorphic-border/30 rounded-lg focus:bg-neomorphic-surface/60 focus:border-electric-blue/40 transition-all w-full placeholder:text-neomorphic-text-secondary/60"
            onFocus={() => onSearch?.("")}
            readOnly
          />
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <ThemeToggle />

        <button
          className="p-2 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-neomorphic-text relative transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-red rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
