"use client";

import { cn } from "@/lib/utils";

export function YaaLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { w: 28, h: 28, text: "text-lg" },
    md: { w: 36, h: 36, text: "text-xl" },
    lg: { w: 44, h: 44, text: "text-2xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <div className="relative">
        <svg
          width={dims.w}
          height={dims.h}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="yaa-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F8A4B" />
              <stop offset="1" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="yaa-grad-orange" x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7931A" />
              <stop offset="1" stopColor="#FFB347" />
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="10" fill="url(#yaa-grad)" />
          <path
            d="M11 9 L18 19 L25 9"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 19 L18 27"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="28" cy="9" r="3.2" fill="url(#yaa-grad-orange)" />
        </svg>
      </div>
      <span
        className={cn(
          "font-display font-extrabold tracking-tight leading-none",
          dims.text
        )}
      >
        <span className="text-yaa-green">Y</span>
        <span className="text-yaa-orange">A</span>
        <span className="text-yaa-green">A</span>
      </span>
    </div>
  );
}
