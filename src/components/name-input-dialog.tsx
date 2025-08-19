"use client";

import { useState, useEffect } from "react";
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
  onClose: () => void;
  title?: string;
  placeholder?: string;
  workspaceName?: string;
  defaultValue?: string;
}

export function NameInputDialog({
  isOpen,
  onNameSubmit,
  onClose,
  title = "Welcome to UpFilo!",
  placeholder = "Enter your name to start chatting",
  workspaceName,
  defaultValue = "",
}: NameInputDialogProps) {
  const [name, setName] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  // Update name when defaultValue or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
    }
  }, [defaultValue, isOpen]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-glass">
        <DialogHeader>
          <DialogTitle>
            {workspaceName ? `Welcome to ${workspaceName}!` : title}
          </DialogTitle>
          <DialogDescription>
            {workspaceName
              ? `Enter your name to join ${workspaceName} and start collaborating`
              : placeholder}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-input" className="text-neomorphic-text">
              Name
            </Label>
            <Input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="input-neomorphic"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Joining..." : "Join Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
