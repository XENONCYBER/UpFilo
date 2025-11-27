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
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserColor, getUserInitials } from "@/lib/user-colors";
import { Id } from "../../../convex/_generated/dataModel";
import { PDFViewer } from "@/components/PDFViewer";
import { Mention, useMentionParser } from "./mentions";
import { useReply } from "../ReplyProvider";
import { useState, useRef, useEffect } from "react";
import { useEditMessage } from "@/features/messages/api/use-edit-message";
import { useDeleteMessage } from "@/features/messages/api/use-delete-message";
import { toast } from "sonner";

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
  isGrouped?: boolean; // True if this is a continuation message from the same user
}

export function MessageBubble({
  message,
  currentUserId,
  isGrouped = false,
}: MessageBubbleProps) {
  const isMine = message.userName === currentUserId;
  const { renderTextWithMentions } = useMentionParser();
  const { setReplyingTo } = useReply();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: editMessage, isPending: isEditPending } = useEditMessage();
  const { mutate: deleteMessage, isPending: isDeletePending } =
    useDeleteMessage();

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(
        editContent.length,
        editContent.length
      );
    }
  }, [isEditing]);

  const handleReply = () => {
    setReplyingTo({
      _id: message._id,
      content: message.content,
      userName: message.userName,
      createdAt: message.createdAt,
    });
    setShowActions(false);
  };

  const handleStartEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await editMessage({
        messageId: message._id,
        content: editContent.trim(),
        userName: currentUserId || "",
      });
      setIsEditing(false);
      toast.success("Message edited");
    } catch (error) {
      toast.error("Failed to edit message");
      console.error("Edit error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage({
        messageId: message._id,
        userName: currentUserId || "",
      });
      setShowDeleteConfirm(false);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
      console.error("Delete error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Process delta ops into structured blocks (code blocks, lists, paragraphs)
  const processDeltaOps = (ops: any[]) => {
    const result: any[] = [];
    let i = 0;

    while (i < ops.length) {
      const op = ops[i];
      const nextOp = ops[i + 1];

      // Check if this text is followed by a special newline (code-block or list)
      if (
        typeof op.insert === "string" &&
        nextOp &&
        typeof nextOp.insert === "string" &&
        nextOp.insert === "\n" &&
        nextOp.attributes
      ) {
        const nextAttrs = nextOp.attributes;

        // Handle code blocks
        if (nextAttrs["code-block"]) {
          const codeLines: string[] = [op.insert];
          i += 2;

          // Collect consecutive code block lines
          while (i < ops.length) {
            const currentOp = ops[i];
            const followingOp = ops[i + 1];

            if (
              typeof currentOp.insert === "string" &&
              followingOp &&
              typeof followingOp.insert === "string" &&
              followingOp.insert === "\n" &&
              followingOp.attributes?.["code-block"]
            ) {
              codeLines.push(currentOp.insert);
              i += 2;
            } else {
              break;
            }
          }

          result.push({
            type: "code-block",
            content: codeLines.join("\n"),
          });
          continue;
        }

        // Handle lists (ordered or unordered)
        if (nextAttrs.list) {
          const listType = nextAttrs.list; // "ordered" or "bullet"
          const listItems: { content: string; attrs: any }[] = [
            { content: op.insert, attrs: op.attributes || {} },
          ];
          i += 2;

          // Collect consecutive list items of the same type
          while (i < ops.length) {
            const currentOp = ops[i];
            const followingOp = ops[i + 1];

            if (
              typeof currentOp.insert === "string" &&
              followingOp &&
              typeof followingOp.insert === "string" &&
              followingOp.insert === "\n" &&
              followingOp.attributes?.list === listType
            ) {
              listItems.push({
                content: currentOp.insert,
                attrs: currentOp.attributes || {},
              });
              i += 2;
            } else {
              break;
            }
          }

          result.push({
            type: "list",
            listType: listType,
            items: listItems,
          });
          continue;
        }
      }

      // Regular op - pass through with formatting info
      result.push({ type: "regular", op });
      i++;
    }

    return result;
  };

  // Helper to apply inline formatting to text
  const applyInlineFormatting = (
    text: string,
    attrs: any,
    key: string
  ): React.ReactNode => {
    let element: React.ReactNode = renderTextWithMentions(text);

    if (attrs.bold) {
      element = <strong>{element}</strong>;
    }
    if (attrs.italic) {
      element = <em>{element}</em>;
    }
    if (attrs.underline) {
      element = <u>{element}</u>;
    }
    if (attrs.strike) {
      element = <s>{element}</s>;
    }
    if (attrs.code) {
      element = (
        <code className="bg-neomorphic-surface/60 dark:bg-[#21262d] px-1.5 py-0.5 rounded text-sm font-mono text-electric-blue">
          {element}
        </code>
      );
    }
    if (attrs.link) {
      // Ensure URL has proper protocol
      let url = attrs.link;
      if (
        url &&
        !url.match(/^https?:\/\//i) &&
        !url.startsWith("mailto:") &&
        !url.startsWith("tel:")
      ) {
        url = "https://" + url;
      }
      element = (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-electric-blue hover:underline"
        >
          {element}
        </a>
      );
    }

    return <span key={key}>{element}</span>;
  };

  // Render a processed block
  const renderBlock = (block: any, index: number): React.ReactNode => {
    if (block.type === "code-block") {
      return (
        <pre
          key={`codeblock-${index}`}
          className="bg-neomorphic-surface/60 dark:bg-[#161b22] border border-neomorphic-border/40 rounded-lg p-2.5 my-1 overflow-x-auto font-mono text-sm"
        >
          <code className="text-neomorphic-text whitespace-pre">
            {block.content}
          </code>
        </pre>
      );
    }

    if (block.type === "list") {
      const ListTag = block.listType === "ordered" ? "ol" : "ul";
      const listClass =
        block.listType === "ordered"
          ? "list-decimal ml-4 my-1"
          : "list-disc ml-4 my-1";

      return (
        <ListTag key={`list-${index}`} className={listClass}>
          {block.items.map((item: any, itemIndex: number) => (
            <li key={`li-${index}-${itemIndex}`} className="pl-1">
              {applyInlineFormatting(
                item.content,
                item.attrs,
                `li-content-${index}-${itemIndex}`
              )}
            </li>
          ))}
        </ListTag>
      );
    }

    if (block.type === "regular") {
      const op = block.op;
      if (typeof op.insert !== "string") return null;

      const text = op.insert;
      const attrs = op.attributes || {};

      // Skip standalone list/code-block newlines
      if (text === "\n" && (attrs["code-block"] || attrs.list)) {
        return null;
      }

      return applyInlineFormatting(text, attrs, `regular-${index}`);
    }

    return null;
  };

  const renderMessageContent = () => {
    // If there's rich content with Delta, try to parse it for mentions and formatting
    if (message.richContent?.delta) {
      try {
        const delta = message.richContent.delta;
        if (delta.ops) {
          // Process ops into structured blocks
          const processedBlocks = processDeltaOps(delta.ops);

          return (
            <div className="mb-0 whitespace-pre-wrap break-words">
              {processedBlocks.map((block: any, index: number) =>
                renderBlock(block, index)
              )}
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
                        <File className="h-3.5 w-3.5 text-slate-500 dark:text-[#8d96a0]" />
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
    <div
      className={cn(
        "group flex items-start px-4 hover:bg-neomorphic-surface/20 rounded-lg transition-colors message-bubble relative",
        isGrouped
          ? "-mt-0.5"
          : "pt-2 mt-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200"
      )}
    >
      {/* Avatar - Hidden for grouped messages, but space preserved */}
      <div className="flex-shrink-0 w-8 mr-3">
        {!isGrouped && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
            style={{ backgroundColor: getUserColor(message.userName) }}
          >
            {getUserInitials(message.userName)}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 relative">
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-neomorphic-bg/95 backdrop-blur-sm rounded-lg z-20 flex items-center justify-center">
            <div className="bg-neomorphic-surface border border-neomorphic-border rounded-xl p-4 shadow-lg max-w-xs">
              <p className="text-sm text-neomorphic-text mb-3">
                Delete this message?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-neomorphic-bg hover:bg-neomorphic-surface transition-colors text-neomorphic-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeletePending}
                  className="px-3 py-1.5 text-xs rounded-lg bg-coral-red hover:bg-coral-red/90 transition-colors text-white disabled:opacity-50"
                >
                  {isDeletePending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Actions - Positioned as overlay */}
        {!isEditing && (
          <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
            <div className="flex items-center gap-0.5 bg-neomorphic-surface/95 rounded-lg shadow-md border border-neomorphic-border/40 p-0.5">
              <button
                onClick={handleReply}
                className="p-1.5 hover:bg-electric-blue/10 rounded-md transition-colors text-neomorphic-text-secondary hover:text-electric-blue"
                title="Reply"
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
              {isMine && (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="p-1.5 hover:bg-electric-blue/10 rounded-md transition-colors text-neomorphic-text-secondary hover:text-electric-blue"
                    title="Edit message"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 hover:bg-coral-red/10 rounded-md transition-colors text-neomorphic-text-secondary hover:text-coral-red"
                    title="Delete message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 hover:bg-neomorphic-surface-hover rounded-md transition-colors text-neomorphic-text-secondary hover:text-neomorphic-text"
                title="More actions"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        {/* Reply Preview - shown if this message is a reply */}
        {message.replyToId &&
          message.replyToContent &&
          message.replyToUserName && (
            <div className="mb-2 p-2.5 border-l-4 border-electric-blue bg-neomorphic-surface/40 rounded-r-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-3 w-3 text-electric-blue" />
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: getUserColor(message.replyToUserName),
                  }}
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
            isMine ? "text-neomorphic-text" : "text-neomorphic-text"
          )}
        >
          {/* Message Header - Hidden for grouped messages */}
          {!isGrouped && (
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
          )}

          {/* Message Body - Show edit input or content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 text-sm rounded-lg border border-neomorphic-border bg-neomorphic-bg text-neomorphic-text focus:outline-none focus:ring-2 focus:ring-electric-blue/50 resize-none min-h-[60px]"
                placeholder="Edit your message..."
              />
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditPending}
                  className="px-3 py-1.5 rounded-lg bg-electric-blue hover:bg-electric-blue/90 text-white transition-colors disabled:opacity-50"
                >
                  {isEditPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-neomorphic-surface hover:bg-neomorphic-bg text-neomorphic-text transition-colors"
                >
                  Cancel
                </button>
                <span className="text-neomorphic-text-secondary ml-2">
                  Escape to cancel • Enter to save
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-normal text-neomorphic-text">
              {renderMessageContent()}
              {renderRichContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
