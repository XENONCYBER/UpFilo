"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search, Hash } from "lucide-react";
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
        "flex-shrink-0 card-glass backdrop-blur-xl flex items-center justify-between px-4 py-3 border-b border-neomorphic-border/40 shadow-sm",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          className="btn-neomorphic p-2 md:hidden hover:scale-105 transition-transform duration-200"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-blue to-electric-purple flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {workspaceName?.charAt(0).toUpperCase() || "W"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="heading-md text-sm">{workspaceName}</span>
            {currentChannel && (
              <span className="text-xs text-neomorphic-text-secondary flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-electric-blue" />
                {currentChannel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 px-4 hidden sm:flex items-center justify-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
          <Input
            placeholder="Search messages and files... (Ctrl+K)"
            className="pl-10 h-10 rounded-xl bg-neomorphic-surface/40 border border-neomorphic-border/40 focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/20"
            onFocus={() => onSearch?.("")}
            readOnly
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button
          className="btn-neomorphic p-2 hidden md:inline-flex hover:scale-105 transition-transform duration-200"
          onClick={() => onSearch?.("")}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-neomorphic-surface/20 border border-neomorphic-border/30">
          <div className="w-2.5 h-2.5 bg-soft-green rounded-full animate-pulse" />
          <span className="text-xs font-medium text-neomorphic-text-secondary">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
