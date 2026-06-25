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

          {/* Stylized "Y" — formed by shopping cart handles */}
          <path
            d="M10 9 L18 19 L26 9"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 19 L18 22"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Shopping cart body — classic boutique cart */}
          <path
            d="M14 22 L26 22 L24.5 28 L15.5 28 Z"
            fill={`url(#${uid}-orange)`}
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Cart wheels */}
          <circle cx="16.5" cy="30.5" r="1.4" fill="white" />
          <circle cx="23.5" cy="30.5" r="1.4" fill="white" />

          {/* Small "growth spark" dot top-right (kept for brand identity) */}
          <circle cx="29" cy="8" r="2.4" fill={`url(#${uid}-orange)`} />
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
