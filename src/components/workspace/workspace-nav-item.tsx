"use client";

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
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "w-full transition-all duration-300 relative rounded-xl flex items-center overflow-hidden group focus:outline-none focus:ring-2 focus:ring-electric-blue/30",
        isCollapsed
          ? "justify-center p-3 h-12 w-12"
          : "justify-start px-4 py-3 h-12",
        isActive
          ? "bg-gradient-to-r from-electric-blue to-electric-purple text-white shadow-lg shadow-electric-blue/25 border border-electric-blue/30 scale-[1.02]"
          : "text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface/50 card-glass border border-neomorphic-border/30 hover:border-neomorphic-border/50 hover:scale-[1.02] hover:shadow-md",
        className
      )}
    >
      {/* Background glow effect on hover */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/0 via-electric-blue/5 to-electric-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative flex items-center flex-shrink-0 z-10">
        <Icon
          className={cn(
            "h-5 w-5 transition-all duration-300",
            !isCollapsed && "mr-3",
            isActive
              ? "text-white drop-shadow-sm"
              : "text-current group-hover:scale-110"
          )}
        />
      </div>
      {!isCollapsed && (
        <span className="truncate font-medium text-sm min-w-0 flex-1 z-10">
          {label}
        </span>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm animate-pulse" />
      )}
    </button>
  );

  if (isCollapsed) {
    return content;
  }

  return content;
}
