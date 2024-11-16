"use client";

import { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface ChatInputProps {
  onSendMessage: (content: string, file?: File) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || fileInputRef.current?.files?.[0]) {
      onSendMessage(message, fileInputRef.current?.files?.[0]);
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onSendMessage("", e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 discord-chat-input">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow discord-input"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
