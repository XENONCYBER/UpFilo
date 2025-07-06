"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface HintProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const Hint = ({
  label,
  children,
  side = "top",
  align = "center",
}: HintProps) => {
  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          "absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
          "whitespace-nowrap",
          side === "top" && "bottom-full mb-2",
          side === "bottom" && "top-full mt-2",
          side === "left" && "right-full mr-2",
          side === "right" && "left-full ml-2",
          align === "center" && "left-1/2 transform -translate-x-1/2",
          align === "start" && "left-0",
          align === "end" && "right-0"
        )}
      >
        {label}
      </div>
    </div>
  );
};
