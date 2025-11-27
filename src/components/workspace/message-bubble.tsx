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
      <div className="mt-3">
        {/* Render attachments */}
        {message.richContent.attachments &&
          message.richContent.attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.richContent.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="group/attachment relative flex flex-col overflow-hidden rounded-xl border border-neomorphic-border/50 bg-neomorphic-surface/30 backdrop-blur-sm transition-all duration-300 hover:bg-neomorphic-surface/50 hover:shadow-lg hover:border-electric-blue/30"
                >
                  {/* Preview Section */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/5 dark:bg-white/5">
                    {attachment.type.startsWith("image/") ? (
                      <div
                        className="h-full w-full cursor-pointer transition-transform duration-500 group-hover/attachment:scale-105"
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
                        <Music className="h-12 w-12 text-purple-500 opacity-80" />
                        <audio
                          src={attachment.url}
                          controls
                          className="absolute bottom-2 left-2 right-2 w-[calc(100%-16px)]"
                        />
                      </div>
                    ) : attachment.type === "application/pdf" ||
                      attachment.name.toLowerCase().endsWith(".pdf") ? (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/10">
                        <FileText className="h-12 w-12 text-red-500 opacity-80" />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <File className="h-12 w-12 text-blue-500 opacity-80" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/attachment:opacity-100 pointer-events-none group-hover/attachment:pointer-events-auto">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={attachment.name}
                        className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:scale-110"
                        title="Download"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
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
                          className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 hover:scale-110"
                          title="View Fullscreen"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
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
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neomorphic-surface shadow-inner">
                      {attachment.type.startsWith("image/") ? (
                        <Image className="h-5 w-5 text-blue-500" />
                      ) : attachment.type.startsWith("video/") ? (
                        <Video className="h-5 w-5 text-green-500" />
                      ) : attachment.type.startsWith("audio/") ? (
                        <Music className="h-5 w-5 text-purple-500" />
                      ) : attachment.type === "application/pdf" ||
                        attachment.name.toLowerCase().endsWith(".pdf") ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-neomorphic-text"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </p>
                      {attachment.size && (
                        <p className="text-xs text-neomorphic-text-secondary">
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
    <div className="group flex items-start space-x-4 py-4 px-6 hover:bg-neomorphic-surface/30 rounded-2xl transition-all duration-300 message-bubble relative border border-transparent hover:border-neomorphic-border/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md transform transition-transform duration-300 group-hover:scale-105",
            getUserColor(message.userName)
          )}
        >
          {getUserInitials(message.userName)}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 relative">
        {/* Message Actions - Positioned as overlay */}
        <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out z-10">
          <div className="flex items-center gap-1 bg-neomorphic-surface/90 backdrop-blur-md rounded-xl shadow-lg border border-neomorphic-border/50 p-1.5">
            <button
              onClick={handleReply}
              className="p-2 hover:bg-electric-blue/10 rounded-lg transition-all duration-200 text-neomorphic-text-secondary hover:text-electric-blue"
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-neomorphic-surface-hover rounded-lg transition-all duration-200 text-neomorphic-text-secondary hover:text-neomorphic-text"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
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

        {/* Message Header */}
        <div className="flex items-baseline space-x-2 mb-1.5">
          <span className="font-bold text-neomorphic-text text-sm hover:underline cursor-pointer">
            {message.userName}
          </span>
          <span className="text-xs text-neomorphic-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {timestamp}
          </span>
          {message.isEdited && (
            <span className="text-xs text-neomorphic-text-secondary italic opacity-70">
              (edited)
            </span>
          )}
        </div>

        {/* Message Body */}
        <div className="text-neomorphic-text text-[15px] leading-relaxed tracking-wide">
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
