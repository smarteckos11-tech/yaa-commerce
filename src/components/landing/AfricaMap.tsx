"use client";

import { motion } from "framer-motion";

/**
 * Stylized, glowing African continent with pulsing city markers.
 * Not a precise geographic map — it's a decorative brand asset.
 */
export function AfricaMap({ className }: { className?: string }) {
  // Approximate city positions on the stylized map (percentage of viewBox)
  const cities = [
    { name: "Dakar", x: 80, y: 110, delay: 0 },
    { name: "Abidjan", x: 140, y: 175, delay: 0.4 },
    { name: "Accra", x: 175, y: 185, delay: 0.8 },
    { name: "Lagos", x: 215, y: 200, delay: 1.2 },
    { name: "Yaoundé", x: 250, y: 215, delay: 1.6 },
    { name: "Kinshasa", x: 250, y: 270, delay: 2.0 },
    { name: "Nairobi", x: 330, y: 250, delay: 2.4 },
    { name: "Addis Ababa", x: 350, y: 215, delay: 2.8 },
    { name: "Le Caire", x: 290, y: 70, delay: 3.2 },
    { name: "Casablanca", x: 130, y: 80, delay: 3.6 },
    { name: "Johannesburg", x: 290, y: 360, delay: 4.0 },
    { name: "Kampala", x: 315, y: 240, delay: 4.4 },
  ];

  return (
    <svg
      viewBox="0 0 460 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="africa-fill" x1="0" y1="0" x2="460" y2="460" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F8A4B" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#16A34A" stopOpacity="0.10" />
          <stop offset="1" stopColor="#F7931A" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="africa-stroke" x1="0" y1="0" x2="460" y2="460" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F8A4B" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
        <radialGradient id="africa-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#16A34A" stopOpacity="0.35" />
          <stop offset="1" stopColor="#16A34A" stopOpacity="0" />
        </radialGradient>
        <filter id="city-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow halo */}
      <ellipse cx="230" cy="230" rx="220" ry="220" fill="url(#africa-glow)" />

      {/* Stylized Africa silhouette */}
      <path
        d="M170 50
           C 200 45, 230 50, 260 55
           L 305 60
           C 320 60, 330 70, 332 85
           L 340 110
           C 348 130, 350 145, 345 165
           L 348 180
           C 360 195, 365 210, 360 230
           L 350 250
           C 348 270, 345 285, 340 300
           L 335 320
           C 330 340, 325 355, 315 370
           L 300 385
           C 285 395, 270 395, 260 385
           L 245 370
           C 235 360, 230 365, 230 380
           L 235 395
           C 240 405, 240 415, 230 415
           L 215 410
           C 205 405, 200 395, 200 380
           L 195 360
           C 190 340, 185 320, 180 305
           L 170 285
           C 165 270, 165 255, 170 240
           L 175 225
           C 170 215, 165 205, 160 195
           L 150 175
           C 140 165, 135 155, 140 145
           L 145 130
           C 150 115, 155 100, 165 85
           L 170 65
           Z"
        fill="url(#africa-fill)"
        stroke="url(#africa-stroke)"
        strokeWidth="1.5"
        strokeOpacity="0.55"
      />

      {/* Inner dotted texture */}
      <g opacity="0.45">
        {Array.from({ length: 40 }).map((_, i) => {
          const x = 160 + (i % 8) * 24 + (Math.floor(i / 8) % 2) * 12;
          const y = 90 + Math.floor(i / 8) * 40;
          if (x > 350 || y > 380) return null;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.2"
              fill="#0F8A4B"
              opacity={0.4}
            />
          );
        })}
      </g>

      {/* Connection lines between cities */}
      <g stroke="#0F8A4B" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2 3" fill="none">
        <line x1="80" y1="110" x2="140" y2="175" />
        <line x1="140" y1="175" x2="175" y2="185" />
        <line x1="175" y1="185" x2="215" y2="200" />
        <line x1="215" y1="200" x2="250" y2="215" />
        <line x1="250" y1="215" x2="250" y2="270" />
        <line x1="250" y1="270" x2="315" y2="240" />
        <line x1="315" y1="240" x2="330" y2="250" />
        <line x1="250" y1="215" x2="350" y2="215" />
        <line x1="290" y1="70" x2="350" y2="215" />
        <line x1="130" y1="80" x2="80" y2="110" />
        <line x1="290" y1="360" x2="250" y2="270" />
      </g>

      {/* City markers with pulsing rings */}
      {cities.map((city) => (
        <g key={city.name}>
          <motion.circle
            cx={city.x}
            cy={city.y}
            r="6"
            fill="none"
            stroke="#F7931A"
            strokeWidth="1.4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 2.4, 2.4],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              delay: city.delay,
              ease: "easeOut",
            }}
            style={{ transformOrigin: `${city.x}px ${city.y}px` }}
          />
          <motion.circle
            cx={city.x}
            cy={city.y}
            r="3.4"
            fill="#F7931A"
            filter="url(#city-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: city.delay }}
          />
          <circle cx={city.x} cy={city.y} r="1.6" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}
