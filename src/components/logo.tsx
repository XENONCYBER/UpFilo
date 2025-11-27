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
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" style={{ stopColor: "#5865F2", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#00A8E8", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <path
        d="M 30 35 Q 30 85 50 85 Q 70 85 70 35 L 60 35 Q 60 75 50 75 Q 40 75 40 35 Z"
        fill="url(#upfilo-gradient)"
      />
      <circle cx="75" cy="30" r="7" fill="url(#upfilo-gradient)" />
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
