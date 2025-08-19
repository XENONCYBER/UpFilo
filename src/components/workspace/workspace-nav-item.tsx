"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface WorkspaceNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  notification?: number;
  onClick?: () => void;
  className?: string;
}

export function WorkspaceNavItem({
  icon: Icon,
  label,
  isActive = false,
  isCollapsed = false,
  notification,
  onClick,
  className,
}: WorkspaceNavItemProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "w-full transition-all duration-200 relative rounded-neomorphic flex items-center overflow-hidden",
          isCollapsed
            ? "justify-center px-2 h-12 w-12"
            : "justify-start px-4 h-11",
          isActive
            ? "btn-primary text-white shadow-neomorphic-pressed"
            : "text-neomorphic-text-secondary hover:text-neomorphic-text btn-neomorphic interactive-lift",
          className
        )}
      >
        <div className="relative flex items-center flex-shrink-0">
          <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {notification && notification > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 bg-coral-red text-white text-xs rounded-full flex items-center justify-center",
                isCollapsed &&
                  "top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
              )}
            >
              {notification > 99 ? "99+" : notification}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap min-w-0 flex-1">
            {label}
          </span>
        )}
      </button>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 card-glass text-neomorphic-text text-sm rounded-neomorphic shadow-neomorphic opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          {notification && notification > 0 && (
            <span className="ml-2 text-coral-red">({notification})</span>
          )}
        </div>
      )}
    </div>
  );
}
