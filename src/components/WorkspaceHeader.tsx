"use client";

import { Search, Bell, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LogoIcon } from "./logo";

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
        "h-14 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4 z-40",
        className
      )}
    >
      {/* Left Section: Logo & Workspace Name */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 md:hidden transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar collapse button - desktop only */}
        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hidden md:flex transition-colors"
          onClick={onSidebarCollapse}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center group-hover:shadow-lg transition-all">
            <LogoIcon size={20} />
          </div>
          <span className="font-semibold text-slate-800 dark:text-white hidden sm:block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {workspaceName}
          </span>
        </div>
      </div>

      {/* Center Section: Global Search */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search... ⌘K"
            className="pl-9 h-9 text-sm bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-300 dark:focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all w-full placeholder:text-slate-400"
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
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 relative transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
