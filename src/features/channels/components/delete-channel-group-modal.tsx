import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

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
      <DialogContent className="card-glass border-neomorphic-border/50 backdrop-blur-xl shadow-2xl max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="neomorphic-raised w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-neomorphic-text">
                Delete Folder
              </DialogTitle>
              <DialogDescription className="text-neomorphic-text-secondary text-sm mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
          <p className="text-sm text-neomorphic-text">
            Are you sure you want to delete the <span className="font-semibold">"{group.name}"</span> folder? 
            All channels in this folder will be moved to the root level.
          </p>
        </div>

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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Folder
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
