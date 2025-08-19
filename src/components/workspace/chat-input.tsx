import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/workspace/editor"), {
  ssr: false,
});

interface ChatInputProps {
  placeholder: string;
  onSendMessage: (content: string, richContent?: any) => void;
  disabled?: boolean;
}

export const ChatInput = ({
  placeholder,
  onSendMessage,
  disabled = false,
}: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const handleSubmit = async ({
    body,
    images,
  }: {
    body: string;
    images: File[];
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);

      // Parse the rich content from Quill
      let parsedContent: any = null;
      let plainTextContent = "";

      try {
        parsedContent = JSON.parse(body);
        // Extract plain text from Delta content
        if (parsedContent?.ops) {
          plainTextContent = parsedContent.ops
            .map((op: any) => (typeof op.insert === "string" ? op.insert : ""))
            .join("")
            .trim();
        }
      } catch (e) {
        // If parsing fails, treat as plain text
        plainTextContent = body.trim();
      }

      // Check if we have any content to send
      const hasTextContent = plainTextContent.length > 0;
      const hasFileContent = images.length > 0;

      if (!hasTextContent && !hasFileContent) {
        return; // Don't send empty messages
      }

      // Prepare rich content object
      const richContent: any = {};

      if (parsedContent && hasTextContent) {
        richContent.delta = parsedContent;
      }

      if (hasFileContent) {
        richContent.attachments = images.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          // TODO: Upload files to storage and get URLs
          url: URL.createObjectURL(file), // Temporary blob URL
        }));
      }

      // Send the message
      const contentToSend = hasTextContent
        ? plainTextContent
        : hasFileContent
          ? `Shared ${images.length} file${images.length > 1 ? "s" : ""}`
          : "";

      // Reset the editor immediately for better UX (optimistic UI)
      setEditorKey((prevKey) => prevKey + 1);

      await onSendMessage(
        contentToSend,
        Object.keys(richContent).length > 0 ? richContent : undefined
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <Editor
      key={editorKey}
      placeholder={placeholder}
      onSubmit={handleSubmit}
      disabled={disabled || isPending}
      innerRef={editorRef}
    />
  );
};
