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

import { useUpdateChannel } from "../api/use-update-channel";
import { Id } from "../../../../convex/_generated/dataModel";

interface RenameChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: {
    _id: Id<"channels">;
    name: string;
    description?: string;
  } | null;
}

export const RenameChannelModal = ({
  open,
  onOpenChange,
  channel,
}: RenameChannelModalProps) => {
  const { mutate, isPending } = useUpdateChannel();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (channel) {
      setName(channel.name);
      setDescription(channel.description || "");
    }
  }, [channel]);

  const handleClose = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!channel) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const nameChanged = trimmedName !== channel.name;
    const descriptionChanged =
      trimmedDescription !== (channel.description || "");

    // If nothing changed, just close the modal
    if (!nameChanged && !descriptionChanged) {
      toast.info("No changes made");
      handleClose();
      return;
    }

    // Build the update object
    const updates: any = {};

    if (nameChanged && trimmedName.length > 0) {
      updates.name = trimmedName;
    }

    if (descriptionChanged) {
      updates.description = trimmedDescription;
    }

    mutate(
      {
        id: channel._id,
        name: updates.name,
        description: updates.description,
      },
      {
        onSuccess: () => {
          toast.success("Channel updated successfully!");
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to update channel");
          console.error(error);
        },
      }
    );
  };

  if (!channel) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-surface border-white/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Channel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              autoFocus
              minLength={1}
              placeholder="Enter channel name..."
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              placeholder="Enter channel description..."
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
              {isPending ? "Updating..." : "Update Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
