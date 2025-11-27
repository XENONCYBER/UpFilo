import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getUserColor,
  getUserInitials,
  getUserMentionColor,
} from "@/lib/user-colors";

interface ActiveUser {
  userName: string;
  lastActivity: number;
  messageCount: number;
  isActive?: boolean;
}

interface MentionDropdownProps {
  users: ActiveUser[];
  searchTerm: string;
  position: { top: number; left: number };
  onSelectUser: (userName: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  users,
  searchTerm,
  position,
  onSelectUser,
  onClose,
  isVisible,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selected index when filtered users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredUsers.length, searchTerm]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            onSelectUser(filteredUsers[selectedIndex].userName);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible, selectedIndex, filteredUsers, onSelectUser, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || filteredUsers.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-neomorphic-surface border border-neomorphic-border rounded-neomorphic shadow-neomorphic max-h-48 overflow-y-auto min-w-[200px]"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="py-2">
        {filteredUsers.map((user, index) => (
          <div
            key={user.userName}
            className={cn(
              "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors",
              index === selectedIndex
                ? "bg-electric-blue/10 text-electric-blue"
                : "hover:bg-neomorphic-border/20"
            )}
            onClick={() => onSelectUser(user.userName)}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback
                className="text-xs text-white"
                style={{ backgroundColor: getUserColor(user.userName) }}
              >
                {getUserInitials(user.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user.userName}
              </div>
              <div className="text-xs text-neomorphic-text-secondary">
                {getActivityStatus(user.lastActivity)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get activity status
function getActivityStatus(lastActivity: number): string {
  const now = Date.now();
  const diff = now - lastActivity;

  if (diff < 5 * 60 * 1000) {
    // 5 minutes
    return "Active now";
  } else if (diff < 30 * 60 * 1000) {
    // 30 minutes
    return "Recently active";
  } else if (diff < 24 * 60 * 60 * 1000) {
    // 24 hours
    return "Active today";
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    // 7 days
    return "Active this week";
  } else {
    return "Available";
  }
}

// Mention component for displaying mentions in messages
interface MentionProps {
  userName: string;
  className?: string;
}

export const Mention: React.FC<MentionProps> = ({ userName, className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 mx-0.5 text-sm font-medium rounded-md border",
        getUserMentionColor(userName),
        className
      )}
    >
      @{userName}
    </span>
  );
};

// Hook for parsing mentions from text
export const useMentionParser = () => {
  const parseMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add mention component
      parts.push(
        <Mention key={`mention-${match.index}`} userName={match[1]} />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return { parseMentions, renderTextWithMentions };
};
