"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getUserColor, getUserInitials } from "@/lib/user-colors";
import { Users, Clock } from "lucide-react";

interface ActiveUser {
  userName: string;
  lastActivity: number;
  messageCount: number;
  status?: "online" | "offline" | "away";
  joinedAt?: number;
}

interface ActiveUsersProps {
  users: ActiveUser[];
  isCollapsed?: boolean;
  className?: string;
}

export function ActiveUsers({
  users,
  isCollapsed = false,
  className,
}: ActiveUsersProps) {
  // Deduplicate users by userName (keep the most recent activity)
  const uniqueUsers = users.reduce((acc: ActiveUser[], user) => {
    const existingIndex = acc.findIndex((u) => u.userName === user.userName);
    if (existingIndex === -1) {
      acc.push(user);
    } else if (user.lastActivity > acc[existingIndex].lastActivity) {
      acc[existingIndex] = user;
    }
    return acc;
  }, []);

  // Format last activity time
  const formatLastActivity = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return "1d+ ago";
  };

  // Determine activity status color based on user status and last activity
  const getActivityColor = (user: ActiveUser) => {
    // If user has explicit status, use that
    if (user.status === "online") return "bg-soft-green";
    if (user.status === "away") return "bg-warm-orange";
    if (user.status === "offline") return "bg-gray-400";

    // Fallback to time-based status for backwards compatibility
    const now = Date.now();
    const diff = now - user.lastActivity;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 5) return "bg-soft-green"; // Very recent
    if (minutes < 30) return "bg-warm-orange"; // Recent
    return "bg-gray-400"; // Older
  };

  if (uniqueUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!isCollapsed && (
        <>
          <div className="flex items-center space-x-2 px-3 py-2">
            <Users className="h-3.5 w-3.5 text-neomorphic-text-secondary opacity-80" />
            <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wider opacity-80">
              Active Users ({uniqueUsers.length})
            </span>
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {uniqueUsers.map((user) => (
              <div
                key={`user-${user.userName}`}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-neomorphic-surface/40 rounded-xl transition-all duration-200 group cursor-default"
                title={`${user.messageCount} messages, last seen ${formatLastActivity(user.lastActivity)}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-8 w-8 shadow-sm ring-2 ring-transparent group-hover:ring-neomorphic-border/50 transition-all duration-300">
                    <AvatarFallback
                      className={cn(
                        "text-white font-bold text-xs",
                        getUserColor(user.userName)
                      )}
                    >
                      {getUserInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Activity status indicator */}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neomorphic-bg shadow-sm",
                      getActivityColor(user)
                    )}
                    title={
                      user.status === "online"
                        ? "Online"
                        : user.status === "away"
                          ? "Away"
                          : "Offline"
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neomorphic-text truncate max-w-[120px] group-hover:text-electric-blue transition-colors">
                      {user.userName}
                    </span>
                    <span className="text-[10px] text-neomorphic-text-secondary flex-shrink-0 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                      {formatLastActivity(user.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Collapsed state - show only avatars */}
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-1.5">
          <div
            className="w-9 h-9 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title={`${uniqueUsers.length} active user${uniqueUsers.length !== 1 ? "s" : ""}`}
          >
            <Users className="h-4 w-4" />
          </div>

          {uniqueUsers.slice(0, 3).map((user) => (
            <div
              key={`collapsed-${user.userName}`}
              className="relative flex-shrink-0"
              title={`${user.userName} - ${user.status || "active"}`}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className={cn(
                    "text-white font-semibold text-[10px]",
                    getUserColor(user.userName)
                  )}
                >
                  {getUserInitials(user.userName)}
                </AvatarFallback>
              </Avatar>
              {/* Activity status indicator */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-neomorphic-bg",
                  getActivityColor(user)
                )}
              />
            </div>
          ))}

          {uniqueUsers.length > 3 && (
            <div
              className="text-[10px] text-neomorphic-text-secondary font-medium"
              title={`${uniqueUsers.length - 3} more user${uniqueUsers.length - 3 !== 1 ? "s" : ""}`}
            >
              +{uniqueUsers.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
