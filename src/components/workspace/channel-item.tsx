"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Hash,
  Volume2,
  Lock,
  Users,
  Globe,
  User,
  MoreHorizontal,
  Edit,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteChannel } from "@/features/channels/api/use-delete-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { NameInputDialog } from "@/components/name-input-dialog";
import { Id } from "../../../convex/_generated/dataModel";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "announcement" | "private" | "user";
  isActive?: boolean;
  description?: string;
}

interface ChannelItemProps {
  channel: Channel;
  onClick?: (channel: Channel) => void;
  className?: string;
  showMenu?: boolean; // Add option to hide menu for certain contexts
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

export function ChannelItem({
  channel,
  onClick,
  className,
  showMenu = true,
}: ChannelItemProps) {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { mutate: deleteChannel } = useDeleteChannel();
  const { mutate: updateChannel } = useUpdateChannel();

  // For user channels, always use the User icon, otherwise use the type-based icon
  const Icon = channel.type === "user" ? User : channelIcons[channel.type];

  // For user channels, use the user style, otherwise use type-based style
  const iconStyle =
    channel.type === "user" ? channelStyles.user : channelStyles[channel.type];

  const handleRename = (newName: string) => {
    updateChannel({
      id: channel.id as Id<"channels">,
      name: newName.trim(),
    });
    setIsRenameModalOpen(false);
  };

  const handleDelete = () => {
    deleteChannel({
      id: channel.id as Id<"channels">,
    });
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <button
        onClick={() => onClick?.(channel)}
        className={cn(
          "w-full text-left px-3 py-2 transition-all duration-200 group relative rounded-xl flex items-center gap-3 min-h-[36px] hover:scale-[1.02]",
          channel.isActive
            ? "bg-gradient-to-r from-electric-blue/15 to-electric-blue/10 text-electric-blue font-medium shadow-sm border border-electric-blue/20"
            : "text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface/40 hover:shadow-sm",
          className
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-all duration-200",
            channel.isActive ? "text-electric-blue" : iconStyle
          )}
        />

        <span
          className={cn(
            "text-sm transition-all duration-200 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
            channel.isActive && "font-semibold"
          )}
        >
          {channel.name}
        </span>

        {/* 3-dot menu for channel actions */}
        {showMenu && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
            onClick={handleMenuClick}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg hover:bg-neomorphic-surface/60 transition-all duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text hover:scale-110">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="card-glass border border-neomorphic-border shadow-lg min-w-[140px] z-50 bg-neomorphic-bg"
                sideOffset={5}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenameModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-neomorphic-text hover:bg-neomorphic-surface-hover focus:bg-neomorphic-surface-hover cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950 dark:focus:bg-red-950 cursor-pointer"
                >
                  <Trash className="h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Active channel indicator */}
        {channel.isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-electric-blue rounded-r-full shadow-sm" />
        )}

        {/* Hover tooltip with description */}
        {channel.description && (
          <div className="absolute left-full ml-3 px-4 py-3 card-glass text-neomorphic-text text-sm rounded-xl shadow-neomorphic opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 max-w-xs border border-neomorphic-border/30">
            <p className="font-semibold text-neomorphic-text">
              #{channel.name}
            </p>
            <p className="text-xs text-neomorphic-text-secondary mt-1">
              {channel.description}
            </p>
          </div>
        )}
      </button>

      {/* Rename Modal */}
      <NameInputDialog
        isOpen={isRenameModalOpen}
        onNameSubmit={handleRename}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename channel"
        placeholder="Enter new channel name"
        defaultValue={channel.name}
        buttonText="Rename Channel"
        description="Enter a new name for this channel"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the channel "{channel.name}"? This
              action cannot be undone and all messages in this channel will be
              permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
