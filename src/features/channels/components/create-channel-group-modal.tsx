import { useState } from "react";
import { toast } from "sonner";
import { Layers, Folder, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  workspaceId?: any;
}

export const CreateChannelGroupModal = ({
  open,
  onOpenChange,
  type,
  workspaceId: propWorkspaceId,
}: CreateChannelGroupModalProps) => {
  const hookWorkspaceId = useConvexWorkspaceId();
  const workspaceId = propWorkspaceId || hookWorkspaceId;
  const { mutate, isPending } = useCreateChannelGroup();

  const [name, setName] = useState("");
  const [password, setPass] = useState("");

  const handleClose = () => {
    setName("");
    setPass("");
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

  const Icon = type === "group" ? Layers : Users;
  const iconColor =
    type === "group"
      ? "from-electric-blue to-electric-purple"
      : "from-electric-purple to-coral-red";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="card-glass border-neomorphic-border/50 backdrop-blur-xl shadow-2xl max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`neomorphic-raised w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconColor} shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-neomorphic-text">
                Create {type === "group" ? "Group" : "User"} Folder
              </DialogTitle>
              <DialogDescription className="text-neomorphic-text-secondary text-sm mt-1">
                Organize your{" "}
                {type === "group" ? "group channels" : "user channels"} into
                folders
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-3">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-neomorphic-text"
            >
              Folder Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              minLength={1}
              maxLength={50}
              placeholder={`Enter ${type === "group" ? "group" : "user"} folder name...`}
              className="input-glass h-11 text-base border-neomorphic-border/50 focus:border-electric-blue/50 focus:ring-2 focus:ring-electric-blue/20 transition-all"
            />
          </div>

          {type === "user" && (
            <div className="space-y-3">
              <Label
                htmlFor="user-folder-password"
                className="text-sm font-semibold text-neomorphic-text"
              >
                Folder Password
              </Label>
              <Input
                id="user-folder-password"
                type="password"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                disabled={isPending}
                required
                minLength={1}
                placeholder="Enter user folder password..."
                className="input-glass h-11 text-base border-neomorphic-border/50 focus:border-electric-purple/50 focus:ring-2 focus:ring-electric-purple/20 transition-all"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neomorphic-border/30">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
              className="btn-glass hover:bg-neomorphic-surface/60"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="btn-primary shadow-lg hover:shadow-xl transition-all"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Create Folder
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
