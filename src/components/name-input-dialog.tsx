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
  buttonText?: string;
  description?: string;
}

export function NameInputDialog({
  isOpen,
  onNameSubmit,
  onClose,
  title = "Welcome to UpFilo!",
  placeholder = "Enter your name to start chatting",
  workspaceName,
  defaultValue = "",
  buttonText,
  description,
}: NameInputDialogProps) {
  const [name, setName] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  // Update name when defaultValue or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
      setIsLoading(false); // Reset loading state when dialog opens
    }
  }, [defaultValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onNameSubmit(name.trim());
    // Don't clear the name here - let the parent component handle it
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-glass backdrop-blur-xl border-neomorphic-border/50 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold text-neomorphic-text">
            {workspaceName ? `Welcome to ${workspaceName}!` : title}
          </DialogTitle>
          <DialogDescription className="text-neomorphic-text-secondary">
            {description ||
              (workspaceName
                ? `Enter your name to join ${workspaceName} and start collaborating with your team`
                : placeholder)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label
              htmlFor="name-input"
              className="text-neomorphic-text font-medium"
            >
              Display Name
            </Label>
            <Input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name..."
              className="input-neomorphic h-11 text-base border-neomorphic-border/50 focus:border-electric-blue/50 focus:ring-2 focus:ring-electric-blue/20"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="btn-neomorphic flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex-1 font-semibold"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                buttonText || (workspaceName ? "Join Workspace" : "Continue")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
