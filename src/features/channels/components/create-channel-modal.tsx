import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChannel } from "../api/use-create-channels";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface CreateChannelModalProps {
  children: React.ReactNode;
  groupId?: Id<"channelGroups">;
  channelType: "group" | "user";
  onSuccess?: () => void;
}

export const CreateChannelModal = ({
  children,
  groupId,
  channelType,
  onSuccess,
}: CreateChannelModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subType, setSubType] = useState<
    "text" | "voice" | "announcement" | "private"
  >("text");

  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateChannel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace not found");
      return;
    }

    mutate(
      {
        name: name.trim(),
        workspaceId: workspaceId as Id<"workspaces">,
        type: channelType,
        subType,
        groupId,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Channel "${name}" created successfully`);
          setOpen(false);
          setName("");
          setDescription("");
          setSubType("text");
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create channel");
        },
      }
    );
  };

  const subTypeOptions =
    channelType === "group"
      ? [
          {
            value: "text",
            label: "Text Channel",
            description:
              "Send messages, images, GIFs, emoji, opinions, and puns",
          },
          {
            value: "voice",
            label: "Voice Channel",
            description:
              "Hang out together with voice, video, and screen share",
          },
          {
            value: "announcement",
            label: "Announcement Channel",
            description: "Important updates for your team",
          },
        ]
      : [
          {
            value: "private",
            label: "Direct Message",
            description: "Private conversation with a team member",
          },
        ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="glass-surface border-glass max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create {channelType === "group" ? "Channel" : "User Channel"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Channel Type</Label>
            <RadioGroup
              value={subType}
              onValueChange={(value: string) => setSubType(value as any)}
              className="space-y-2"
            >
              {subTypeOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={option.value}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label htmlFor="channel-name" className="text-sm font-medium">
              Channel Name
            </Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                channelType === "group"
                  ? "e.g. general, random, announcements"
                  : "e.g. John Doe"
              }
              className="glass-input"
            />
            <p className="text-xs text-muted-foreground">
              {channelType === "group"
                ? "Names must be lowercase, without spaces or periods, and can't be longer than 21 characters."
                : "Enter the name of the person you want to message."}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="channel-description"
              className="text-sm font-medium"
            >
              Description (optional)
            </Label>
            <Textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`What's this ${channelType === "group" ? "channel" : "conversation"} about?`}
              className="glass-input min-h-[80px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="glass-button-primary"
            >
              {isPending ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
