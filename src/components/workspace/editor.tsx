import Quill, { QuillOptions } from "quill";
import { PiTextAa } from "react-icons/pi";
import "quill/dist/quill.snow.css";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  XIcon,
  AtSignIcon,
  FileText,
  Video,
  Music,
  FileIcon,
  Archive,
  Code,
  Check,
} from "lucide-react";
import { MdSend } from "react-icons/md";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CircularProgress } from "@/components/ui/circular-progress";
import { UploadProgress } from "@/lib/upload";
import { MentionModule, registerMentionModule } from "@/lib/mention-module";
import { useGetAllWorkspaceUsers } from "@/features/workspaces/api/use-get-all-workspace-users";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";

// Register the mention module
registerMentionModule();

// Helper function to get file type icon
const getFileTypeIcon = (type: string, fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (type.startsWith("video/")) {
    return <Video className="size-6 text-white" />;
  } else if (type.startsWith("audio/")) {
    return <Music className="size-6 text-white" />;
  } else if (type === "application/pdf" || extension === "pdf") {
    return <FileText className="size-6 text-white" />;
  } else if (["doc", "docx"].includes(extension || "")) {
    return <FileText className="size-6 text-white" />;
  } else if (["txt", "rtf"].includes(extension || "")) {
    return <FileText className="size-6 text-white" />;
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
    return <Archive className="size-6 text-white" />;
  } else if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "xml",
      "py",
      "java",
      "cpp",
      "c",
    ].includes(extension || "")
  ) {
    return <Code className="size-6 text-white" />;
  } else {
    return <FileIcon className="size-6 text-white" />;
  }
};

// Helper function to get file type background color
const getFileTypeStyles = (type: string, fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (type.startsWith("video/")) {
    return { bgColor: "bg-gradient-to-br from-purple-500 to-purple-600" };
  } else if (type.startsWith("audio/")) {
    return { bgColor: "bg-gradient-to-br from-pink-500 to-pink-600" };
  } else if (type === "application/pdf" || extension === "pdf") {
    return { bgColor: "bg-gradient-to-br from-red-500 to-red-600" };
  } else if (["doc", "docx"].includes(extension || "")) {
    return { bgColor: "bg-gradient-to-br from-blue-500 to-blue-600" };
  } else if (["txt", "rtf"].includes(extension || "")) {
    return { bgColor: "bg-gradient-to-br from-gray-500 to-gray-600" };
  } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension || "")) {
    return { bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-600" };
  } else if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "xml",
      "py",
      "java",
      "cpp",
      "c",
    ].includes(extension || "")
  ) {
    return { bgColor: "bg-gradient-to-br from-green-500 to-green-600" };
  } else {
    return { bgColor: "bg-gradient-to-br from-slate-500 to-slate-600" };
  }
};

type EditorValue = {
  images: File[];
  body: string;
};

