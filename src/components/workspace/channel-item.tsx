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
  ArrowRight,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const { mutate: deleteChannel, isPending: isDeleting } = useDeleteChannel();
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
    deleteChannel(
      { id: channel.id as Id<"channels"> },
      {
        onSuccess: () => {
          setIsFinalConfirmOpen(false);
          setIsDeleteConfirmOpen(false);
          setDeleteConfirmationName("");
        },
      }
    );
  };

  const confirmDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleProceedToFinalConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setIsFinalConfirmOpen(true);
  };

  const handleCancelFinalConfirm = () => {
    setIsFinalConfirmOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(channel);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Prevent the touch event from triggering additional click events
    e.stopPropagation();
  };

  const channelButton = (
    <button
      onClick={handleChannelClick}
      onTouchEnd={handleTouchEnd}
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

      {/* Delete Confirmation Dialog - Step 1: Type Name */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          setIsDeleteConfirmOpen(open);
          if (!open) {
            setDeleteConfirmationName("");
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#30363d]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-[#e6edf3] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-[#f85149]/10 flex items-center justify-center">
                <Trash className="w-5 h-5 text-red-500 dark:text-[#f85149]" />
              </div>
              Delete Channel
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-slate-600 dark:text-[#8d96a0]">
                <p>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                    "{channel.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <br />
                <span className="text-red-500 dark:text-[#f85149] font-medium">
                  This will permanently delete:
                </span>
                <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                  <li>All messages in this channel</li>
                  <li>All uploaded files and media</li>
                </ul>

                {/* Confirmation Input */}
                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-[#c9d1d9]">
                    Type{" "}
                    <span className="font-bold text-red-500 dark:text-[#f85149]">
                      "{channel.name}"
                    </span>{" "}
                    to confirm:
                  </label>
                  <Input
                    value={deleteConfirmationName}
                    onChange={(e) => setDeleteConfirmationName(e.target.value)}
                    placeholder="Enter channel name..."
                    className="h-10 bg-slate-100/80 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] focus:border-red-400 dark:focus:border-[#f85149] focus:ring-red-500/20 dark:focus:ring-[#f85149]/20 text-slate-800 dark:text-[#e6edf3] placeholder:text-slate-400 dark:placeholder:text-[#8d96a0]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-[#c9d1d9] border-slate-200 dark:border-[#30363d]"
              onClick={() => {
                setDeleteConfirmationName("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleProceedToFinalConfirm}
              disabled={deleteConfirmationName !== channel.name}
              className="bg-red-500 dark:bg-[#f85149] hover:bg-red-600 dark:hover:bg-[#da3633] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Continue
              </div>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Channel Final Confirmation Dialog - Step 2 */}
      <AlertDialog
        open={isFinalConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setIsFinalConfirmOpen(false);
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#30363d]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-[#e6edf3] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-[#f85149]/10 flex items-center justify-center">
                <Trash className="w-5 h-5 text-red-500 dark:text-[#f85149]" />
              </div>
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-[#8d96a0]">
              <p className="text-base">
                You are about to{" "}
                <span className="font-bold text-red-500 dark:text-[#f85149]">
                  permanently delete
                </span>{" "}
                the channel{" "}
                <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                  "{channel.name}"
                </span>
                .
              </p>
              <br />
              <p className="text-sm bg-red-50 dark:bg-[#f85149]/10 border border-red-200 dark:border-[#f85149]/30 rounded-lg p-3 text-red-600 dark:text-[#f85149]">
                ⚠️ This action is <strong>irreversible</strong>. All messages
                and files will be permanently lost.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={handleCancelFinalConfirm}
              className="bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-[#c9d1d9] border-slate-200 dark:border-[#30363d]"
            >
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 dark:bg-[#f85149] hover:bg-red-600 dark:hover:bg-[#da3633] text-white disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash className="w-4 h-4" />
                  Yes, Delete Channel
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
