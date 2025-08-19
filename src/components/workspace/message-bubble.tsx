"use client";

import { Check, Clock, File, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface RichContent {
  type?: "rich";
  delta?: any;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
}

interface Message {
  _id: Id<"messages">;
  channelId: Id<"channels">;
  content: string;
  userId: string;
  userName: string;
  createdAt: number;
  updatedAt?: number;
  isEdited?: boolean;
  richContent?: RichContent;
  userAvatar?: string;
  _creationTime: number;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMine = message.userId === currentUserId;
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderRichContent = () => {
    if (!message.richContent) return null;

    return (
      <div className="mt-2">
        {/* Render attachments */}
        {message.richContent.attachments &&
          message.richContent.attachments.length > 0 && (
            <div className="space-y-2">
              {message.richContent.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-white/5 dark:bg-black/5 rounded-lg border border-white/10 dark:border-black/10"
                >
                  <div className="flex-shrink-0">
                    {attachment.type.startsWith("image/") ? (
                      <Image className="h-4 w-4 text-blue-500" />
                    ) : attachment.type.startsWith("video/") ? (
                      <Video className="h-4 w-4 text-green-500" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    {attachment.size && (
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-400"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="group flex items-start space-x-3 py-2 px-4 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors duration-200 message-bubble">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
          {message.userName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="font-semibold text-foreground text-sm">
            {message.userName}
          </span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground opacity-70">
              (edited)
            </span>
          )}
        </div>

        {/* Message Body */}
        <div className="text-foreground text-sm leading-relaxed">
          <p className="mb-0 whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {renderRichContent()}
        </div>

        {/* Message Status */}
        {isMine && (
          <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground">
              <Check className="h-3 w-3 inline text-green-500" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
