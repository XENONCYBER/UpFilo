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
            "relative rounded-full border transition-all duration-200 ease-in-out",
            "bg-white/10 backdrop-blur-sm border-white/20",
            "peer-checked:bg-blue-500 peer-checked:border-blue-500",
            "peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-focus:ring-offset-2 peer-focus:ring-offset-transparent",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            size === "sm" && "h-4 w-7",
            size === "default" && "h-5 w-9",
            size === "lg" && "h-6 w-11"
          )}
        >
          <div
            className={cn(
              "absolute bg-white rounded-full shadow-lg transition-all duration-200 ease-in-out",
              "border border-white/20",
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
