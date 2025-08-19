"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
  // Get first letter of the name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Max 2 letters
  };

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "flex items-center overflow-hidden",
          isCollapsed ? "justify-center" : "space-x-3"
        )}
      >
        <div className="relative flex-shrink-0">
          <Avatar className={cn(isCollapsed ? "h-10 w-10" : "h-9 w-9")}>
            <AvatarFallback className="bg-electric-blue text-white font-semibold text-sm neomorphic-raised">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          {/* Online status indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-soft-green rounded-full border-2 border-neomorphic-surface shadow-neomorphic" />
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-sm font-semibold text-neomorphic-text truncate text-ellipsis whitespace-nowrap">
                {userName}
              </h3>
              <p className="text-xs text-neomorphic-text-secondary">Online</p>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={onLogout}
                className="flex items-center justify-center h-8 w-8 p-0 rounded-neomorphic bg-neomorphic-surface border-none text-neomorphic-text-secondary hover:text-coral-red transition-colors duration-200 shadow-neomorphic hover:shadow-neomorphic-pressed"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
