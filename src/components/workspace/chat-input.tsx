import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { uploadFiles, UploadedFile } from "@/lib/upload";

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

      // Upload files to Backblaze B2 if any
      let uploadedFiles: UploadedFile[] = [];
      if (hasFileContent) {
        try {
          uploadedFiles = await uploadFiles(images);
          toast.success(
            `${uploadedFiles.length} file(s) uploaded successfully`
          );
        } catch (error) {
          console.error("File upload failed:", error);
          toast.error(
            "Failed to upload files. Message will be sent without attachments."
          );
          // Continue without files rather than failing completely
        }
      }

      // Prepare rich content object
      const richContent: any = {};

      if (parsedContent && hasTextContent) {
        richContent.delta = parsedContent;
      }

      if (uploadedFiles.length > 0) {
        richContent.attachments = uploadedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url, // Real URL from Backblaze B2
        }));
      }

      // Send the message
      const contentToSend = hasTextContent
        ? plainTextContent
        : uploadedFiles.length > 0
          ? `Shared ${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""}`
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
