"use client";

import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleMessage {
  id: number;
  sender: string;
  content: string;
  richContent?: any; // Rich text content from Quill
  timestamp: string;
  status: "sent" | "delivered" | "read";
  isMine: boolean;
}

interface MessageBubbleProps {
  message: MessageBubbleMessage;
}

// Helper function to safely render HTML content
function RichContentRenderer({ richContent }: { richContent: any }) {
  try {
    // If richContent has HTML property (from QuillChatInput)
    if (richContent && richContent.html) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: richContent.html }}
          className="rich-content prose prose-sm max-w-none dark:prose-invert"
        />
      );
    }

    // If richContent is a Quill delta object
    if (richContent && typeof richContent === "object" && richContent.ops) {
      // Extract plain text from Quill delta operations as fallback
      const plainText = richContent.ops
        .map((op: any) => (typeof op.insert === "string" ? op.insert : ""))
        .join("");
      return <span>{plainText}</span>;
    }

    // If richContent is HTML string directly
    if (typeof richContent === "string") {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: richContent }}
          className="rich-content prose prose-sm max-w-none dark:prose-invert"
        />
      );
    }

    return null;
  } catch (error) {
    console.warn("Error rendering rich content:", error);
    return null;
  }
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
        <div
          className={
            message.isMine ? "text-primary-foreground" : "text-foreground"
          }
        >
          {message.richContent ? (
            <RichContentRenderer richContent={message.richContent} />
          ) : (
            <p>{message.content}</p>
          )}
        </div>
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
