"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface ReplyMessage {
  _id: Id<"messages">;
  content: string;
  userName: string;
  createdAt: number;
}

interface ReplyContextType {
  replyingTo: ReplyMessage | null;
  setReplyingTo: (message: ReplyMessage | null) => void;
  clearReply: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

export function ReplyProvider({ children }: { children: ReactNode }) {
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);

  const clearReply = () => setReplyingTo(null);

  return (
    <ReplyContext.Provider value={{ replyingTo, setReplyingTo, clearReply }}>
      {children}
    </ReplyContext.Provider>
  );
}

export function useReply() {
  const context = useContext(ReplyContext);
  if (context === undefined) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}
