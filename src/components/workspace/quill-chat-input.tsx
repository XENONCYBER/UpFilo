"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  Bold,
  Italic,
  Underline,
  Code,
  List,
  Quote,
  AtSign,
  Hash,
  MoreHorizontal,
  Type,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface QuillChatInputProps {
  onSendMessage?: (message: string, richContent?: any) => void;
  placeholder?: string;
}

export function QuillChatInput({
  onSendMessage,
  placeholder = "Type a message...",
}: QuillChatInputProps) {
  const [content, setContent] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const quillRef = useRef<any>(null);

  // Simplified toolbar configuration (hidden by default)
  const modules = {
    toolbar: false, // We'll create our own custom toolbar
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "code",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
  ];

  // Custom toolbar actions
  const formatText = (format: string, value?: any) => {
    // For now, we'll implement basic formatting via execCommand
    // In a full implementation, you'd want to integrate more deeply with Quill
    document.execCommand(format, false, value);
  };

  // Handle content change
  const handleChange = (value: string) => {
    setContent(value);
    // Check if there's actual content (not just empty tags)
    const textContent = value.replace(/<[^>]*>/g, "").trim();
    setHasContent(textContent.length > 0);
  };

  // Handle send message
  const handleSend = () => {
    if (!hasContent || !onSendMessage) return;

    // Get plain text version
    const textContent = content.replace(/<[^>]*>/g, "").trim();

    if (textContent) {
      // Send both plain text and rich content
      onSendMessage(textContent, {
        html: content,
        text: textContent,
        delta: null, // We'll implement delta later if needed
      });

      // Clear the editor
      setContent("");
      setHasContent(false);
      setShowFormatting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle focus to show formatting
  const handleFocus = () => {
    setShowFormatting(true);
  };

  return (
    <div className="p-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl">
      {/* Main Input Container - Slack-style */}
      <div className="glass-surface border border-white/30 dark:border-white/20 rounded-lg bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-glass overflow-hidden">
        {/* Top Formatting Toolbar - Shows when focused */}
        {showFormatting && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("bold")}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("italic")}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("underline")}
              >
                <Underline className="h-3.5 w-3.5" />
              </Button>
              <div className="w-px h-4 bg-white/20 dark:bg-white/10 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("code")}
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("blockquote")}
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                onClick={() => formatText("list", "bullet")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowFormatting(false)}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="relative">
          <div className="min-h-[44px] max-h-[200px] overflow-y-auto">
            <ReactQuill
              theme="bubble" // Use bubble theme for cleaner look
              value={content}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              className="slack-input"
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-white/20 dark:border-white/10">
            <div className="flex items-center space-x-1">
              {/* Attachment Actions */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                title="Add image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                title="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                title="Mention someone"
              >
                <AtSign className="h-4 w-4" />
              </Button>

              {/* Formatting Toggle */}
              {!showFormatting && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-white/30"
                  onClick={() => setShowFormatting(true)}
                  title="Show formatting options"
                >
                  <Type className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!hasContent}
              className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${
                hasContent
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg scale-100"
                  : "bg-muted text-muted-foreground scale-95"
              }`}
              title="Send message (Enter)"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center mt-2 px-2 text-xs text-muted-foreground">
        <span>
          <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new
          line
        </span>
        <span>Rich text formatting available</span>
      </div>
    </div>
  );
}
