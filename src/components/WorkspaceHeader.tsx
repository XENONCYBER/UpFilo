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
        "flex items-center justify-between p-4 border-b border-border glass-effect",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <h1 className="font-semibold text-foreground text-lg">
            {workspaceName}
          </h1>
          {currentChannel && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground font-medium">
                # {currentChannel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-10 bg-muted/50"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section - Empty to remove all icons */}
      <div className="flex items-center space-x-2">
        {/* Keep mobile search only */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
