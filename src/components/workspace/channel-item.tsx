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
  text: "text-neomorphic-text-secondary",
  voice: "text-soft-green",
  announcement: "text-electric-blue",
  private: "text-warm-orange",
  user: "text-electric-purple",
};

export function ChannelItem({ channel, onClick, className }: ChannelItemProps) {
  // For user channels, always use the User icon, otherwise use the type-based icon
  const Icon = channel.type === "user" ? User : channelIcons[channel.type];

  // For user channels, use the user style, otherwise use type-based style
  const iconStyle =
    channel.type === "user" ? channelStyles.user : channelStyles[channel.type];

  return (
    <button
      onClick={() => onClick?.(channel)}
      className={cn(
        "w-full text-left px-2 py-1.5 transition-all duration-200 group relative rounded-md flex items-center gap-2 min-h-[32px]",
        channel.isActive
          ? "bg-electric-blue/15 text-electric-blue font-medium"
          : "text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface/30",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors duration-200",
          channel.isActive ? "text-electric-blue" : iconStyle
        )}
      />

      <span
        className={cn(
          "text-sm transition-all duration-200 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
          channel.isActive && "font-medium"
        )}
      >
        {channel.name}
      </span>

      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="bg-coral-red text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center flex-shrink-0 font-medium">
          {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
        </span>
      )}

      {/* Active channel indicator */}
      {channel.isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-electric-blue rounded-r-sm" />
      )}

      {/* Hover tooltip with description */}
      {channel.description && (
        <div className="absolute left-full ml-2 px-3 py-2 card-glass text-neomorphic-text text-sm rounded-lg shadow-neomorphic opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 max-w-xs">
          <p className="font-medium"># {channel.name}</p>
          <p className="text-xs text-neomorphic-text-secondary mt-1">
            {channel.description}
          </p>
        </div>
      )}
    </button>
  );
}
