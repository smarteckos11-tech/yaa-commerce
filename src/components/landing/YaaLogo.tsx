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

  // Unique gradient IDs per size to avoid SVG def collisions when multiple logos rendered
  const uid = `yaa-${size}`;

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
            <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F8A4B" />
              <stop offset="1" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id={`${uid}-orange`} x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7931A" />
              <stop offset="1" stopColor="#FFB347" />
            </linearGradient>
          </defs>
          {/* Rounded square background */}
          <rect width="36" height="36" rx="10" fill={`url(#${uid}-grad)`} />

          {/* Simple shopping cart — classic boutique cart icon */}
          {/* Cart handle (left arm going up) */}
          <path
            d="M7 9 L11 9 L13.5 23"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Cart basket body (trapezoidal) */}
          <path
            d="M13 13 L29 13 L27 22 L15 22 Z"
            fill={`url(#${uid}-orange)`}
            stroke="white"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Cart wheels */}
          <circle cx="16" cy="26" r="1.6" fill="white" />
          <circle cx="26" cy="26" r="1.6" fill="white" />
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
