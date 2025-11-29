"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getUserColor, getUserInitials } from "@/lib/user-colors";
import { LogOut } from "lucide-react";

interface WorkspaceUserSectionProps {
  userName: string;
  isCollapsed?: boolean;
  onLogout?: () => void;
  className?: string;
}

export function WorkspaceUserSection({
  userName,
  isCollapsed = false,
  onLogout,
  className,
}: WorkspaceUserSectionProps) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden transition-all duration-300",
        isCollapsed ? "justify-center" : "space-x-3",
        className
      )}
    >
      <div className="relative flex-shrink-0 group">
        <Avatar
          className={cn(
            "transition-all duration-300 shadow-md ring-2 ring-transparent group-hover:ring-electric-blue/30",
            isCollapsed ? "h-10 w-10" : "h-10 w-10"
          )}
        >
          <AvatarFallback
            className="text-white font-bold text-sm shadow-inner"
            style={{ backgroundColor: getUserColor(userName) }}
          >
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>
        {/* Online status indicator */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-soft-green rounded-full border-2 border-neomorphic-bg shadow-sm animate-pulse" />
      </div>

      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-sm font-bold text-neomorphic-text truncate text-ellipsis whitespace-nowrap hover:text-electric-blue transition-colors cursor-default">
              {userName}
            </h3>
            <p className="text-[10px] text-neomorphic-text-secondary font-medium truncate">
              Online
            </p>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={onLogout}
              className="flex items-center justify-center h-9 w-9 p-0 rounded-xl bg-neomorphic-surface/50 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900 text-neomorphic-text-secondary hover:text-coral-red transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 mr-2"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
