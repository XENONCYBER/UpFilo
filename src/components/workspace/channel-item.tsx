"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Hash, Volume2, Lock, Users, Globe } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "announcement" | "private";
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
};

const channelStyles = {
  text: "text-muted-foreground",
  voice: "text-green-500",
  announcement: "text-blue-500",
  private: "text-yellow-500",
};

export function ChannelItem({ channel, onClick, className }: ChannelItemProps) {
  const Icon = channelIcons[channel.type];

  return (
    <Button
      variant={channel.isActive ? "secondary" : "ghost"}
      onClick={() => onClick?.(channel)}
      className={cn(
        "w-full justify-start px-2 py-2 h-8 transition-all duration-200 group relative",
        channel.isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 mr-2 flex-shrink-0",
          channel.isActive
            ? "text-accent-foreground"
            : channelStyles[channel.type]
        )}
      />

      <span className="truncate text-sm">{channel.name}</span>

      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
        </span>
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
