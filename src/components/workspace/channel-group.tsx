"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, MoreVertical } from "lucide-react";
import { ChannelItem } from "./channel-item";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Channel {
  id: string;
  name: string;
  type: "group" | "user";
  subType?: "text" | "voice" | "announcement" | "private";
  unreadCount?: number;
  isActive?: boolean;
  description?: string;
}

interface ChannelGroup {
  id: string;
  name: string;
  channels: Channel[];
  type: "group" | "user";
  isExpanded?: boolean;
}

interface ChannelGroupProps {
  group: ChannelGroup;
  onChannelSelect?: (channel: Channel) => void;
  onGroupToggle?: (groupId: string) => void;
  onAddChannel?: (groupId: string) => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  searchQuery?: string;
  className?: string;
}

export function ChannelGroup({
  group,
  onChannelSelect,
  onGroupToggle,
  onAddChannel,
  onEditGroup,
  onDeleteGroup,
  searchQuery,
  className,
}: ChannelGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.isExpanded ?? true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onGroupToggle?.(group.id);
  };

  const totalUnreadCount = group.channels.reduce(
    (total, channel) => total + (channel.unreadCount || 0),
    0
  );

  // Filter channels based on search query
  const filteredChannels = searchQuery
    ? group.channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : group.channels;

  return (
    <div className={cn("space-y-1", className)}>
      {/* Group Header */}
      <div className="flex items-center justify-between group px-1">
        <Button
          variant="ghost"
          onClick={handleToggle}
          className="flex-1 justify-start px-2 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 mr-1 transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
          <span className="uppercase tracking-wider">{group.name}</span>
          {totalUnreadCount > 0 && (
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )}
        </Button>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddChannel?.(group.id)}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEditGroup?.(group.id)}>
                Edit Group
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteGroup?.(group.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Channels List */}
      {isExpanded && (
        <div className="space-y-0.5 pl-3">
          {filteredChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={{
                ...channel,
                type: channel.subType || "text",
              }}
              onClick={() => onChannelSelect?.(channel)}
            />
          ))}

          {filteredChannels.length === 0 &&
            group.channels.length > 0 &&
            searchQuery && (
              <div className="text-xs text-muted-foreground px-2 py-2 italic">
                No channels match "{searchQuery}"
              </div>
            )}

          {group.channels.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-2 italic">
              No channels in this group
            </div>
          )}
        </div>
      )}
    </div>
  );
}
