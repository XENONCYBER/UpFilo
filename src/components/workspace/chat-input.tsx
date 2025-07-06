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
  onSendMessage: (content: string) => void;
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

      // For now, just send the text content
      // Image upload can be added later if needed
      if (body.trim()) {
        onSendMessage(body.trim());
        setEditorKey((prevKey) => prevKey + 1);
      }

      // TODO: Handle multiple images upload
      if (images.length > 0) {
        console.log(
          `Selected ${images.length} files:`,
          images.map((f) => f.name)
        );
        // Add your image upload logic here
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={disabled || isPending}
        innerRef={editorRef}
      />
    </div>
  );
};
