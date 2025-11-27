"use client";

// Updated MessageBubble with Neumorphic Design

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
                if (typeof op.insert === "string") {
                  return (
                    <span key={index}>{renderTextWithMentions(op.insert)}</span>
                  );
                }
                return null;
              })}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing delta content:", e);
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
            <div className="flex flex-wrap gap-2">
              {message.richContent.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="group/attachment relative flex flex-col overflow-hidden rounded-lg border border-neomorphic-border/40 bg-neomorphic-surface/20 transition-colors hover:bg-neomorphic-surface/40 hover:border-electric-blue/30 max-w-[200px]"
                >
                  {/* Preview Section */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/5 dark:bg-white/5 max-h-[120px]">
                    {attachment.type.startsWith("image/") ? (
                      <div
                        className="h-full w-full cursor-pointer transition-transform duration-300 group-hover/attachment:scale-105"
                        onClick={() => window.open(attachment.url, "_blank")}
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                          }}
                        />
                      </div>
                    ) : attachment.type.startsWith("video/") ? (
                      <video
                        src={attachment.url}
                        controls
                        className="h-full w-full object-cover"
                        preload="metadata"
                      />
                    ) : attachment.type.startsWith("audio/") ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <Music className="h-8 w-8 text-purple-500 opacity-80" />
                        <audio
                          src={attachment.url}
                          controls
                          className="absolute bottom-1 left-1 right-1 w-[calc(100%-8px)] h-8"
                        />
                      </div>
                    ) : attachment.type === "application/pdf" ||
                      attachment.name.toLowerCase().endsWith(".pdf") ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/10">
                        <FileText className="h-8 w-8 text-red-500 opacity-80" />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <File className="h-8 w-8 text-blue-500 opacity-80" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover/attachment:opacity-100 pointer-events-none group-hover/attachment:pointer-events-auto">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={attachment.name}
                        className="rounded-full bg-white/10 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                        title="Download"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                      </a>
                      {attachment.type.startsWith("image/") && (
                        <button
                          onClick={() => window.open(attachment.url, "_blank")}
                          className="rounded-full bg-white/10 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                          title="View Fullscreen"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neomorphic-surface">
                      {attachment.type.startsWith("image/") ? (
                        <Image className="h-3.5 w-3.5 text-blue-500" />
                      ) : attachment.type.startsWith("video/") ? (
                        <Video className="h-3.5 w-3.5 text-green-500" />
                      ) : attachment.type.startsWith("audio/") ? (
                        <Music className="h-3.5 w-3.5 text-purple-500" />
                      ) : attachment.type === "application/pdf" ||
                        attachment.name.toLowerCase().endsWith(".pdf") ? (
                        <FileText className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <File className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-medium text-neomorphic-text"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </p>
                      {attachment.size && (
                        <p className="text-[10px] text-neomorphic-text-secondary">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="group flex items-start space-x-3 py-1.5 px-4 hover:bg-neomorphic-surface/20 rounded-lg transition-colors message-bubble relative animate-in fade-in slide-in-from-bottom-1 duration-200">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs",
            getUserColor(message.userName)
          )}
        >
          {getUserInitials(message.userName)}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 relative">
        {/* Message Actions - Positioned as overlay */}
        <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
          <div className="flex items-center gap-0.5 bg-neomorphic-surface/95 rounded-lg shadow-md border border-neomorphic-border/40 p-0.5">
            <button
              onClick={handleReply}
              className="p-1.5 hover:bg-electric-blue/10 rounded-md transition-colors text-neomorphic-text-secondary hover:text-electric-blue"
              title="Reply"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 hover:bg-neomorphic-surface-hover rounded-md transition-colors text-neomorphic-text-secondary hover:text-neomorphic-text"
              title="More actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {/* Reply Preview - shown if this message is a reply */}
        {message.replyToId &&
          message.replyToContent &&
          message.replyToUserName && (
            <div className="mb-2 p-2.5 border-l-4 border-electric-blue bg-neomorphic-surface/40 rounded-r-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-3 w-3 text-electric-blue" />
                <div
                  className={`w-4 h-4 rounded-full ${getUserColor(message.replyToUserName)} flex items-center justify-center shadow-sm`}
                >
                  <span className="text-[8px] font-bold text-white">
                    {getUserInitials(message.replyToUserName)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-neomorphic-text">
                  {message.replyToUserName}
                </span>
              </div>
              <p className="text-xs text-neomorphic-text-secondary truncate pl-5">
                {message.replyToContent.length > 60
                  ? message.replyToContent.substring(0, 60) + "..."
                  : message.replyToContent}
              </p>
            </div>
          )}

        {/* Bubble wrapper: gradient for own messages, surface for others */}
        <div
          className={cn(
            "py-1",
            isMine ? "text-neomorphic-text" : "text-neomorphic-text"
          )}
        >
          {/* Message Header */}
          <div className="flex items-baseline space-x-2 mb-0.5">
            <span
              className={cn(
                "font-semibold text-sm hover:underline cursor-pointer",
                isMine ? "text-electric-blue" : "text-neomorphic-text"
              )}
            >
              {message.userName}
            </span>
            <span className="text-xs text-neomorphic-text-secondary/60">
              {timestamp}
            </span>
            {message.isEdited && (
              <span className="text-xs italic text-neomorphic-text-secondary/50">
                (edited)
              </span>
            )}
          </div>

          {/* Message Body */}
          <div className="text-sm leading-relaxed text-neomorphic-text">
            {renderMessageContent()}
            {renderRichContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
