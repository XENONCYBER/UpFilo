"use client";

import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleMessage {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isMine: boolean;
}

interface MessageBubbleProps {
  message: MessageBubbleMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="group flex items-start space-x-3 py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors duration-200 message-bubble">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          {message.sender.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="font-semibold text-foreground text-sm">
            {message.sender}
          </span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {message.timestamp}
          </span>
        </div>

        {/* Message Body */}
        <div className="text-foreground text-sm leading-relaxed">
          <p className="mb-0">{message.content}</p>
        </div>

        {/* Message Status */}
        {message.isMine && (
          <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground">
              {message.status === "read" ? (
                <Check className="h-3 w-3 inline text-green-500" />
              ) : (
                <Clock className="h-3 w-3 inline" />
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
