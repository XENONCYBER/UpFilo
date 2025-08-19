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
        "flex-shrink-0 card-glass backdrop-blur-xl flex items-center justify-between px-6 py-4 border-b border-neomorphic-border/50 shadow-sm",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          className="btn-neomorphic p-2 md:hidden hover:scale-105 transition-transform duration-200"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-electric-blue to-electric-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {workspaceName?.charAt(0).toUpperCase() || "W"}
              </span>
            </div>
            <h1 className="font-bold text-neomorphic-text text-xl">
              {workspaceName}
            </h1>
          </div>
          {currentChannel && (
            <>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-neomorphic-text-secondary text-lg font-light">
                  /
                </span>
                <span className="text-neomorphic-text font-medium text-lg flex items-center gap-1">
                  <Hash className="w-4 h-4 text-electric-blue" />
                  {currentChannel}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
          <Input
            placeholder="Search messages and files..."
            className="input-neomorphic pl-11 h-10 bg-neomorphic-surface/30 border-neomorphic-border/50 focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/20"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        <button className="btn-neomorphic p-2 md:hidden hover:scale-105 transition-transform duration-200">
          <Search className="h-5 w-5" />
        </button>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-soft-green/10 border border-soft-green/20">
          <div className="w-2 h-2 bg-soft-green rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-soft-green">Online</span>
        </div>
      </div>
    </header>
  );
}
