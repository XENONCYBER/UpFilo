"use client";

import {
  Check,
  Clock,
  File,
  Image,
  Video,
  Music,
  FileText,
  Reply,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserColor, getUserInitials } from "@/lib/user-colors";
import { Id } from "../../../convex/_generated/dataModel";
import { PDFViewer } from "@/components/PDFViewer";
import { Mention, useMentionParser } from "./mentions";
import { useReply } from "../ReplyProvider";
import { useState } from "react";

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
  // Reply fields
  replyToId?: Id<"messages">;
  replyToContent?: string;
  replyToUserName?: string;
}

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isMine = message.userId === currentUserId;
  const { renderTextWithMentions } = useMentionParser();
  const { setReplyingTo } = useReply();
  const [showActions, setShowActions] = useState(false);
  
  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleReply = () => {
    setReplyingTo({
      _id: message._id,
      content: message.content,
      userName: message.userName,
      createdAt: message.createdAt,
    });
    setShowActions(false);
  };

  const renderMessageContent = () => {
    // If there's rich content with Delta, try to parse it for mentions
    if (message.richContent?.delta) {
      try {
        const delta = message.richContent.delta;
        if (delta.ops) {
          return (
            <div className="mb-0 whitespace-pre-wrap break-words">
              {delta.ops.map((op: any, index: number) => {
                if (typeof op.insert === 'string') {
                  return (
                    <span key={index}>
                      {renderTextWithMentions(op.insert)}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          );
        }
      } catch (e) {
        console.error('Error parsing delta content:', e);
      }
    }
    
    // Fallback to regular content parsing
    return (
      <div className="mb-0 whitespace-pre-wrap break-words">
        {renderTextWithMentions(message.content)}
      </div>
    );
  };

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
                  className="flex items-center space-x-3 p-3 bg-white/5 dark:bg-black/5 rounded-lg border border-white/10 dark:border-black/10 hover:bg-white/10 dark:hover:bg-black/15 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {attachment.type.startsWith("image/") ? (
                      <div className="relative">
                        <Image className="h-5 w-5 text-blue-500" />
                        {/* Preview for images */}
                        <div className="mt-2">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-xs max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              window.open(attachment.url, "_blank")
                            }
                            onError={(e) => {
                              console.error(
                                "Image load error:",
                                attachment.url
                              );
                              // Hide the image if it fails to load
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                            }}
                            onLoad={() => {
                              console.log(
                                "Image loaded successfully:",
                                attachment.url
                              );
                            }}
                          />
                        </div>
                      </div>
                    ) : attachment.type.startsWith("video/") ? (
                      <div className="relative">
                        <Video className="h-5 w-5 text-green-500" />
                        {/* Preview for videos */}
                        <div className="mt-2">
                          <video
                            src={attachment.url}
                            controls
                            className="max-w-xs max-h-48 rounded-lg"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    ) : attachment.type.startsWith("audio/") ? (
                      <div className="relative">
                        <Music className="h-5 w-5 text-purple-500" />
                        {/* Audio player */}
                        <div className="mt-2">
                          <audio
                            src={attachment.url}
                            controls
                            className="max-w-xs"
                            preload="metadata"
                          >
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                      </div>
                    ) : attachment.type === "application/pdf" ||
                      attachment.name.toLowerCase().endsWith(".pdf") ? (
                      <div className="mt-2 w-full max-w-lg">
                        <PDFViewer
                          url={attachment.url}
                          fileName={attachment.name}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                  </div>

                  {/* File info and download */}
                  {!attachment.type.startsWith("image/") &&
                    !attachment.type.startsWith("video/") &&
                    !attachment.type.startsWith("audio/") &&
                    attachment.type !== "application/pdf" &&
                    !attachment.name.toLowerCase().endsWith(".pdf") && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {attachment.name}
                        </p>
                        {attachment.size && (
                          <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    )}

                  {/* Download button */}
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.name}
                    className="flex-shrink-0 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
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
    <div className="group flex items-start space-x-3 py-3 px-4 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all duration-200 message-bubble relative">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm", getUserColor(message.userName))}>
          {getUserInitials(message.userName)}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 relative">
        {/* Message Actions - Positioned as overlay */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out z-10">
          <div className="flex items-center gap-2 bg-neomorphic-surface backdrop-blur-sm rounded-xl shadow-neomorphic-inset p-2">
            <button
              onClick={handleReply}
              className="p-2 bg-neomorphic-surface hover:bg-neomorphic-surface-hover rounded-lg shadow-neomorphic hover:shadow-neomorphic-pressed transition-all duration-200 text-neomorphic-text-secondary hover:text-electric-blue active:shadow-neomorphic-inset transform hover:-translate-y-0.5 active:translate-y-0"
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 bg-neomorphic-surface hover:bg-neomorphic-surface-hover rounded-lg shadow-neomorphic hover:shadow-neomorphic-pressed transition-all duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text active:shadow-neomorphic-inset transform hover:-translate-y-0.5 active:translate-y-0"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Reply Preview - shown if this message is a reply */}
        {message.replyToId && message.replyToContent && message.replyToUserName && (
          <div className="mb-2 p-2 border-l-4 border-electric-blue bg-neomorphic-surface/30 rounded-r-lg">
            <div className="flex items-center gap-2 mb-1">
              <Reply className="h-3 w-3 text-electric-blue" />
              <div className={`w-4 h-4 rounded-full ${getUserColor(message.replyToUserName)} flex items-center justify-center`}>
                <span className="text-[8px] font-bold text-white">
                  {getUserInitials(message.replyToUserName)}
                </span>
              </div>
              <span className="text-xs font-medium text-neomorphic-text">
                {message.replyToUserName}
              </span>
            </div>
            <p className="text-xs text-neomorphic-text-secondary truncate">
              {message.replyToContent.length > 60 
                ? message.replyToContent.substring(0, 60) + "..."
                : message.replyToContent
              }
            </p>
          </div>
        )}

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
          {renderMessageContent()}
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
