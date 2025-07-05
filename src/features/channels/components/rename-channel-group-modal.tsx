import { useState, useEffect } from "react";
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

import { useUpdateChannelGroup } from "../api/use-update-channel-group";
import { Id } from "../../../../convex/_generated/dataModel";

interface RenameChannelGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    _id: Id<"channelGroups">;
    name: string;
    type: "group" | "user";
  } | null;
}

export const RenameChannelGroupModal = ({
  open,
  onOpenChange,
  group,
}: RenameChannelGroupModalProps) => {
  const { mutate, isPending } = useUpdateChannelGroup();

  const [name, setName] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);

  const handleClose = () => {
    setName("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!group) return;

    mutate(
      {
        groupId: group._id,
        name: name !== group.name ? name : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Folder renamed successfully!");
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to rename folder");
          console.error(error);
        },
      }
    );
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-surface border-white/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Rename {group.type === "group" ? "Group" : "User"} Folder
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
              placeholder="Enter folder name..."
              className="glass-input"
            />
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
              {isPending ? "Renaming..." : "Rename Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
