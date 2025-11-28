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
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isInteractingRef = React.useRef(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (context.open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";

      // On mobile, also set position fixed to prevent scroll issues with keyboard
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${window.scrollY}px`;
      }

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
        if (isMobile) {
          const scrollY = document.body.style.top;
          document.body.style.position = "";
          document.body.style.width = "";
          document.body.style.top = "";
          window.scrollTo(0, parseInt(scrollY || "0") * -1);
        }
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [context.open, context.onOpenChange, onClose]);

  if (!context.open || !mounted) return null;

  const safeClose = () => {
    // Don't close if user is interacting with the content
    if (isInteractingRef.current) {
      return;
    }
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    context.onOpenChange(false);
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop element
    if (e.target === e.currentTarget) {
      safeClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Track interaction state to prevent closing during keyboard opening
  const handleContentTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isInteractingRef.current = true;
    // Clear interaction flag after a delay
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 500);
  };

  const handleContentTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleContentMouseDown = () => {
    isInteractingRef.current = true;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={handleBackdropClick}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-[10000] w-full max-w-lg max-h-[85vh] overflow-y-auto",
          "bg-neomorphic-bg/95 backdrop-blur-xl border border-neomorphic-border/50",
          "rounded-2xl p-6",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          "shadow-2xl shadow-black/20",
          className
        )}
        style={{ zIndex: 10000 }}
        onClick={handleContentClick}
        onTouchStart={handleContentTouchStart}
        onTouchEnd={handleContentTouchEnd}
        onMouseDown={handleContentMouseDown}
        {...props}
      >
        {/* Close button */}
        <button
          onClick={() => {
            context.onOpenChange(false);
            onClose?.();
          }}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-neomorphic-surface text-neomorphic-text-secondary hover:text-neomorphic-text transition-all duration-200"
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
        "flex flex-col space-y-2 text-center sm:text-left mb-6",
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
    <h2 className={cn("heading-md text-xl", className)} {...props}>
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
    <p className={cn("subtitle-md text-sm", className)} {...props}>
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
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
