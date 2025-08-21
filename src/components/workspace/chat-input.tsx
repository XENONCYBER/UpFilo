import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { uploadFiles, UploadedFile, UploadProgress } from "@/lib/upload";
import { useMentionParser } from "./mentions";
import { useReply } from "../ReplyProvider";
import { ReplyPreview } from "../ReplyPreview";

const Editor = dynamic(() => import("@/components/workspace/editor"), {
  ssr: false,
});

interface ChatInputProps {
  placeholder: string;
  onSendMessage: (content: string, richContent?: any, replyData?: {
    replyToId: Id<"messages">;
    replyToContent: string;
    replyToUserName: string;
  }) => void;
  disabled?: boolean;
}

export const ChatInput = ({
  placeholder,
  onSendMessage,
  disabled = false,
}: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { parseMentions } = useMentionParser();
  const { replyingTo, clearReply } = useReply();

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
          // Initialize progress state immediately to show pending files
          const initialProgress = images.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const
          }));
          setUploadProgress(initialProgress);
          
          uploadedFiles = await uploadFiles(images, (progress) => {
            setUploadProgress([...progress]); // Create new array to trigger re-render
          });
          toast.success(
            `${uploadedFiles.length} file(s) uploaded successfully`
          );
          // Clear progress after completion
          setTimeout(() => {
            setUploadProgress([]);
          }, 2000);
        } catch (error) {
          console.error("File upload failed:", error);
          toast.error(
            "Failed to upload files. Message will be sent without attachments."
          );
          // Clear progress on error too
          setUploadProgress([]);
          // Continue without files rather than failing completely
        }
      }

      // Prepare rich content object
      const richContent: any = {};

      if (parsedContent && hasTextContent) {
        richContent.delta = parsedContent;
        
        // Extract mentions from the content
        const mentions = parseMentions(plainTextContent);
        if (mentions.length > 0) {
          richContent.mentions = mentions;
        }
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

      // Prepare reply data if replying to a message
      const replyData = replyingTo ? {
        replyToId: replyingTo._id,
        replyToContent: replyingTo.content,
        replyToUserName: replyingTo.userName,
      } : undefined;

      await onSendMessage(
        contentToSend,
        Object.keys(richContent).length > 0 ? richContent : undefined,
        replyData
      );

      // Clear reply state after sending
      if (replyingTo) {
        clearReply();
      }

      // Reset the editor AFTER everything is done for better UX
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <ReplyPreview />
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={disabled || isPending}
        innerRef={editorRef}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};
