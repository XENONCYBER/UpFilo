import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "glass-button bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white shadow-glass hover:from-blue-600/90 hover:to-purple-700/90 hover:shadow-glass-hover backdrop-blur-sm",
        destructive:
          "glass-button bg-gradient-to-r from-red-500/90 to-pink-600/90 text-white shadow-glass hover:from-red-600/90 hover:to-pink-700/90 hover:shadow-glass-hover backdrop-blur-sm",
        outline:
          "glass-surface border border-white/20 dark:border-white/20 bg-white/50 dark:bg-black/30 backdrop-blur-xl shadow-glass hover:bg-white/60 dark:hover:bg-black/40 hover:shadow-glass-hover",
        secondary:
          "glass-surface bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-glass hover:bg-white/50 dark:hover:bg-black/30 hover:shadow-glass-hover",
        ghost:
          "hover:bg-white/20 dark:hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
