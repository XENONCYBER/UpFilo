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
import { ImageIcon, XIcon, AtSignIcon, FileText, Video, Music, FileIcon, Archive, Code } from "lucide-react";
import { MdSend } from "react-icons/md";
import { Hint } from "./hint";
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
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (type.startsWith('video/')) {
    return <Video className="size-6 text-white" />;
  } else if (type.startsWith('audio/')) {
    return <Music className="size-6 text-white" />;
  } else if (type === 'application/pdf' || extension === 'pdf') {
    return <FileText className="size-6 text-white" />;
  } else if (['doc', 'docx'].includes(extension || '')) {
    return <FileText className="size-6 text-white" />;
  } else if (['txt', 'rtf'].includes(extension || '')) {
    return <FileText className="size-6 text-white" />;
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return <Archive className="size-6 text-white" />;
  } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(extension || '')) {
    return <Code className="size-6 text-white" />;
  } else {
    return <FileIcon className="size-6 text-white" />;
  }
};

// Helper function to get file type background color
const getFileTypeStyles = (type: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (type.startsWith('video/')) {
    return { bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600' };
  } else if (type.startsWith('audio/')) {
    return { bgColor: 'bg-gradient-to-br from-pink-500 to-pink-600' };
  } else if (type === 'application/pdf' || extension === 'pdf') {
    return { bgColor: 'bg-gradient-to-br from-red-500 to-red-600' };
  } else if (['doc', 'docx'].includes(extension || '')) {
    return { bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600' };
  } else if (['txt', 'rtf'].includes(extension || '')) {
    return { bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600' };
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return { bgColor: 'bg-gradient-to-br from-yellow-500 to-yellow-600' };
  } else if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(extension || '')) {
    return { bgColor: 'bg-gradient-to-br from-green-500 to-green-600' };
  } else {
    return { bgColor: 'bg-gradient-to-br from-slate-500 to-slate-600' };
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
    workspaceId: workspaceId!
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
    return uploadProgress.find(p => p.file.name === file.name && p.file.size === file.size);
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
            console.log('Mentioned user:', userName);
          }
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
    mentionModuleRef.current = quill.getModule('mention') as MentionModule;

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
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
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
      <div className="flex flex-col border border-neomorphic-border rounded-neomorphic overflow-hidden focus-within:border-electric-blue focus-within:shadow-neomorphic transition card-neomorphic">
        <div ref={containerRef} className="h-full ql-custom" />
        {images.length > 0 && (
          <div className="p-2">
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => {
                const fileProgress = getFileProgress(file);
                const isUploading = fileProgress?.status === 'uploading';
                const isCompleted = fileProgress?.status === 'completed';
                const isError = fileProgress?.status === 'error';
                
                return (
                  <div key={index} className="relative group">
                    <div className="relative size-16 flex items-center justify-center border border-border rounded-lg overflow-hidden">
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
                          <div className={cn(
                            "flex flex-col items-center justify-center h-full w-full relative rounded-lg",
                            isUploading ? "opacity-50" : "opacity-100",
                            getFileTypeStyles(file.type, file.name).bgColor
                          )}>
                            {/* File size label - top right corner */}
                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[7px] font-semibold px-1 py-0.5 rounded text-center leading-none">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </div>
                            
                            {/* File icon - centered and larger */}
                            <div className="flex items-center justify-center mb-1">
                              {getFileTypeIcon(file.type, file.name)}
                            </div>
                            
                            {/* File extension only - no overlap */}
                            <div className="text-[10px] font-bold text-white text-center leading-none">
                              {file.name.split(".").pop()?.toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover overlay - covers entire container */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                      
                      {/* Remove button - centered in container */}
                      <button
                        onClick={() => {
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-10"
                      >
                        <div className="rounded-full bg-neomorphic-bg text-coral-red hover:text-coral-red/80 size-8 flex items-center justify-center shadow-neomorphic hover:shadow-neomorphic-pressed border border-neomorphic-border transition-all duration-200">
                          <XIcon className="size-4" />
                        </div>
                      </button>
                      
                      {/* Upload Progress Overlay */}
                      {fileProgress && (isUploading || fileProgress.status === 'pending') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
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
                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Error Indicator */}
                      {isError && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5">
                          <XIcon className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex px-1.5 py-1.5 mt-2 z-[5] gap-x-2">
          <Hint
            label={isToolbarVisible ? "Hide Formatting" : "Show Formatting"}
          >
            <button
              disabled={disabled}
              onClick={toogleToolbar}
              className="btn-neomorphic p-2"
            >
              <PiTextAa className="size-4" />
            </button>
          </Hint>
          <Hint label="Mention User">
            <button
              disabled={disabled}
              onClick={triggerMention}
              className="btn-neomorphic p-2"
            >
              <AtSignIcon className="size-4" />
            </button>
          </Hint>
          {variant === "create" && (
            <Hint label="Add Media">
              <button
                disabled={disabled}
                onClick={() => imageElementRef.current?.click()}
                className="btn-neomorphic p-2"
              >
                <ImageIcon className="size-4" />
              </button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-1.5">
              <button
                onClick={onCancel}
                disabled={disabled}
                className="btn-neomorphic px-2.5 py-0.5 text-xs"
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
                className="btn-primary px-2.5 py-0.5 text-xs"
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
                "ml-auto p-2 rounded-full transition-all duration-200 interactive-lift min-w-[36px] min-h-[36px] flex items-center justify-center",
                isEmpty
                  ? "bg-neomorphic-surface text-neomorphic-text-secondary cursor-not-allowed opacity-50"
                  : "btn-primary shadow-neomorphic hover:shadow-neomorphic-pressed hover:scale-105"
              )}
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
