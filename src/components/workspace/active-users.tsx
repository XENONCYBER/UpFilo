"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users, Clock } from "lucide-react";

interface ActiveUser {
  userName: string;
  lastActivity: number;
  messageCount: number;
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
  // Get first letter of the name for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Max 2 letters
  };

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

  // Determine activity status color
  const getActivityColor = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 5) return "bg-soft-green"; // Very recent
    if (minutes < 30) return "bg-warm-orange"; // Recent
    return "bg-gray-400"; // Older
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!isCollapsed && (
        <>
          <div className="flex items-center space-x-2 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-neomorphic-text-secondary" />
            <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide">
              Active Users ({users.length})
            </span>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {users.map((user) => (
              <div
                key={user.userName}
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-neomorphic-surface/20 rounded-lg transition-colors duration-200"
                title={`${user.messageCount} messages, last seen ${formatLastActivity(user.lastActivity)}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-electric-purple text-white font-semibold text-xs">
                      {getInitials(user.userName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Activity status indicator */}
                  <span 
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neomorphic-surface",
                      getActivityColor(user.lastActivity)
                    )} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neomorphic-text truncate">
                      {user.userName}
                    </span>
                    <span className="text-[10px] text-neomorphic-text-secondary flex-shrink-0 ml-1">
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
        <div className="flex flex-col items-center space-y-1">
          <div 
            className="w-8 h-8 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title={`${users.length} active users`}
          >
            <Users className="h-4 w-4" />
          </div>
          
          {users.slice(0, 3).map((user) => (
            <div key={user.userName} className="relative flex-shrink-0">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-electric-purple text-white font-semibold text-[10px]">
                  {getInitials(user.userName)}
                </AvatarFallback>
              </Avatar>
              {/* Activity status indicator */}
              <span 
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-neomorphic-surface",
                  getActivityColor(user.lastActivity)
                )} 
              />
            </div>
          ))}
          
          {users.length > 3 && (
            <div className="text-[10px] text-neomorphic-text-secondary">
              +{users.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
