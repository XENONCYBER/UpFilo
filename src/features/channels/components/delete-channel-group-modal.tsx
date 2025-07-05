import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useDeleteChannelGroup } from "../api/use-delete-channel-group";
import { Id } from "../../../../convex/_generated/dataModel";

interface DeleteChannelGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: {
    _id: Id<"channelGroups">;
    name: string;
    type: "group" | "user";
  } | null;
}

export const DeleteChannelGroupModal = ({
  open,
  onOpenChange,
  group,
}: DeleteChannelGroupModalProps) => {
  const { mutate, isPending } = useDeleteChannelGroup();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!group) return;

    mutate(
      { groupId: group._id },
      {
        onSuccess: () => {
          toast.success("Folder deleted successfully!");
          handleClose();
        },
        onError: (error) => {
          toast.error("Failed to delete folder");
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
          <DialogTitle className="text-foreground">Delete Folder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete the "{group.name}" folder? All
            channels in this folder will be moved to the root level. This action
            cannot be undone.
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
            {isPending ? "Deleting..." : "Delete Folder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
