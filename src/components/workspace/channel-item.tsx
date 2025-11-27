"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Hash,
  Volume2,
  Lock,
  Users,
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
  DropdownMenuSeparator,
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
  showMenu?: boolean;
}

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Users,
  private: Lock,
  user: User,
};

const channelStyles = {
  text: "text-neomorphic-text-secondary group-hover:text-electric-blue",
  voice: "text-soft-green group-hover:text-soft-green",
  announcement: "text-electric-blue group-hover:text-electric-blue",
  private: "text-warm-orange group-hover:text-warm-orange",
  user: "text-electric-purple group-hover:text-electric-purple",
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

  const Icon = channel.type === "user" ? User : channelIcons[channel.type];
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

  const channelButton = (
    <button
      onClick={() => onClick?.(channel)}
      className={cn(
        "w-full text-left px-2.5 py-1.5 transition-colors group relative rounded-md flex items-center gap-2.5 min-h-[32px] focus:outline-none",
        channel.isActive
          ? "bg-electric-blue/10 text-electric-blue font-medium border-l-2 border-electric-blue"
          : "text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface/50",
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 flex-shrink-0 transition-colors",
          channel.isActive ? "text-electric-blue" : iconStyle
        )}
      />

      <span
        className={cn(
          "text-sm transition-colors flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
          channel.isActive && "font-medium"
        )}
      >
        {channel.name}
      </span>

      {/* 3-dot menu */}
      {showMenu && (
        <div
          className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 flex-shrink-0 z-10"
          onClick={handleMenuClick}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-neomorphic-surface/80 transition-all duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text hover:scale-110 focus:outline-none focus:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="card-glass border border-neomorphic-border/50 shadow-2xl min-w-[160px] z-50 backdrop-blur-xl"
              sideOffset={8}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenameModalOpen(true);
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-neomorphic-text hover:bg-neomorphic-surface/60 focus:bg-neomorphic-surface/60 cursor-pointer rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4 text-electric-blue" />
                <span className="font-medium">Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neomorphic-border/30" />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/30 dark:focus:bg-red-950/30 cursor-pointer rounded-lg transition-colors"
              >
                <Trash className="h-4 w-4" />
                <span className="font-medium">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </button>
  );

  return (
    <>
      {channelButton}

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
        <AlertDialogContent className="card-glass border-neomorphic-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-neomorphic-text">
              Delete Channel
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neomorphic-text-secondary">
              Are you sure you want to delete the channel "{channel.name}"? This
              action cannot be undone and all messages in this channel will be
              permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-glass">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Delete Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
