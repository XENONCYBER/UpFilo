"use client";

import { useState } from "react";
import { ChevronDown, Plus, MoreHorizontal, Trash, Edit } from "lucide-react";
import { ChannelItem } from "./channel-item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVerifyUserGroupPassword } from "@/features/channels/api/use-verify-user-group-password";
import { cn } from "@/lib/utils";
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
import { useCreateChannel } from "@/features/channels/api/use-create-channels";
import { useDeleteChannelGroup } from "@/features/channels/api/use-delete-channel-group";
import { useUpdateChannelGroup } from "@/features/channels/api/use-update-channel-group";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";
import { NameInputDialog } from "@/components/name-input-dialog";
import { Id } from "../../../convex/_generated/dataModel";

interface Channel {
  _id: Id<"channels">;
  name: string;
  type: "group" | "user";
  subType: "text" | "voice" | "announcement" | "private";
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
  // User channel groups are collapsed by default, group channels are expanded
  const [isExpanded, setIsExpanded] = useState(type === "group");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingChannel, setPendingChannel] = useState<Channel | null>(null);
  const verifyPassword = useVerifyUserGroupPassword();
  const workspaceId = useConvexWorkspaceId();
  const { mutate: deleteGroup } = useDeleteChannelGroup();
  const { mutate: createChannel } = useCreateChannel();
  const { mutate: updateGroup } = useUpdateChannelGroup();

  const onAddChannel = (channelName: string) => {
    console.log("Creating channel:", {
      name: channelName,
      workspaceId: workspaceId,
      groupId: id,
      type: type,
      subType: "text",
    });

    if (!workspaceId) {
      console.error("No workspace ID found");
      return;
    }

    createChannel(
      {
        name: channelName,
        workspaceId: workspaceId as Id<"workspaces">,
        groupId: id,
        type: type, // Use the group's type (group or user)
        subType: "text", // Default to text subtype
      },
      {
        onSuccess: (data) => {
          console.log("Channel created successfully:", data);
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error("Failed to create channel:", error);
        },
      }
    );
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
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Helper: session key for this group
  const sessionKey = `userGroupPassword:${id}`;

  // Handler for channel click
  const handleChannelClick = async (channel: Channel) => {
    if (type === "user") {
      // Check if password already verified in this session
      if (sessionStorage.getItem(sessionKey) === "verified") {
        onChannelSelect?.(channel);
        return;
      }
      setPendingChannel(channel);
      setShowPasswordDialog(true);
    } else {
      onChannelSelect?.(channel);
    }
  };

  // Handler for password submit
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingChannel) return;
    setPasswordError("");
    try {
      const isPasswordCorrect = await verifyPassword(id, passwordInput);
      if (isPasswordCorrect) {
        sessionStorage.setItem(sessionKey, "verified");
        setShowPasswordDialog(false);
        setPasswordInput("");
        setPasswordError("");
        onChannelSelect?.(pendingChannel);
        setPendingChannel(null);
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (err: any) {
      setPasswordError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-0.5 mb-1">
      <div className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neomorphic-surface/40 transition-colors min-h-[32px] cursor-pointer">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-x-2 text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wider flex-1 min-w-0 text-left hover:text-neomorphic-text transition-colors duration-200"
        >
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-300 ease-in-out flex-shrink-0 text-neomorphic-text-secondary/70",
              !isExpanded && "-rotate-90"
            )}
          />
          <span className="select-none font-bold overflow-hidden text-ellipsis whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
            {name}
          </span>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 flex-shrink-0 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="p-1.5 rounded-md hover:bg-neomorphic-surface/80 transition-all duration-200 text-neomorphic-text-secondary hover:text-electric-blue hover:scale-110 focus:outline-none focus:opacity-100"
            title="Create Channel"
          >
            <Plus className="size-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md hover:bg-neomorphic-surface/80 transition-all duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text hover:scale-110 focus:outline-none focus:opacity-100"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border border-neomorphic-border/50 shadow-2xl min-w-[160px] z-[9999] bg-neomorphic-bg backdrop-blur-xl rounded-lg p-1"
              sideOffset={8}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenameModalOpen(true);
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-neomorphic-text hover:bg-neomorphic-surface/60 focus:bg-neomorphic-surface/60 cursor-pointer rounded-lg transition-colors whitespace-nowrap"
              >
                <Edit className="h-4 w-4 flex-shrink-0 text-electric-blue" />
                <span className="font-medium">Rename Group</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer rounded-lg transition-colors whitespace-nowrap"
              >
                <Trash className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Delete Group</span>
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
                description: channel.description,
              }}
              onClick={() => handleChannelClick(channel)}
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
        buttonText="Create Channel"
        description="Enter a name for your new channel"
      />

      <NameInputDialog
        isOpen={isRenameModalOpen}
        onNameSubmit={onRenameGroup}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename group"
        placeholder="Enter new group name"
        defaultValue={name}
        buttonText="Rename Group"
        description="Enter a new name for this channel group"
      />

      {/* Password Dialog for user-type groups */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent
          onClose={() => {
            setShowPasswordDialog(false);
            setPasswordInput("");
            setPasswordError("");
            setPendingChannel(null);
          }}
        >
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle>Enter Group Password</DialogTitle>
              <DialogDescription>
                This channel group is protected. Please enter the password to
                continue.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              className="mt-4"
            />
            {passwordError && (
              <div className="text-red-500 text-sm mt-2">{passwordError}</div>
            )}
            <DialogFooter className="mt-4">
              <Button type="submit" variant="default">
                Submit
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordInput("");
                  setPasswordError("");
                  setPendingChannel(null);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Channel Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{name}"?
              {channels && channels.length > 0 && (
                <>
                  <br />
                  <br />
                  This will delete the group but keep all {channels.length}{" "}
                  channel(s) as ungrouped channels.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
