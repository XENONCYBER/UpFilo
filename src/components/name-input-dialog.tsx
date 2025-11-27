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
      <DialogContent className="sm:max-w-md mx-auto relative bg-neomorphic-bg/95 backdrop-blur-xl border border-neomorphic-border/50 shadow-2xl rounded-3xl p-8">
        {/* Neomorphic decorative elements */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-neomorphic-surface rounded-full shadow-neomorphic-inset opacity-60" />
        <div className="absolute bottom-8 left-8 w-2 h-2 bg-neomorphic-surface rounded-full shadow-neomorphic-inset opacity-40" />
        <div className="absolute top-12 left-12 w-1.5 h-1.5 bg-neomorphic-surface rounded-full shadow-neomorphic-inset opacity-50" />

        {/* Main content */}
        <div className="relative">
          <DialogHeader className="space-y-4 text-center">
            {/* Neomorphic icon container */}
            <div className="mx-auto w-20 h-20 bg-neomorphic-surface rounded-3xl shadow-neomorphic-inset flex items-center justify-center mb-6 relative">
              <div className="w-12 h-12 bg-neomorphic-surface rounded-2xl shadow-neomorphic flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-neomorphic-text"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              {/* Small neomorphic accent */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-electric-blue rounded-full shadow-sm opacity-80" />
            </div>

            <DialogTitle className="heading-md text-2xl text-neomorphic-text">
              {workspaceName ? `Welcome to ${workspaceName}!` : title}
            </DialogTitle>
            <DialogDescription className="subtitle-md text-base leading-relaxed px-2">
              {description ||
                (workspaceName
                  ? `Enter your name to join ${workspaceName} and start collaborating with your team`
                  : placeholder)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <Label
                htmlFor="name-input"
                className="text-neomorphic-text font-semibold text-sm tracking-wide"
              >
                Display Name
              </Label>
              <div className="relative">
                <Input
                  id="name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name..."
                  className="input-neomorphic h-14 text-base text-neomorphic-text placeholder:text-neomorphic-text-secondary/60 focus:shadow-neomorphic-inset focus:border focus:border-electric-blue/40 rounded-2xl border-0 bg-neomorphic-surface/50"
                  disabled={isLoading}
                  autoFocus
                />
                {/* Neomorphic focus indicator */}
                {name.trim() && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-electric-blue rounded-full shadow-sm animate-pulse" />
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-neomorphic-text font-medium border border-neomorphic-border/50 hover:bg-neomorphic-surface transition-all duration-200"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-2xl text-white font-semibold border-0 bg-gradient-to-r from-electric-blue to-electric-purple shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {buttonText ||
                      (workspaceName ? "Join Workspace" : "Continue")}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
