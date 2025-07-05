"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NameInputDialogProps {
  isOpen: boolean;
  onNameSubmit: (name: string) => void;
  workspaceName?: string;
}

export function NameInputDialog({
  isOpen,
  onNameSubmit,
  workspaceName,
}: NameInputDialogProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onNameSubmit(name.trim());
    } catch (error) {
      console.error("Error submitting name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to {workspaceName || "UpFilo"}!</DialogTitle>
          <DialogDescription>
            Please enter your name to start chatting. This will be displayed as
            the sender of your messages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? "Joining..." : "Join Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
