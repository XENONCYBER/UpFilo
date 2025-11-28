import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Edit2, Layers, Users } from "lucide-react";

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

  const Icon = group.type === "group" ? Layers : Users;
  const iconColor =
    group.type === "group"
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
              <Edit2 className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-neomorphic-text">
                Rename {group.type === "group" ? "Group" : "User"} Folder
              </DialogTitle>
              <DialogDescription className="text-neomorphic-text-secondary text-sm mt-1">
                Update the name of your folder
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
              placeholder="Enter folder name..."
              className="input-glass h-11 text-base border-neomorphic-border/50 focus:border-electric-blue/50 focus:ring-2 focus:ring-electric-blue/20 transition-all"
            />
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
              type="submit"
              disabled={isPending}
              className="btn-primary shadow-lg hover:shadow-xl transition-all"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Renaming...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Rename Folder
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
