"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchMessages } from "@/features/messages/api/use-search-messages";
import { Id } from "../../convex/_generated/dataModel";
import { MessageBubble } from "./workspace/message-bubble";

interface ChannelSearchProps {
  channelId: Id<"channels"> | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageSelect?: (messageId: string) => void;
  className?: string;
}

export function ChannelSearch({
  channelId,
  isOpen,
  onClose,
  onMessageSelect,
  className,
}: ChannelSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Search messages in current channel
  const { data: messages, isLoading } = useSearchMessages({
    channelId,
    searchQuery,
    limit: 50,
  });

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 bg-neomorphic-bg border-b border-neomorphic-border shadow-lg z-20 transition-all duration-200",
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none",
        className
      )}
    >
      {/* Search Header */}
      <div className="p-3 border-b border-neomorphic-border">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-neomorphic-text-secondary flex-shrink-0" />
          <Input
            placeholder="Search in this channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-neomorphic-text placeholder:text-neomorphic-text-secondary focus:ring-0 focus:border-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-neomorphic-surface rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-neomorphic-text-secondary" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="h-80 border-b border-neomorphic-border">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-neomorphic-text-secondary">
                    Searching...
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-neomorphic-text-secondary mx-auto mb-3" />
                  <p className="text-neomorphic-text-secondary">
                    No messages found
                  </p>
                  <p className="text-neomorphic-text-secondary text-sm mt-1">
                    Try different keywords or check spelling
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-neomorphic-text-secondary mb-3">
                    Found {messages.length} message
                    {messages.length !== 1 ? "s" : ""}
                  </div>
                  {messages.map((message: any) => (
                    <div
                      key={message._id}
                      onClick={() => {
                        onMessageSelect?.(message._id);
                        onClose();
                      }}
                      className="cursor-pointer hover:bg-neomorphic-surface/50 rounded-lg p-2 transition-colors"
                    >
                      <MessageBubble
                        message={message}
                        currentUserId={message.userName}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
