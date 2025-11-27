"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, MessageSquare, File, Users, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useSearchWorkspaceMessages,
  useSearchWorkspaceFiles,
} from "@/features/messages/api/use-search-messages";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";
import { getUserColor, getUserInitials } from "@/lib/user-colors";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSelect?: (messageId: string, channelId: string) => void;
  onFileSelect?: (fileUrl: string) => void;
  className?: string;
}

export function SearchModal({
  isOpen,
  onClose,
  onMessageSelect,
  onFileSelect,
  className,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "files">("messages");
  const workspaceId = useConvexWorkspaceId();

  // Search hooks
  const { data: messages, isLoading: messagesLoading } =
    useSearchWorkspaceMessages({
      workspaceId,
      searchQuery,
      limit: 50,
    });

  const { data: files, isLoading: filesLoading } = useSearchWorkspaceFiles({
    workspaceId,
    searchQuery,
    fileType: "all",
    limit: 50,
  });

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

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
      `(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-electric-blue/30 text-electric-blue font-medium rounded px-1"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return (
        <div className="w-8 h-8 bg-green-500 dark:bg-[#3fb950] rounded flex items-center justify-center text-white text-xs font-bold">
          IMG
        </div>
      );
    } else if (type.startsWith("video/")) {
      return (
        <div className="w-8 h-8 bg-purple-500 dark:bg-[#a371f7] rounded flex items-center justify-center text-white text-xs font-bold">
          VID
        </div>
      );
    } else if (type.startsWith("audio/")) {
      return (
        <div className="w-8 h-8 bg-pink-500 dark:bg-[#db61a2] rounded flex items-center justify-center text-white text-xs font-bold">
          AUD
        </div>
      );
    } else {
      return <File className="w-8 h-8 text-blue-500 dark:text-[#58a6ff]" />;
    }
  };

  if (!isOpen) return null;

  console.log("SearchModal rendering, isOpen:", isOpen);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-2xl mx-4 bg-neomorphic-bg/95 backdrop-blur-xl border border-neomorphic-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-neomorphic-border/50">
          <div className="flex items-center gap-3 bg-neomorphic-surface/50 rounded-xl px-3 py-2 border border-neomorphic-border/30 focus-within:border-electric-blue/50 focus-within:ring-2 focus-within:ring-electric-blue/10 transition-all duration-300">
            <Search className="h-5 w-5 text-slate-500 dark:text-[#8d96a0] stroke-current" />
            <Input
              placeholder="Search messages and files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-neomorphic-text placeholder:text-neomorphic-text-secondary focus:ring-0 focus:border-none h-auto p-0 text-base"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-neomorphic-surface rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-neomorphic-text" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neomorphic-border/50 px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab("messages")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-b-2 rounded-t-lg",
              activeTab === "messages"
                ? "text-electric-blue border-electric-blue bg-electric-blue/5"
                : "text-neomorphic-text-secondary border-transparent hover:text-neomorphic-text hover:bg-neomorphic-surface/50"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-b-2 rounded-t-lg",
              activeTab === "files"
                ? "text-electric-blue border-electric-blue bg-electric-blue/5"
                : "text-neomorphic-text-secondary border-transparent hover:text-neomorphic-text hover:bg-neomorphic-surface/50"
            )}
          >
            <File className="h-4 w-4" />
            Files ({files.length})
          </button>
        </div>

        {/* Content */}
        <div className="h-96">
          <ScrollArea className="h-full">
            {activeTab === "messages" ? (
              <div className="p-2">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-neomorphic-text-secondary">
                      Searching messages...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-neomorphic-text stroke-current mb-3" />
                    <p className="text-neomorphic-text-secondary">
                      {searchQuery.trim()
                        ? "No messages found"
                        : "Start typing to search messages"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message: any) => (
                      <div
                        key={message._id}
                        onClick={() =>
                          onMessageSelect?.(message._id, message.channelId)
                        }
                        className="p-3 hover:bg-neomorphic-surface rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: getUserColor(message.userName),
                            }}
                          >
                            <span className="text-xs font-bold text-white">
                              {getUserInitials(message.userName)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-neomorphic-text">
                                {message.userName}
                              </span>
                              <div className="flex items-center gap-1 text-neomorphic-text-secondary text-xs">
                                {message.channelType === "user" ? (
                                  <Users className="h-3 w-3" />
                                ) : (
                                  <Hash className="h-3 w-3" />
                                )}
                                <span>#{message.channelName}</span>
                              </div>
                              <span className="text-neomorphic-text-secondary text-xs">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-neomorphic-text text-sm leading-relaxed">
                              {highlightText(message.content, searchQuery)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-neomorphic-text-secondary">
                      Searching files...
                    </div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <File className="h-12 w-12 text-neomorphic-text stroke-current mb-3" />
                    <p className="text-neomorphic-text-secondary">
                      {searchQuery.trim()
                        ? "No files found"
                        : "Start typing to search files"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {files.map((file: any) => (
                      <div
                        key={file.id}
                        onClick={() => onFileSelect?.(file.url)}
                        className="p-3 hover:bg-neomorphic-surface rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neomorphic-text truncate">
                              {highlightText(file.name, searchQuery)}
                            </p>
                            <div className="flex items-center gap-2 text-neomorphic-text-secondary text-xs mt-1">
                              <span>by {file.uploadedBy}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {file.channelType === "user" ? (
                                  <Users className="h-3 w-3" />
                                ) : (
                                  <Hash className="h-3 w-3" />
                                )}
                                <span>#{file.channelName}</span>
                              </div>
                              <span>•</span>
                              <span>{formatDate(file.uploadedAt)}</span>
                              {file.size && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
