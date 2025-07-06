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
import { ImageIcon, XIcon } from "lucide-react";
import { MdSend } from "react-icons/md";
import { Hint } from "./hint";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
}

const Editor = ({
  onSubmit,
  onCancel,
  placeholder = "Write something",
  defaultValue = [],
  innerRef,
  variant = "create",
  disabled = false,
}: editorProps) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const disabledRef = useRef(disabled);

  const imageElementRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;

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
  }, [innerRef]);

  const toogleToolbar = () => {
    setIsToolbarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
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
      <div className="flex flex-col border border-slate-200 dark:border-white/20 rounded-md overflow-hidden focus-within:border-slate-300 dark:focus-within:border-white/30 focus-within:shadow-sm transition bg-white dark:bg-black/40 backdrop-blur-xl">
        <div ref={containerRef} className="h-full ql-custom" />
        {images.length > 0 && (
          <div className="p-2">
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative size-16 flex items-center justify-center group/image border border-border rounded-lg overflow-hidden">
                    <Hint label="Remove File">
                      <button
                        onClick={() => {
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="hidden group-hover:flex rounded-full bg-black/70 hover:bg-black dark:bg-white/20 dark:hover:bg-white/30 absolute -top-2 -right-2 text-white dark:text-white size-5 z-[4] border-2 border-white dark:border-black/20 items-center justify-center transition-all duration-200"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Hint>
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Uploaded"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-muted-foreground p-1">
                        <div className="truncate w-full text-center">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </div>
                        <div className="text-[10px] opacity-70">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex px-2 pb-1 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide Formatting" : "Show Formatting"}
          >
            <Button disabled={disabled} variant="ghost" onClick={toogleToolbar}>
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          {variant === "create" && (
            <Hint label="Add Media">
              <Button
                disabled={disabled}
                variant="ghost"
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    images,
                  });
                }}
                size="sm"
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() => {
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  images,
                });
              }}
              className={cn(
                "ml-auto size-8 p-0 rounded-full transition-all duration-200",
                isEmpty
                  ? "bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white shadow-md hover:shadow-lg hover:scale-105"
              )}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "px-2 pb-1 flex justify-end text-[10px] text-muted-foreground opacity-0 transition",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shift+Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
