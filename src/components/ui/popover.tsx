"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover = ({ children, open, onOpenChange }: PopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const currentlyOpen = open !== undefined ? open : isOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setIsOpen(newOpen);
      }
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (currentlyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentlyOpen, handleOpenChange]);

  return (
    <PopoverContext.Provider
      value={{ open: currentlyOpen, onOpenChange: handleOpenChange }}
    >
      <div ref={popoverRef} className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>(({ children, onClick, asChild = false, ...props }, ref) => {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("PopoverTrigger must be used within a Popover");
  }

  const handleClick = () => {
    context.onOpenChange(!context.open);
    if (onClick) {
      onClick();
    }
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  style?: React.CSSProperties;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(
  (
    { children, className, align = "center", side = "bottom", style, ...props },
    ref
  ) => {
    const context = React.useContext(PopoverContext);

    if (!context) {
      throw new Error("PopoverContent must be used within a Popover");
    }

    if (!context.open) {
      return null;
    }

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "absolute z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          side === "bottom" && "top-full",
          side === "top" && "bottom-full mb-2",
          side === "left" && "right-full mr-2",
          side === "right" && "left-full ml-2",
          align === "start" && "left-0",
          align === "center" && "left-1/2 transform -translate-x-1/2",
          align === "end" && "right-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";