interface editorProps {
  onSubmit: ({ images, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: Delta | Op[];
  innerRef?: MutableRefObject<Quill | null>;
  variant?: "create" | "update";
  uploadProgress?: UploadProgress[];
}

const Editor = ({
  onSubmit,
  onCancel,
  placeholder = "Write something",
  defaultValue = [],
  innerRef,
  variant = "create",
  disabled = false,
  uploadProgress = [],
}: editorProps) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const workspaceId = useConvexWorkspaceId();
  const { data: allUsers = [] } = useGetAllWorkspaceUsers({
    workspaceId: workspaceId!,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const disabledRef = useRef(disabled);
  const mentionModuleRef = useRef<MentionModule | null>(null);

  const imageElementRef = useRef<HTMLInputElement>(null);

  // Helper function to get upload progress for a specific file
  const getFileProgress = (file: File) => {
    return uploadProgress.find(
      (p) => p.file.name === file.name && p.file.size === file.size
    );
  };

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current || !workspaceId) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
        mention: {
          users: allUsers,
          onMentionSelect: (userName: string) => {
            console.log("Mentioned user:", userName);
          },
        },
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();

                const isEmpty =
                  images.length === 0 &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body, images });
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    // Get the mention module instance
    mentionModuleRef.current = quill.getModule("mention") as MentionModule;

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      quill.off(Quill.events.SELECTION_CHANGE);
      if (mentionModuleRef.current) {
        mentionModuleRef.current.destroy();
        mentionModuleRef.current = null;
      }
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef, workspaceId, allUsers]);

  // Update mention module when all users change
  useEffect(() => {
    if (mentionModuleRef.current && allUsers.length > 0) {
      mentionModuleRef.current.updateUsers(allUsers);
    }
  }, [allUsers]);

  const toogleToolbar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const triggerMention = () => {
    if (quillRef.current) {
      const selection = quillRef.current.getSelection();
      if (selection) {
        quillRef.current.insertText(selection.index, "@");
        quillRef.current.setSelection(selection.index + 1);
      }
    }
  };

  const isEmpty =
    text.replace(/<(.|\n)*?>/g, "").trim().length === 0 && images.length === 0;

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="*/*"
        multiple
        ref={imageElementRef}
        onChange={(event) => {
          if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setImages((prev) => [...prev, ...newFiles]);
          }
        }}
        className="hidden"
      />
      <div className="flex flex-col border border-neomorphic-border/40 rounded-xl overflow-hidden focus-within:border-electric-blue/40 transition-all duration-200 bg-neomorphic-bg">
        <div ref={containerRef} className="h-full ql-custom min-h-[60px]" />
        {images.length > 0 && (
          <div className="p-2 bg-neomorphic-surface/30 border-t border-neomorphic-border/30">
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => {
                const fileProgress = getFileProgress(file);
                const isUploading = fileProgress?.status === "uploading";
                const isCompleted = fileProgress?.status === "completed";
                const isError = fileProgress?.status === "error";

                return (
                  <div key={index} className="relative group">
                    <div className="relative size-14 flex items-center justify-center border border-neomorphic-border/40 rounded-lg overflow-hidden bg-neomorphic-bg transition-transform duration-200 hover:scale-105">
                      {/* Media Content */}
                      <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-200">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Uploaded"
                            fill
                            className={cn(
                              "object-cover rounded-lg",
                              isUploading ? "opacity-50" : "opacity-100"
                            )}
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex flex-col items-center justify-center h-full w-full relative rounded-lg",
                              isUploading ? "opacity-50" : "opacity-100",
                              getFileTypeStyles(file.type, file.name).bgColor
                            )}
                          >
                            {/* File size label - top right corner */}
                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full text-center leading-none backdrop-blur-sm">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </div>

                            {/* File icon - centered and larger */}
                            <div className="flex items-center justify-center mb-1 transform scale-110">
                              {getFileTypeIcon(file.type, file.name)}
                            </div>

                            {/* File extension only - no overlap */}
                            <div className="text-[10px] font-bold text-white text-center leading-none uppercase tracking-wider">
                              {file.name.split(".").pop()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover overlay - covers entire container */}
                      <div className="absolute inset-0 bg-neomorphic-bg/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <button
                          onClick={() => {
                            setImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="rounded-full bg-coral-red/10 text-coral-red hover:bg-coral-red hover:text-white p-2 transition-all duration-200"
                          title="Remove file"
                        >
                          <XIcon className="size-5" />
                        </button>
                      </div>

                      {/* Upload Progress Overlay */}
                      {fileProgress &&
                        (isUploading || fileProgress.status === "pending") && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                            <CircularProgress
                              value={fileProgress.progress}
                              size={32}
                              strokeWidth={3}
                              className="text-white"
                            />
                          </div>
                        )}

                      {/* Completed Indicator */}
                      {isCompleted && (
                        <div className="absolute top-1 left-1 bg-soft-green text-white rounded-full p-0.5 shadow-md z-20">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      {/* Error Indicator */}
                      {isError && (
                        <div className="absolute top-1 left-1 bg-coral-red text-white rounded-full p-0.5 shadow-md z-20">
                          <XIcon className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="mt-0.5 max-w-[56px]">
                      <p className="text-[9px] text-neomorphic-text-secondary truncate text-center">
                        {file.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex px-2 py-2 z-[5] gap-x-1 items-center border-t border-neomorphic-border/30 bg-neomorphic-surface/20">
          <button
            disabled={disabled}
            onClick={toogleToolbar}
            className="p-1.5 rounded-md hover:bg-neomorphic-surface/60 hover:text-electric-blue transition-colors text-neomorphic-text-secondary"
            title={
              isToolbarVisible
                ? "Hide formatting toolbar"
                : "Show formatting toolbar"
            }
          >
            <PiTextAa className="size-4" />
          </button>
          <button
            disabled={disabled}
            onClick={triggerMention}
            className="p-1.5 rounded-md hover:bg-neomorphic-surface/60 hover:text-electric-purple transition-colors text-neomorphic-text-secondary"
            title="Mention a user (@)"
          >
            <AtSignIcon className="size-4" />
          </button>
          {variant === "create" && (
            <button
              disabled={disabled}
              onClick={() => imageElementRef.current?.click()}
              className="p-1.5 rounded-md hover:bg-neomorphic-surface/60 hover:text-soft-green transition-colors text-neomorphic-text-secondary"
              title="Attach files (images, videos, documents)"
            >
              <ImageIcon className="size-4" />
            </button>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <button
                onClick={onCancel}
                disabled={disabled}
                className="px-4 py-1.5 text-sm font-medium text-neomorphic-text-secondary hover:text-neomorphic-text hover:bg-neomorphic-surface rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={disabled || isEmpty}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    images,
                  });
                }}
                className="px-4 py-1.5 text-sm font-medium bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          )}
          {variant === "create" && (
            <button
              disabled={disabled || isEmpty}
              onClick={() => {
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  images,
                });
              }}
              className={cn(
                "ml-auto p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center",
                isEmpty || disabled
                  ? "bg-neomorphic-surface/50 text-neomorphic-text-secondary/40 cursor-not-allowed"
                  : "bg-electric-blue text-white hover:bg-electric-blue/90"
              )}
              title={
                isEmpty ? "Type a message to send" : "Send message (Enter)"
              }
            >
              <MdSend className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
