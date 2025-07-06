"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hash, Volume2, Lock, Users, Globe, User } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "announcement" | "private" | "user";
  unreadCount?: number;
  isActive?: boolean;
  description?: string;
}

interface ChannelItemProps {
  channel: Channel;
  onClick?: (channel: Channel) => void;
  className?: string;
}

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Users,
  private: Lock,
  user: User,
};

const channelStyles = {
  text: "text-muted-foreground",
  voice: "text-green-500",
  announcement: "text-blue-500",
  private: "text-yellow-500",
  user: "text-blue-400",
};

export function ChannelItem({ channel, onClick, className }: ChannelItemProps) {
  // For user channels, always use the User icon, otherwise use the type-based icon
  const Icon = channel.type === "user" ? User : channelIcons[channel.type];

  // For user channels, use the user style, otherwise use type-based style
  const iconStyle =
    channel.type === "user" ? channelStyles.user : channelStyles[channel.type];

  return (
    <Button
      variant="ghost"
      onClick={() => onClick?.(channel)}
      className={cn(
        "w-full justify-start px-2 py-2 h-8 transition-all duration-200 group relative border-l-2",
        channel.isActive
          ? "glass-surface bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-l-blue-500 shadow-inner backdrop-blur-xl font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 border-l-transparent hover:border-l-white/30 dark:hover:border-l-white/20",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 mr-2 flex-shrink-0 transition-colors duration-200",
          channel.isActive ? "text-blue-600 dark:text-blue-400" : iconStyle
        )}
      />

      <span
        className={cn(
          "truncate text-sm transition-all duration-200",
          channel.isActive && "font-medium"
        )}
      >
        {channel.name}
      </span>

      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
        </span>
      )}

      {/* Active channel indicator */}
      {channel.isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r-sm" />
      )}

      {/* Hover tooltip with description */}
      {channel.description && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-xs">
          <p className="font-medium"># {channel.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {channel.description}
          </p>
        </div>
      )}
    </Button>
  );
}
