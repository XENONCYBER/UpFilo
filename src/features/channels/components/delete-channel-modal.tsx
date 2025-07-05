import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useDeleteChannel } from "../api/use-delete-channel";
import { Id } from "../../../../convex/_generated/dataModel";

interface DeleteChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: {
    _id: Id<"channels">;
    name: string;
  } | null;
}

export const DeleteChannelModal = ({
  open,
  onOpenChange,
  channel,
}: DeleteChannelModalProps) => {
  const { mutate, isPending } = useDeleteChannel();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!channel) return;

    mutate(
      { id: channel._id },
      {
        onSuccess: () => {
          toast.success("Channel deleted successfully!");
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to delete channel");
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
          <DialogTitle className="text-foreground">Delete Channel</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete the channel "{channel.name}"? This
            action cannot be undone and will permanently delete all messages in
            this channel.
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Deleting..." : "Delete Channel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
