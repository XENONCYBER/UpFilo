"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple dropdown state management
interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(
  undefined
);

// Main Dropdown wrapper component
export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      triggerRef,
    }),
    [open]
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
}

// Dropdown trigger button
export function DropdownMenuTrigger({
  children,
  asChild = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    context.setOpen(!context.open);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref: context.triggerRef,
      onClick: handleClick,
      "aria-expanded": context.open,
      ...props,
    });
  }

  return (
    <button
      ref={context.triggerRef as React.RefObject<HTMLButtonElement>}
      className={className}
      onClick={handleClick}
      aria-expanded={context.open}
      {...props}
    >
      {children}
    </button>
  );
}

// Dropdown content
export function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset = 4,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error("DropdownMenuContent must be used within DropdownMenu");

  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close
  React.useEffect(() => {
    if (!context.open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking on trigger or content
      if (
        context.triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }

      context.setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        context.setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [context.open, context.setOpen, context.triggerRef]);

  if (!context.open) return null;

  const alignmentClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-[200] min-w-[160px] overflow-hidden rounded-md p-1",
        "glass-surface bg-white/90 dark:bg-black/80 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10 shadow-glass",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
        alignmentClass,
        className
      )}
      style={{
        top: `calc(100% + ${sideOffset}px)`,
        zIndex: 200,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Dropdown menu item
export function DropdownMenuItem({
  children,
  className,
  onClick,
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error("DropdownMenuItem must be used within DropdownMenu");

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    onClick?.(e);
    context.setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:bg-white/50 dark:hover:bg-white/10 hover:backdrop-blur-sm focus:bg-white/50 dark:focus:bg-white/10",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Dropdown menu separator
export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  );
}

// Dropdown menu label
export function DropdownMenuLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Checkbox item
export function DropdownMenuCheckboxItem({
  children,
  className,
  checked = false,
  onCheckedChange,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownContext);
  if (!context)
    throw new Error(
      "DropdownMenuCheckboxItem must be used within DropdownMenu"
    );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onCheckedChange?.(!checked);
    props.onClick?.(e);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-white/50 dark:hover:bg-white/10",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
}
