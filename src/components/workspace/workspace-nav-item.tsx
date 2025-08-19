"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface WorkspaceNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WorkspaceNavItem({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick,
  className,
}: WorkspaceNavItemProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "w-full transition-all duration-200 relative rounded-xl flex items-center overflow-hidden hover:scale-[1.02] focus:ring-2 focus:ring-electric-blue/20",
          isCollapsed
            ? "justify-center p-3 h-12 w-12"
            : "justify-start px-4 py-3 h-12",
          isActive
            ? "bg-gradient-to-r from-electric-blue to-electric-purple text-white shadow-lg border border-electric-blue/30"
            : "text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface/50 card-glass border border-neomorphic-border/30",
          className
        )}
      >
        <div className="relative flex items-center flex-shrink-0">
          <Icon
            className={cn(
              "h-5 w-5 transition-all duration-200",
              !isCollapsed && "mr-3",
              isActive ? "text-white" : "text-current"
            )}
          />
        </div>
        {!isCollapsed && (
          <span className="truncate font-medium text-sm min-w-0 flex-1">
            {label}
          </span>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm" />
        )}
      </button>

      {/* Enhanced tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-4 py-2 card-glass backdrop-blur-xl text-neomorphic-text text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-neomorphic-border/30">
          <span className="font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}
