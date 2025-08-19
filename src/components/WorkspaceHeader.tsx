"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  workspaceName?: string;
  currentChannel?: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

export function WorkspaceHeader({
  workspaceName = "UpFilo Workspace",
  currentChannel = "general",
  onMenuToggle,
  onSearch,
  className,
}: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "flex-shrink-0 card-glass flex items-center justify-between px-6 py-3 border-b border-neomorphic-border",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button className="btn-neomorphic p-2 md:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <h1 className="font-semibold text-neomorphic-text text-lg">
            {workspaceName}
          </h1>
          {currentChannel && (
            <>
              <span className="text-neomorphic-text-secondary text-lg">/</span>
              <span className="text-neomorphic-text-secondary font-medium text-lg">
                # {currentChannel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
          <Input
            placeholder="Search messages..."
            className="input-neomorphic pl-10 h-9"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        <button className="btn-neomorphic p-2 md:hidden">
          <Search className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
