"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Footprints,
  Plug,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<string, LucideIcon> = {
  ShoppingBag,
  Footprints,
  Plug,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
};

/**
 * Showcase grid of vendor product categories.
 * Used inside Slide 1 (ambitions) as a floating "boutique" card.
 */
export function ProductsShowcase({
  className = "",
  variant = "grid",
}: {
  className?: string;
  variant?: "grid" | "row";
}) {
  const items = variant === "row" ? PRODUCT_CATEGORIES.slice(0, 4) : PRODUCT_CATEGORIES;

  return (
    <div className={className}>
      <div
        className={
          variant === "grid"
            ? "grid grid-cols-3 gap-2"
            : "grid grid-cols-2 gap-1.5"
        }
      >
        {items.map((p, i) => (
          <ProductChip key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProductChip({
  product,
  index,
}: {
  product: ProductCategory;
  index: number;
}) {
  const Icon = ICONS[product.icon] ?? ShoppingBag;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.6 + index * 0.08 }}
      whileHover={{ y: -2, scale: 1.04 }}
      className="group relative rounded-lg overflow-hidden bg-white border border-slate-100 hover:border-yaa-green/30 hover:shadow-soft transition-all cursor-pointer"
    >
      {/* Product image area — gradient + emoji */}
      <div
        className={`aspect-square bg-gradient-to-br ${product.gradient} flex items-center justify-center text-2xl relative overflow-hidden`}
      >
        <span className="drop-shadow-sm">{product.emoji}</span>
        {/* Subtle shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
      </div>
      {/* Info */}
      <div className="p-1.5">
        <p className="text-[9px] font-semibold text-slate-900 leading-tight truncate">
          {product.label}
        </p>
        <p className="text-[10px] font-bold text-yaa-green leading-tight">
          {product.samplePrice}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Compact "vendor boutique" card used as a floating element.
 * Shows that YAA supports many vendor types.
 */
export function VendorBoutiqueCard({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="glass-card rounded-2xl p-3.5 w-[230px]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-yaa-green flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs font-semibold text-slate-900">Boutique YAA</p>
          </div>
          <span className="text-[9px] text-yaa-green font-bold bg-yaa-green-soft px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PRODUCT_CATEGORIES.slice(0, 6).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
              className="aspect-square rounded-md overflow-hidden border border-slate-100 hover:border-yaa-green/30 transition-colors"
            >
              <div
                className={`w-full h-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-base`}
              >
                {p.emoji}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">6 catégories</p>
          <p className="text-[10px] font-bold text-slate-900">+248 produits</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Stylized Côte d'Ivoire map with delivery routes from Abidjan
 * to interior cities. Routes animate (moving dots = deliveries).
 */
export function CoteDIvoireMap({ className }: { className?: string }) {
  // Routes from Abidjan to interior cities
  const routes = [
    { from: { x: 38, y: 78 }, to: { x: 42, y: 58 }, color: "#F7931A" }, // Abidjan → Yamoussoukro
    { from: { x: 42, y: 58 }, to: { x: 48, y: 42 }, color: "#0F8A4B" }, // Yam → Bouaké
    { from: { x: 48, y: 42 }, to: { x: 52, y: 18 }, color: "#F7931A" }, // Bouaké → Korhogo
    { from: { x: 38, y: 78 }, to: { x: 18, y: 75 }, color: "#0F8A4B" }, // Abidjan → San-Pédro
    { from: { x: 38, y: 78 }, to: { x: 28, y: 65 }, color: "#F7931A" }, // Abidjan → Gagnoa
    { from: { x: 28, y: 65 }, to: { x: 22, y: 55 }, color: "#0F8A4B" }, // Gagnoa → Daloa
    { from: { x: 22, y: 55 }, to: { x: 12, y: 42 }, color: "#F7931A" }, // Daloa → Man
  ];
  const cities = [
    { name: "Abidjan", x: 38, y: 78, hub: true, time: "2h" },
    { name: "Yamoussoukro", x: 42, y: 58, hub: true, time: "6h" },
    { name: "Bouaké", x: 48, y: 42, hub: true, time: "8h" },
    { name: "San-Pédro", x: 18, y: 75, hub: true, time: "12h" },
    { name: "Daloa", x: 22, y: 55, hub: false, time: "10h" },
    { name: "Korhogo", x: 52, y: 18, hub: false, time: "18h" },
    { name: "Man", x: 12, y: 42, hub: false, time: "14h" },
    { name: "Gagnoa", x: 28, y: 65, hub: false, time: "10h" },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="ci-fill" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F8A4B" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#16A34A" stopOpacity="0.10" />
          <stop offset="1" stopColor="#F7931A" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="ci-stroke" x1="0" y1="0" x2="100" y2="100">
          <stop stopColor="#0F8A4B" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
        <radialGradient id="ci-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#16A34A" stopOpacity="0.3" />
          <stop offset="1" stopColor="#16A34A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow halo */}
      <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#ci-glow)" />

      {/* Stylized Côte d'Ivoire silhouette */}
      <path
        d="M30 18
           L 40 14
           L 52 16
           L 60 22
           L 60 30
           L 58 38
           L 60 46
           L 60 54
           L 62 62
           L 56 72
           L 50 80
           L 42 84
           L 32 80
           L 22 75
           L 12 65
           L 8 55
           L 10 45
           L 14 35
           L 20 26
           L 26 20
           Z"
        fill="url(#ci-fill)"
        stroke="url(#ci-stroke)"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />

      {/* Routes */}
      {routes.map((r, i) => (
        <g key={i}>
          <line
            x1={r.from.x}
            y1={r.from.y}
            x2={r.to.x}
            y2={r.to.y}
            stroke={r.color}
            strokeWidth="0.6"
            strokeDasharray="1.5 1"
            strokeOpacity="0.65"
          />
          {/* Moving delivery dot */}
          <motion.circle
            r="0.8"
            fill={r.color}
            initial={{ cx: r.from.x, cy: r.from.y }}
            animate={{ cx: [r.from.x, r.to.x], cy: [r.from.y, r.to.y] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        </g>
      ))}

      {/* City markers */}
      {cities.map((city, i) => (
        <g key={city.name}>
          {city.hub && (
            <motion.circle
              cx={city.x}
              cy={city.y}
              r="2.5"
              fill="none"
              stroke="#F7931A"
              strokeWidth="0.4"
              animate={{ scale: [0.8, 2.5, 2.5], opacity: [0.7, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
              style={{ transformOrigin: `${city.x}px ${city.y}px` }}
            />
          )}
          <circle
            cx={city.x}
            cy={city.y}
            r={city.hub ? 1.4 : 0.9}
            fill={city.hub ? "#F7931A" : "#0F8A4B"}
          />
          <circle cx={city.x} cy={city.y} r="0.4" fill="white" />
          {city.hub && (
            <text
              x={city.x + 2}
              y={city.y + 0.8}
              fill="#0F172A"
              fontSize="2.5"
              fontWeight="bold"
              opacity="0.8"
            >
              {city.name}
            </text>
          )}
          {city.hub && (
            <text
              x={city.x + 2}
              y={city.y + 3.5}
              fill="#0F8A4B"
              fontSize="2"
              fontWeight="bold"
              opacity="0.9"
            >
              {city.time}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
