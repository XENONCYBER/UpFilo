import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateChannelGroup } from "../api/use-create-channel-group";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";

interface CreateChannelGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "group" | "user";
  workspaceId?: any; // Optional for backwards compatibility
}

export const CreateChannelGroupModal = ({
  open,
  onOpenChange,
  type,
  workspaceId: propWorkspaceId,
}: CreateChannelGroupModalProps) => {
  // Use prop workspaceId if provided, otherwise use hook for backwards compatibility
  const hookWorkspaceId = useConvexWorkspaceId();
  const workspaceId = propWorkspaceId || hookWorkspaceId;
  const { mutate, isPending } = useCreateChannelGroup();

  const [name, setName] = useState("");
  const [password, setPass] = useState("");

  const handleClose = () => {
    setName("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace not found");
      return;
    }

    mutate(
      {
        workspaceId: workspaceId as any,
        name,
        type,
        password: password.trim(),
        isExpanded: true,
      },
      {
        onSuccess: () => {
          toast.success(
            `${type === "group" ? "Group" : "User"} folder created successfully!`
          );
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to create folder");
          console.error(error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-surface border-white/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Create {type === "group" ? "Group" : "User"} Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              autoFocus
              minLength={1}
              placeholder={`Enter ${type === "group" ? "group" : "user"} folder name...`}
              className="glass-input"
            />
            {type === "user" && (
              <Input
                id="user-folder-password"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                disabled={isPending}
                required
                autoFocus
                minLength={1}
                placeholder="Enter user folder password..."
                className="glass-input"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="glass-button-primary"
            >
              {isPending ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
