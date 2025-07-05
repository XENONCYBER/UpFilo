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
    <div
      className={cn(
        "flex animate-fadeIn",
        message.isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-2xl p-4 relative",
          message.isMine
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {!message.isMine && (
          <p className="text-xs font-medium text-primary mb-1">
            {message.sender}
          </p>
        )}
        <p
          className={
            message.isMine ? "text-primary-foreground" : "text-foreground"
          }
        >
          {message.content}
        </p>
        <div
          className={cn(
            "flex items-center space-x-2 mt-2 text-xs",
            message.isMine
              ? "text-primary-foreground/70 justify-end"
              : "text-muted-foreground"
          )}
        >
          <span>{message.timestamp}</span>
          {message.isMine && (
            <div className="flex items-center">
              {message.status === "read" ? (
                <Check className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
