"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./workspace/message-bubble";
import { ChatInput } from "./workspace/chat-input";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Users,
  Settings,
  Pin,
  Search,
  User,
  MoreVertical,
  MessageSquare,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChannelSearch } from "./ChannelSearch";
import { ReplyProvider } from "./ReplyProvider";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useSendMessage } from "@/features/messages/api/use-send-message";
import { useUserSession } from "./user-session-provider";
import { Id } from "../../convex/_generated/dataModel";
import { UploadedFile } from "@/lib/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  _id: Id<"messages">;
  channelId: Id<"channels">;
  content: string;
  userId: string;
  userName: string;
  createdAt: number;
  updatedAt?: number;
  isEdited: boolean;
}

interface ChannelViewProps {
  channelId: string;
  channelName: string;
  channelType?: "text" | "voice" | "announcement" | "private" | "user";
  className?: string;
  highlightedMessageId?: string | null;
  onHighlightClear?: () => void;
}

export function ChannelView({
  channelId,
  channelName,
  channelType = "text",
  className,
  highlightedMessageId,
  onHighlightClear,
}: ChannelViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileChatExpanded, setIsMobileChatExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localHighlightedId, setLocalHighlightedId] = useState<string | null>(
    null
  );
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const { userName } = useUserSession();

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside to collapse mobile chat
  useEffect(() => {
    if (!isMobile || !isMobileChatExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatInputContainerRef.current &&
        !chatInputContainerRef.current.contains(event.target as Node)
      ) {
        setIsMobileChatExpanded(false);
      }
    };

    // Add slight delay to prevent immediate close on button click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isMobileChatExpanded]);

  // Validate channelId before making the query
  const isValidChannelId = channelId && channelId.trim() !== "";
  const convexChannelId = isValidChannelId
    ? (channelId as Id<"channels">)
    : null;

  // Backend integration - only fetch if we have a valid channel ID
  const { data: messages, isLoading } = useGetMessages({
    channelId: convexChannelId,
  });
  const { mutate: sendMessage, isPending: isSending } = useSendMessage({
    channelId: convexChannelId,
  });

  const handleSendMessage = async (
    content: string,
    richContent?: any,
    replyData?: {
      replyToId: Id<"messages">;
      replyToContent: string;
      replyToUserName: string;
    }
  ) => {
    if (!userName || !content.trim()) return;

    try {
      // Send the message with rich content and reply data
      await sendMessage({
        content: content.trim(),
        userName: userName,
        richContent: richContent,
        replyToId: replyData?.replyToId,
        replyToContent: replyData?.replyToContent,
        replyToUserName: replyData?.replyToUserName,
      });

      // Scroll to bottom after sending message (smooth)
      setTimeout(scrollToBottomSmooth, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  // Transform backend messages to the format expected by MessageBubble
  const transformedMessages = messages || [];

  // Auto-scroll to bottom function (instant - for opening channels)
  const scrollToBottomInstant = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  // Auto-scroll to bottom function (smooth - for new messages)
  const scrollToBottomSmooth = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Track channel changes and message count
  useEffect(() => {
    if (channelId !== currentChannelId) {
      setCurrentChannelId(channelId);
      setPreviousMessageCount(0);
    }
  }, [channelId, currentChannelId]);

  // Auto-scroll when opening a channel (instant)
  useEffect(() => {
    if (
      isValidChannelId &&
      !isLoading &&
      channelId === currentChannelId &&
      transformedMessages.length > 0
    ) {
      // Instant scroll when opening a channel
      setTimeout(scrollToBottomInstant, 50);
      setPreviousMessageCount(transformedMessages.length);
    }
  }, [
    channelId,
    currentChannelId,
    isValidChannelId,
    isLoading,
    transformedMessages.length,
  ]);

  // Auto-scroll when new messages arrive (smooth)
  useEffect(() => {
    if (
      transformedMessages.length > previousMessageCount &&
      previousMessageCount > 0
    ) {
      // Smooth scroll for new messages
      setTimeout(scrollToBottomSmooth, 50);
    }
    setPreviousMessageCount(transformedMessages.length);
  }, [transformedMessages.length, previousMessageCount]);

  // Handle highlighted message from search
  useEffect(() => {
    if (highlightedMessageId && !isLoading && transformedMessages.length > 0) {
      setLocalHighlightedId(highlightedMessageId);

      // Wait for messages to render, then scroll to the highlighted message
      setTimeout(() => {
        const messageElement = document.getElementById(
          `message-${highlightedMessageId}`
        );
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      // Clear highlight after 3 seconds
      const timeout = setTimeout(() => {
        setLocalHighlightedId(null);
        onHighlightClear?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [
    highlightedMessageId,
    isLoading,
    transformedMessages.length,
    onHighlightClear,
  ]);

  const getChannelIcon = () => {
    switch (channelType) {
      case "voice":
        return <Users className="h-4 w-4" />;
      case "announcement":
        return <Pin className="h-4 w-4" />;
      case "private":
        return <Users className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  // If channelId is not valid, show a placeholder
  if (!isValidChannelId) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-[#58a6ff] dark:to-[#79c0ff] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 dark:shadow-[#58a6ff]/20">
              <Hash className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent mb-3">
              Select a Channel
            </h3>
            <p className="text-slate-500 dark:text-[#8d96a0]">
              Choose a channel from the sidebar to start chatting or create a
              new one to collaborate with your team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReplyProvider>
      <div
        className={`flex flex-col h-full ${className}`}
        style={{ maxHeight: "100%" }}
      >
        {/* Channel Header - Fixed height, fixed on mobile */}
        <header
          className={cn(
            "h-14 min-h-[56px] flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-[#30363d] bg-white/70 dark:bg-[#0d1117]/95 backdrop-blur-xl z-20",
            isMobile && "sticky top-0"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="text-blue-600 dark:text-[#58a6ff] p-1.5 rounded-lg bg-blue-500/10 dark:bg-[#58a6ff]/10">
              {getChannelIcon()}
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 dark:text-[#e6edf3] text-base leading-tight">
                {channelType === "user" ? channelName : `#${channelName}`}
              </h2>
              <span className="text-[10px] font-medium text-slate-500 dark:text-[#8d96a0] uppercase tracking-wider">
                {channelType === "private"
                  ? "Private"
                  : channelType === "user"
                    ? "Direct Message"
                    : "Channel"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Channel Actions */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-8 w-8 rounded-lg text-slate-500 dark:text-[#8d96a0] hover:text-blue-600 dark:hover:text-[#58a6ff] hover:bg-slate-100 dark:hover:bg-[#21262d] transition-all"
              title="Search in channel"
            >
              <Search className="h-4 w-4 text-slate-500 dark:text-[#8d96a0] stroke-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-500 dark:text-[#8d96a0] hover:text-blue-600 dark:hover:text-[#58a6ff] hover:bg-slate-100 dark:hover:bg-[#21262d] transition-all"
              title="Channel Details"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Component */}
          <ChannelSearch
            channelId={convexChannelId}
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onMessageSelect={(messageId) => {
              // Set the local highlighted ID for channel search
              setLocalHighlightedId(messageId);
              setIsSearchOpen(false);

              // Scroll to the message
              setTimeout(() => {
                const messageElement = document.getElementById(
                  `message-${messageId}`
                );
                if (messageElement) {
                  messageElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }, 100);

              // Clear highlight after 3 seconds
              setTimeout(() => {
                setLocalHighlightedId(null);
              }, 3000);
            }}
          />
        </header>

        {/* Messages Area - Takes remaining space, scrollable */}
        <main
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 custom-scrollbar"
        >
          <div>
            {/* Channel Welcome Message */}
            <div className="text-center py-10 border-b border-slate-200/50 dark:border-[#30363d]/50 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-[#58a6ff]/10 dark:to-[#58a6ff]/5">
                <div className="text-blue-600 dark:text-[#58a6ff] transform scale-125">
                  {getChannelIcon()}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-[#e6edf3] mb-2">
                Welcome to #{channelName}
              </h3>
              <p className="text-slate-500 dark:text-[#8d96a0] max-w-lg mx-auto">
                This is the beginning of the{" "}
                <span className="font-semibold text-blue-600 dark:text-[#58a6ff]">
                  #{channelName}
                </span>{" "}
                channel.
                {channelType === "private"
                  ? " Private discussions."
                  : " Start conversations with your team."}
              </p>
            </div>

            {/* Messages */}
            {isLoading ? (
              <div className="space-y-8 py-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-2 animate-pulse opacity-60"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-[#21262d] shrink-0" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-[#21262d] rounded-md" />
                        <div className="h-3 w-12 bg-slate-100 dark:bg-[#30363d] rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-slate-100 dark:bg-[#30363d] rounded-md" />
                        <div className="h-4 w-1/2 bg-slate-100 dark:bg-[#30363d] rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {transformedMessages.map((message, index) => {
                  // Check if this message should be grouped with the previous one
                  const prevMessage =
                    index > 0 ? transformedMessages[index - 1] : null;
                  const isGrouped = prevMessage
                    ? prevMessage.userName === message.userName &&
                      // Don't group if this message is a reply
                      !(message as any).replyToId
                    : false;
                  const isHighlighted = localHighlightedId === message._id;

                  return (
                    <div
                      key={message._id}
                      id={`message-${message._id}`}
                      className={cn(
                        "transition-all duration-500 rounded-lg",
                        isHighlighted &&
                          "bg-electric-blue/20 ring-2 ring-electric-blue/50 animate-pulse"
                      )}
                    >
                      <MessageBubble
                        message={message}
                        currentUserId={userName || undefined}
                        isGrouped={isGrouped}
                      />
                    </div>
                  );
                })}
                {/* Extra spacing before scroll target */}
                <div className="h-4" />
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </main>

        {/* Message Input - Fixed at bottom, never overlaps */}
        {/* Mobile: Show button to expand, Desktop: Always show full input */}
        <footer className="flex-shrink-0 border-t border-slate-200/50 dark:border-[#30363d] bg-white/70 dark:bg-[#0d1117]/95">
          {/* Mobile collapsed state - just a button */}
          {isMobile && !isMobileChatExpanded && (
            <div className="px-4 py-3">
              <button
                onClick={() => setIsMobileChatExpanded(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] rounded-xl text-slate-500 dark:text-[#8d96a0] transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Tap to type a message...
                </span>
              </button>
            </div>
          )}

          {/* Mobile expanded state - full chat input with close button */}
          {isMobile && isMobileChatExpanded && (
            <div
              ref={chatInputContainerRef}
              className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-[#0d1117] border-t border-slate-200/50 dark:border-[#30363d] shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/50 dark:border-[#30363d]">
                <span className="text-sm font-medium text-slate-600 dark:text-[#8d96a0]">
                  Message #{channelName}
                </span>
                <button
                  onClick={() => setIsMobileChatExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-500 dark:text-[#8d96a0]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-2 max-h-[50vh] overflow-y-auto">
                <ChatInput
                  placeholder={`Message ${channelName.length > 15 ? channelName.substring(0, 15) + "..." : "#" + channelName}`}
                  onSendMessage={(content, richContent, replyData) => {
                    handleSendMessage(content, richContent, replyData);
                    setIsMobileChatExpanded(false);
                  }}
                  disabled={isSending}
                />
              </div>
            </div>
          )}

          {/* Desktop: Always show full input */}
          {!isMobile && (
            <div className="px-4 py-2">
              <ChatInput
                placeholder={`Message ${channelName.length > 15 ? channelName.substring(0, 15) + "..." : "#" + channelName}`}
                onSendMessage={handleSendMessage}
                disabled={isSending}
              />
            </div>
          )}
        </footer>
      </div>
    </ReplyProvider>
  );
}
