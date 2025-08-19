"use client";

import { useState } from "react";
import { ChevronDown, Plus, MoreHorizontal, Trash, Edit } from "lucide-react";
import { ChannelItem } from "./channel-item";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateChannel } from "@/features/channels/api/use-create-channels";
import { useDeleteChannelGroup } from "@/features/channels/api/use-delete-channel-group";
import { useUpdateChannelGroup } from "@/features/channels/api/use-update-channel-group";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Hint } from "./hint";
import { NameInputDialog } from "@/components/name-input-dialog";
import { Id } from "../../../convex/_generated/dataModel";

interface Channel {
  _id: Id<"channels">;
  name: string;
  type: "group" | "user";
  subType: "text" | "voice" | "announcement" | "private";
  unreadCount?: number;
  isActive?: boolean;
  description?: string;
}

interface ChannelGroupProps {
  id: Id<"channelGroups">;
  name: string;
  channels: Channel[];
  type: "group" | "user";
  isExpanded?: boolean;
  onChannelSelect?: (channel: Channel) => void;
}

export const ChannelGroup = ({
  id,
  name,
  channels,
  type,
  onChannelSelect,
}: ChannelGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const workspaceId = useWorkspaceId();
  const { mutate: deleteGroup } = useDeleteChannelGroup();
  const { mutate: createChannel } = useCreateChannel();
  const { mutate: updateGroup } = useUpdateChannelGroup();

  const onAddChannel = (channelName: string) => {
    createChannel({
      name: channelName,
      workspaceId: workspaceId as Id<"workspaces">,
      groupId: id,
      type: type, // Use the group's type (group or user)
      subType: "text", // Default to text subtype
    });
  };

  const onRenameGroup = (newName: string) => {
    updateGroup({
      groupId: id,
      name: newName.trim(),
    });
    setIsRenameModalOpen(false);
  };

  const onDelete = () => {
    deleteGroup({ groupId: id });
  };

  return (
    <div className="space-y-1 mb-3">
      <div className="group flex items-center justify-between px-2 py-2 rounded-lg hover:bg-neomorphic-surface/30 transition-all duration-200 min-h-[2.5rem]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-x-2 text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide flex-1 min-w-0 text-left hover:text-neomorphic-text transition-colors duration-200"
        >
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-200 flex-shrink-0",
              !isExpanded && "-rotate-90"
            )}
          />
          <span className="select-none font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
            {name}
          </span>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <Hint label="Create Channel" side="top">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-md hover:bg-neomorphic-surface/50 transition-colors duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text"
            >
              <Plus className="size-3.5" />
            </button>
          </Hint>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-neomorphic-surface/50 transition-colors duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text">
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="card-glass border border-neomorphic-border shadow-lg min-w-[160px] z-50 bg-neomorphic-bg"
              sideOffset={5}
            >
              <DropdownMenuItem
                onClick={() => setIsRenameModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neomorphic-text hover:bg-neomorphic-surface-hover focus:bg-neomorphic-surface-hover cursor-pointer"
              >
                <Edit className="size-4" />
                Rename Group
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950 dark:focus:bg-red-950 cursor-pointer"
              >
                <Trash className="size-4" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="pl-4 space-y-0.5">
          {channels?.map((channel) => (
            <ChannelItem
              key={channel._id}
              channel={{
                id: channel._id,
                name: channel.name,
                type: channel.subType,
                isActive: channel.isActive,
                unreadCount: channel.unreadCount,
                description: channel.description,
              }}
              onClick={() => onChannelSelect?.(channel)}
            />
          ))}
        </div>
      )}

      <NameInputDialog
        isOpen={isModalOpen}
        onNameSubmit={onAddChannel}
        onClose={() => setIsModalOpen(false)}
        title="Create a new channel"
        placeholder="Enter channel name"
      />

      <NameInputDialog
        isOpen={isRenameModalOpen}
        onNameSubmit={onRenameGroup}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename group"
        placeholder="Enter new group name"
        defaultValue={name}
      />
    </div>
  );
};
