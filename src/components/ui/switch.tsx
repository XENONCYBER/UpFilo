"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "default" | "sm" | "lg";
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size = "default", checked, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label
        className={cn(
          "relative inline-flex cursor-pointer items-center",
          props.disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "glass-surface relative rounded-full border-2 border-transparent backdrop-blur-xl shadow-glass transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 peer-unchecked:bg-white/20 dark:peer-unchecked:bg-black/30",
            size === "sm" && "h-4 w-7",
            size === "default" && "h-5 w-9",
            size === "lg" && "h-6 w-11"
          )}
        >
          <div
            className={cn(
              "absolute bg-white rounded-full shadow-glass transition-transform duration-200",
              isChecked ? "translate-x-4" : "translate-x-0",
              size === "sm" && "h-3 w-3 top-0.5 left-0.5",
              size === "default" && "h-4 w-4 top-0.5 left-0.5",
              size === "lg" && "h-5 w-5 top-0.5 left-0.5"
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
