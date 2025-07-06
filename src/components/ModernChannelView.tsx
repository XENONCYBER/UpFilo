"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./workspace/message-bubble";
import { ChatInput } from "./workspace/chat-input";
import { Button } from "@/components/ui/button";
import { Hash, Users, Settings, Pin, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useSendMessage } from "@/features/messages/api/use-send-message";
import { useUserSession } from "./user-session-provider";
import { Id } from "../../convex/_generated/dataModel";

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
  const { userName } = useUserSession();

  // Convert channelId string to proper Convex ID
  const convexChannelId = channelId as Id<"channels">;

  // Backend integration
  const { data: messages, isLoading } = useGetMessages({
    channelId: convexChannelId,
  });
  const { mutate: sendMessage, isPending: isSending } = useSendMessage({
    channelId: convexChannelId,
  });

  const handleSendMessage = async (content: string) => {
    if (!userName || !content.trim()) return;

    try {
      // Send the message with plain text content
      await sendMessage({
        content: content.trim(),
        userName: userName,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Transform backend messages to the format expected by MessageBubble
  const transformedMessages =
    messages?.map((message) => ({
      id: parseInt(message._id.slice(-8), 16), // Create a numeric ID from the Convex ID
      sender: message.userName,
      content: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "read" as const,
      isMine: message.userName === userName,
    })) || [];

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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Channel Header - Thin Strip */}
      <div className="glass-surface flex items-center justify-between px-4 py-2 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl shadow-glass">
        <div className="flex items-center space-x-2">
          {getChannelIcon()}
          <h2 className="font-medium text-foreground text-base">
            {channelName}
          </h2>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search in channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-8 w-48 h-7 text-sm"
          />
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-2 custom-scrollbar">
        <div className="space-y-3">
          {/* Channel Welcome Message - Compact */}
          <div className="text-center py-4 border-b border-border/50">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
              {getChannelIcon()}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Welcome to #{channelName}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              This is the beginning of the #{channelName} channel.
              {channelType === "private"
                ? " Private discussions."
                : " Start conversations with your team."}
            </p>
          </div>

          {/* Messages */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            transformedMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input - Completely Flush */}
      <div className="flex-shrink-0 px-2">
        <div className="-mb-1">
          <ChatInput
            placeholder={`Message #${channelName}...`}
            onSendMessage={handleSendMessage}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  );
}
