"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./workspace/message-bubble";
import { ChatInput } from "./workspace/chat-input";
import { Button } from "@/components/ui/button";
import { Hash, Users, Settings, Pin, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChannelSearch } from "./ChannelSearch";
import { ReplyProvider } from "./ReplyProvider";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useSendMessage } from "@/features/messages/api/use-send-message";
import { useUserSession } from "./user-session-provider";
import { Id } from "../../convex/_generated/dataModel";
import { UploadedFile } from "@/lib/upload";
import { toast } from "sonner";

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
}

export function ModernChannelView({
  channelId,
  channelName,
  channelType = "text",
  className,
}: ChannelViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const { userName } = useUserSession();

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

  const handleSendMessage = async (content: string, richContent?: any, replyData?: {
    replyToId: Id<"messages">;
    replyToContent: string;
    replyToUserName: string;
  }) => {
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
    // Method 1: Using messagesEndRef (instant scroll)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }

    // Method 2: Fallback using ScrollArea ref
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Auto-scroll to bottom function (smooth - for new messages)
  const scrollToBottomSmooth = () => {
    // Method 1: Using messagesEndRef (smooth scroll)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Method 2: Fallback using ScrollArea ref
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
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

  const getChannelIcon = () => {
    switch (channelType) {
      case "voice":
        return <Users className="h-5 w-5 text-green-500" />;
      case "announcement":
        return <Pin className="h-5 w-5 text-blue-500" />;
      case "private":
        return <Users className="h-5 w-5 text-yellow-500" />;
      case "user":
        return <User className="h-5 w-5 text-blue-400" />;
      default:
        return <Hash className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // If channelId is not valid, show a placeholder
  if (!isValidChannelId) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="neomorphic-raised w-16 h-16 rounded-neomorphic flex items-center justify-center mx-auto mb-4">
              <Hash className="h-8 w-8 text-neomorphic-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-neomorphic-text mb-2">
              Select a Channel
            </h3>
            <p className="text-neomorphic-text-secondary max-w-md mx-auto">
              Choose a channel from the sidebar to start chatting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReplyProvider>
      <div className={`flex flex-col h-full ${className}`}>
        {/* Channel Header */}
        <div className="bg-neomorphic-bg border-b border-neomorphic-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getChannelIcon()}
              <div>
                <h2 className="text-lg font-semibold text-neomorphic-text">
                  #{channelName}
                </h2>
                <p className="text-sm text-neomorphic-text-secondary">
                  {channelType === "private" ? "Private channel" : "Public channel"}
                </p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Component */}
      <div className="relative">
        <ChannelSearch
          channelId={convexChannelId}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onMessageSelect={(messageId) => {
            // TODO: Scroll to specific message
            console.log("Selected message:", messageId);
          }}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-full px-6 py-4 custom-scrollbar"
        >
          <div className="space-y-2">
            {/* Channel Welcome Message */}
            <div className="text-center py-8 border-b border-neomorphic-border/50">
              <div className="neomorphic-raised w-16 h-16 rounded-neomorphic flex items-center justify-center mx-auto mb-4">
                {getChannelIcon()}
              </div>
              <h3 className="text-xl font-semibold text-neomorphic-text mb-2">
                Welcome to #{channelName}
              </h3>
              <p className="text-neomorphic-text-secondary max-w-md mx-auto">
                This is the beginning of the #{channelName} channel.
                {channelType === "private"
                  ? " Private discussions."
                  : " Start conversations with your team."}
              </p>
            </div>

            {/* Messages */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-neomorphic-text-secondary">
                  Loading messages...
                </div>
              </div>
            ) : (
              <>
                {transformedMessages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    currentUserId={userName || undefined}
                  />
                ))}
                {/* Extra spacing before scroll target to prevent overlap with chat input */}
                <div className="h-[160px]" />
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <ChatInput
          placeholder={`Message #${channelName}...`}
          onSendMessage={handleSendMessage}
          disabled={isSending}
        />
      </div>
    </div>
    </ReplyProvider>
  );
}
