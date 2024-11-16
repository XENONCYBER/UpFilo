"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/ScrollArea";
import Image from "next/image";

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  file?: {
    type: string;
    url: string;
  };
}

interface MessageBoxProps {
  messages: Message[];
}

export default function MessageBox({ messages }: MessageBoxProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const renderFile = (file: { type: string; url: string }) => {
    if (file.type.startsWith("image/")) {
      return (
        <Image
          src={file.url}
          alt="Uploaded image"
          className="max-w-full h-auto rounded"
        />
      );
    } else if (file.type.startsWith("video/")) {
      return (
        <video src={file.url} controls className="max-w-full h-auto rounded" />
      );
    } else if (file.type.startsWith("audio/")) {
      return <audio src={file.url} controls className="max-w-full" />;
    } else {
      return (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          View document
        </a>
      );
    }
  };

  return (
    <ScrollArea
      className="flex-grow p-4 discord-message-box"
      ref={scrollAreaRef}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-start space-x-2 animate-fadeIn discord-message"
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              {message.user[0]}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold">{message.user}</span>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {message.content && <p className="text-sm">{message.content}</p>}
              {message.file && renderFile(message.file)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
