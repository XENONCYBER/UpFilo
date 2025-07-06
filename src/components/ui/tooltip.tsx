"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export const Tooltip = ({ children }: TooltipProps) => {
  return <div className="relative group">{children}</div>;
};

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  TooltipTriggerProps
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(({ children, className, side = "top", align = "center", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
        side === "top" && "bottom-full mb-2",
        side === "bottom" && "top-full mt-2",
        side === "left" && "right-full mr-2",
        side === "right" && "left-full ml-2",
        align === "center" && "left-1/2 transform -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";
