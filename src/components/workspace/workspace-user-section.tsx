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
    <div className={cn("p-4 border-t border-border", className)}>
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}
      >
        <div className="relative">
          <Avatar className={cn(isCollapsed ? "h-10 w-10" : "h-8 w-8")}>
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          {/* Online status indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">
                {userName}
              </h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
