"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { ChannelItem } from "./channel-item";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateChannelModal } from "@/features/channels/components/create-channel-modal";
import { RenameChannelGroupModal } from "@/features/channels/components/rename-channel-group-modal";
import { DeleteChannelGroupModal } from "@/features/channels/components/delete-channel-group-modal";
import { RenameChannelModal } from "@/features/channels/components/rename-channel-modal";
import { DeleteChannelModal } from "@/features/channels/components/delete-channel-modal";

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
  workspaceId: any; // Convex workspace ID
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
  workspaceId,
  onChannelSelect,
  onGroupToggle,
  onAddChannel,
  onEditGroup,
  onDeleteGroup,
  searchQuery,
  className,
}: ChannelGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.isExpanded ?? true);

  // Modal states
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [renameGroupModalOpen, setRenameGroupModalOpen] = useState(false);
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [renameChannelModalOpen, setRenameChannelModalOpen] = useState(false);
  const [deleteChannelModalOpen, setDeleteChannelModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onGroupToggle?.(group.id);
  };

  const handleAddChannel = () => {
    setCreateChannelModalOpen(true);
  };

  const handleEditGroup = () => {
    setRenameGroupModalOpen(true);
  };

  const handleDeleteGroup = () => {
    setDeleteGroupModalOpen(true);
  };

  const handleChannelContextMenu = (
    channel: Channel,
    action: "rename" | "delete"
  ) => {
    setSelectedChannel(channel);
    if (action === "rename") {
      setRenameChannelModalOpen(true);
    } else {
      setDeleteChannelModalOpen(true);
    }
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
    <>
      <div className={cn("space-y-1", className)}>
        {/* Group Header */}
        <div className="flex items-center justify-between group px-1">
          <Button
            variant="ghost"
            onClick={handleToggle}
            className="flex-1 justify-start px-2 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
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

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
            <CreateChannelModal
              workspaceId={workspaceId}
              groupId={group.id as any}
              channelType={group.type}
              onSuccess={() => {}}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
                title="Add channel"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </CreateChannelModal>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
                  title="Group options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 glass-surface border-white/20 z-[100]"
              >
                <DropdownMenuItem
                  onClick={handleEditGroup}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Rename Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteGroup}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Channels List */}
        {isExpanded && (
          <div className="space-y-0.5 pl-3">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="group/channel relative">
                <ChannelItem
                  channel={{
                    ...channel,
                    type: channel.subType || "text",
                  }}
                  onClick={() => onChannelSelect?.(channel)}
                />

                {/* Channel context menu */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/channel:opacity-100 transition-opacity duration-150 delay-75">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 glass-surface border-white/20 z-[100]"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          handleChannelContextMenu(channel, "rename")
                        }
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Rename Channel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleChannelContextMenu(channel, "delete")
                        }
                        className="text-destructive focus:text-destructive flex items-center gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Channel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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
                No channels in this folder
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RenameChannelGroupModal
        open={renameGroupModalOpen}
        onOpenChange={setRenameGroupModalOpen}
        group={group as any}
      />

      <DeleteChannelGroupModal
        open={deleteGroupModalOpen}
        onOpenChange={setDeleteGroupModalOpen}
        group={group as any}
      />

      <RenameChannelModal
        open={renameChannelModalOpen}
        onOpenChange={setRenameChannelModalOpen}
        channel={
          selectedChannel
            ? {
                _id: selectedChannel.id as any,
                name: selectedChannel.name,
                description: selectedChannel.description,
              }
            : null
        }
      />

      <DeleteChannelModal
        open={deleteChannelModalOpen}
        onOpenChange={setDeleteChannelModalOpen}
        channel={selectedChannel as any}
      />
    </>
  );
}
