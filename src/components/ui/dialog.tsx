"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple dialog state management
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined
);

// Main Dialog wrapper component
export function Dialog({
  children,
  open = false,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const contextValue = React.useMemo(
    () => ({
      open,
      onOpenChange: onOpenChange || (() => {}),
    }),
    [open, onOpenChange]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

// Dialog trigger button
export function DialogTrigger({
  children,
  asChild = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogTrigger must be used within Dialog");

  const handleClick = () => {
    context.onOpenChange(true);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

// Dialog content - this is the actual modal
export function DialogContent({
  children,
  className,
  onClose,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within Dialog");

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (context.open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          context.onOpenChange(false);
          onClose?.();
        }
      };

      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [context.open, context.onOpenChange, onClose]);

  if (!context.open || !mounted) return null;

  const handleBackdropClick = () => {
    context.onOpenChange(false);
    onClose?.();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-[10000] w-full max-w-lg",
          "card-glass",
          "rounded-neomorphic p-6",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "shadow-neomorphic",
          className
        )}
        style={{ zIndex: 10000 }}
        onClick={handleContentClick}
        {...props}
      >
        {/* Close button */}
        <button
          onClick={() => {
            context.onOpenChange(false);
            onClose?.();
          }}
          className="btn-neomorphic absolute right-4 top-4 p-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}

// Dialog header
export function DialogHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Dialog title
export function DialogTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-neomorphic-text",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

// Dialog description
export function DialogDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-neomorphic-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Dialog footer
export function DialogFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
