import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
}

// SVG Logo Component
export const LogoIcon = ({
  size = 30,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient
          id="upfilo-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#0969da", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#2da44e", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <g fill="url(#upfilo-gradient)">
        <rect
          x="15"
          y="15"
          width="55"
          height="55"
          rx="18"
          ry="18"
          opacity="0.85"
        />
        <rect
          x="35"
          y="35"
          width="55"
          height="55"
          rx="18"
          ry="18"
          opacity="0.85"
        />
        <circle cx="52.5" cy="52.5" r="14" />
      </g>
    </svg>
  );
};

export const Logo = ({
  size = 30,
  showText = true,
  href = "/",
  className,
  textClassName,
}: LogoProps) => {
  const content = (
    <div
      className={cn(
        "hover:opacity-75 transition items-center gap-x-2 flex",
        className
      )}
    >
      <LogoIcon size={size} />
      {showText && (
        <p
          className={cn(
            "text-lg text-neomorphic-text font-semibold pb-1",
            textClassName
          )}
        >
          UpFilo
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
