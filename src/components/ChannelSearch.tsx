"use client";

import { useState, useEffect } from "react";
import { Search, X, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchMessages } from "@/features/messages/api/use-search-messages";
import { Id } from "../../convex/_generated/dataModel";
import { getUserColor, getUserInitials } from "@/lib/user-colors";

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-300/50 dark:bg-yellow-500/30 text-inherit font-semibold rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 mt-1 mx-4 bg-white dark:bg-[#161b22] border border-slate-200/80 dark:border-[#30363d] rounded-2xl shadow-2xl z-30 overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2 fade-in",
        className
      )}
    >
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-[#30363d]">
        <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-[#21262d] rounded-xl px-4 py-3 border border-slate-200/50 dark:border-[#30363d] focus-within:border-blue-400 dark:focus-within:border-[#58a6ff] focus-within:ring-2 focus-within:ring-blue-500/10 dark:focus-within:ring-[#58a6ff]/10 transition-all">
          <Search className="h-5 w-5 text-slate-400 dark:text-[#8d96a0] flex-shrink-0" />
          <input
            placeholder="Search messages in this channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-slate-800 dark:text-[#e6edf3] placeholder:text-slate-400 dark:placeholder:text-[#8d96a0] focus:outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-slate-200 dark:hover:bg-[#30363d] rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-400 dark:text-[#8d96a0]" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#30363d] rounded-lg transition-colors ml-1"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-[#8d96a0]" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-h-[400px] overflow-hidden">
        <ScrollArea className="h-full max-h-[400px]">
          <div className="p-3">
            {!searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-[#58a6ff]/10 dark:to-[#58a6ff]/5 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-blue-500 dark:text-[#58a6ff]" />
                </div>
                <p className="text-slate-600 dark:text-[#8d96a0] font-medium">
                  Search this channel
                </p>
                <p className="text-slate-400 dark:text-[#6e7681] text-sm mt-1">
                  Find messages by typing keywords above
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-3 py-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#21262d]" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-[#21262d] rounded" />
                        <div className="h-3 w-12 bg-slate-100 dark:bg-[#30363d] rounded" />
                      </div>
                      <div className="h-4 w-3/4 bg-slate-100 dark:bg-[#30363d] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#21262d] flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-slate-400 dark:text-[#6e7681]" />
                </div>
                <p className="text-slate-600 dark:text-[#8d96a0] font-medium">
                  No messages found
                </p>
                <p className="text-slate-400 dark:text-[#6e7681] text-sm mt-1">
                  Try different keywords or check spelling
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Results count */}
                <div className="flex items-center gap-2 px-2 py-2 text-xs text-slate-500 dark:text-[#8d96a0]">
                  <span className="font-medium">
                    {messages.length} result{messages.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-300 dark:text-[#30363d]">•</span>
                  <span>Click to jump to message</span>
                </div>

                {/* Message results */}
                {messages.map((message: any) => (
                  <button
                    key={message._id}
                    onClick={() => {
                      onMessageSelect?.(message._id);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-100/80 dark:hover:bg-[#21262d] rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-200/50 dark:hover:border-[#30363d]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{
                          backgroundColor: getUserColor(message.userName),
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {getUserInitials(message.userName)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 dark:text-[#e6edf3] text-sm">
                            {message.userName}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400 dark:text-[#6e7681] text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-[#8d96a0] text-sm leading-relaxed line-clamp-2">
                          {highlightText(
                            stripHtml(message.content).substring(0, 150) +
                              (stripHtml(message.content).length > 150
                                ? "..."
                                : ""),
                            searchQuery
                          )}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-blue-500 dark:text-[#58a6ff]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer hint */}
      {searchQuery.trim() && messages.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200/50 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#0d1117]/50">
          <p className="text-xs text-slate-400 dark:text-[#6e7681] text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-[#21262d] rounded text-slate-600 dark:text-[#8d96a0] font-mono">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      )}
    </div>
  );
}
