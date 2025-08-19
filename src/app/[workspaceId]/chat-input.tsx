import { useSendMessage } from "@/features/messages/api/use-send-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Editor = dynamic(() => import("@/components/workspace/editor"), {
  ssr: false,
});

interface ChatInputProps {
  placeholder: string;
  onSendMessage?: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({
  placeholder,
  onSendMessage,
  disabled,
}: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const { mutate: sendMessage } = useSendMessage({ channelId });

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

      // Use the sendMessage hook with the expected interface
      await sendMessage({
        content: body,
        userName: "User", // TODO: Get actual user name
        richContent: images.length > 0 ? { images } : undefined,
      });

      // Call parent onSendMessage if provided
      if (onSendMessage) {
        onSendMessage(body);
      }

      setEditorKey((prevKey) => prevKey + 1);
      toast.success("Message sent successfully");
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  return (
    <div className="p-3 border-t border-neomorphic-border bg-neomorphic-surface">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending || disabled}
        innerRef={editorRef}
      />
    </div>
  );
};
