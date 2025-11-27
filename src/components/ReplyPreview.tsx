"use client";

import { X, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReply } from "./ReplyProvider";
import { getUserColor, getUserInitials } from "@/lib/user-colors";

export function ReplyPreview() {
  const { replyingTo, clearReply } = useReply();

  if (!replyingTo) return null;

  // Truncate long messages for preview
  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="border-l-4 border-electric-blue bg-neomorphic-surface/50 p-3 mx-4 mb-2 rounded-r-lg">
      <div className="flex items-start gap-3">
        <Reply className="h-4 w-4 text-electric-blue mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getUserColor(replyingTo.userName) }}
            >
              <span className="text-[8px] font-bold text-white">
                {getUserInitials(replyingTo.userName)}
              </span>
            </div>
            <span className="text-sm font-medium text-neomorphic-text">
              {replyingTo.userName}
            </span>
          </div>

          <p className="text-sm text-neomorphic-text-secondary truncate">
            {truncateContent(replyingTo.content)}
          </p>
        </div>

        <button
          onClick={clearReply}
          className="p-1 hover:bg-neomorphic-surface rounded-lg transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4 text-neomorphic-text-secondary" />
        </button>
      </div>
    </div>
  );
}
