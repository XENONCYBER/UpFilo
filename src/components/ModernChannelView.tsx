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
      {/* Channel Header */}
      <div className="glass-surface flex items-center justify-between p-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl shadow-glass">
        <div className="flex items-center space-x-3">
          {getChannelIcon()}
          <div>
            <h2 className="font-semibold text-foreground text-lg">
              {channelName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {channelType === "private"
                ? "Private channel"
                : channelType === "user"
                  ? "Direct message"
                  : "Public channel"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-64"
            />
          </div>

          {/* Channel Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {/* Channel Welcome Message */}
          <div className="text-center py-8 border-b border-border/50">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {getChannelIcon()}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to #{channelName}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is the beginning of the #{channelName} channel.
              {channelType === "private"
                ? " This is a private channel for team discussions."
                : " Start conversations and share ideas with your team."}
            </p>
          </div>

          {/* Messages */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            transformedMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        placeholder={`Message #${channelName}...`}
      />
    </div>
  );
}
