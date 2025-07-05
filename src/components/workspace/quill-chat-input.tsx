"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Paperclip,
  Image,
  Smile,
  Plus,
  Bold,
  Italic,
  Underline,
  Code,
  List,
  AlignLeft,
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
  const quillRef = useRef<any>(null);

  // Custom toolbar configuration
  const modules = {
    toolbar: {
      container: [
        [{ header: [3, 4, 5, false] }],
        ["bold", "italic", "underline", "code"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "code",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "color",
    "background",
  ];

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
      // Get Quill instance and delta content
      const quill = quillRef.current?.getEditor();
      const delta = quill?.getContents();

      // Send both plain text and rich content
      onSendMessage(textContent, {
        html: content,
        text: textContent,
        delta: delta,
      });

      // Clear the editor
      setContent("");
      setHasContent(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // Custom theme styles
  const quillStyle = {
    height: "auto",
    minHeight: "60px",
    maxHeight: "200px",
  };

  return (
    <div className="glass-surface p-4 border-t border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-xl shadow-glass">
      <div className="flex items-start space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-2"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <div className="glass-input rounded-lg overflow-hidden min-h-[100px] max-h-[250px]">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              style={quillStyle}
              bounds=".glass-input"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Add image"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={!hasContent}
          className="flex-shrink-0 glass-button-primary mt-2"
          size="icon"
          title="Send message (Ctrl+Enter)"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Use Ctrl+Enter to send</span>
        <span>Rich text editor powered by Quill</span>
      </div>
    </div>
  );
}
