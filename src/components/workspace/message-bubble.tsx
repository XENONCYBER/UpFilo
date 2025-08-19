"use client";

import {
  Check,
  Clock,
  File,
  Image,
  Video,
  Music,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import { PDFViewer } from "@/components/PDFViewer";

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
