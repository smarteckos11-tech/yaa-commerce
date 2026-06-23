"use client";

import { motion } from "framer-motion";
import {
  Store,
  Wallet,
  MessageCircle,
  Truck,
  Sparkles,
  Megaphone,
  BarChart3,
  Boxes,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { FEATURES, type Feature } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<string, LucideIcon> = {
  Store,
  Wallet,
  MessageCircle,
  Truck,
  Sparkles,
  Megaphone,
  BarChart3,
  Boxes,
};

export function Features() {
  return (
    <section id="fonctionnalites" className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-yaa-green/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yaa-green-soft text-yaa-green text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tout ce dont vous avez besoin
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
            className="mt-4 font-display font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl lg:text-5xl text-balance"
          >
            Une plateforme complète,
            <br className="hidden sm:block" />{" "}
            <span className="text-gradient-green">pensée pour l'Afrique</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
            className="mt-5 text-lg text-slate-600 text-pretty"
          >
            De la création de votre boutique à la livraison du dernier colis,
            YAA unifie toutes les briques du e-commerce africain dans une
            expérience premium, fluide et puissante.
          </motion.p>
        </div>

        {/* Grid of features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = ICONS[feature.icon] ?? Store;
  const isGreen = feature.accent === "green";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: easeOut, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative h-full rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 lg:p-6 shadow-soft hover:shadow-premium transition-all overflow-hidden"
    >
      {/* Hover gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
          isGreen
            ? "bg-gradient-to-br from-yaa-green/[0.04] to-transparent"
            : "bg-gradient-to-br from-yaa-orange/[0.04] to-transparent"
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110",
          isGreen
            ? "bg-yaa-green-soft text-yaa-green"
            : "bg-yaa-orange-soft text-yaa-orange"
        )}
      >
        <Icon className="w-6 h-6" />
        {/* Pulse dot */}
        <span
          className={cn(
            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse-soft",
            isGreen ? "bg-yaa-green" : "bg-yaa-orange"
          )}
        />
      </div>

      {/* Title & description */}
      <h3 className="relative font-display font-bold text-lg text-slate-900 mb-2 leading-tight">
        {feature.title}
      </h3>
      <p className="relative text-sm text-slate-600 leading-relaxed">
        {feature.description}
      </p>

      {/* Mini illustration per feature */}
      <div className="relative mt-5 h-20 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
        <FeatureIllustration type={feature.illustration} accent={feature.accent} />
      </div>

      {/* "En savoir plus" link */}
      <div
        className={cn(
          "relative mt-4 inline-flex items-center gap-1 text-xs font-semibold transition-colors",
          isGreen ? "text-yaa-green" : "text-yaa-orange"
        )}
      >
        En savoir plus
        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </motion.div>
  );
}

/* ============================================================
   Mini SVG illustrations for each feature card
   ============================================================ */
function FeatureIllustration({
  type,
  accent,
}: {
  type: string;
  accent: "green" | "orange";
}) {
  const color = accent === "green" ? "#0F8A4B" : "#F7931A";
  const softColor = accent === "green" ? "#E8F5EE" : "#FFF3E0";

  switch (type) {
    case "store":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="20" width="80" height="50" rx="6" fill={softColor} />
          <rect x="30" y="30" width="60" height="8" rx="2" fill={color} opacity="0.6" />
          <rect x="30" y="44" width="40" height="6" rx="2" fill={color} opacity="0.3" />
          <rect x="30" y="56" width="50" height="6" rx="2" fill={color} opacity="0.3" />
          <rect x="110" y="20" width="60" height="50" rx="6" fill="white" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="140" cy="40" r="8" fill={color} opacity="0.6" />
          <rect x="125" y="55" width="30" height="4" rx="2" fill={color} opacity="0.3" />
          <rect x="180" y="20" width="80" height="50" rx="6" fill={softColor} />
          <path d="M195 35 L210 50 L245 30" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "wallet":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="22" width="60" height="40" rx="6" fill={softColor} />
          <rect x="28" y="30" width="44" height="24" rx="3" fill={color} opacity="0.7" />
          <circle cx="50" cy="42" r="5" fill="white" />
          <rect x="90" y="22" width="60" height="40" rx="6" fill="white" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
          <rect x="98" y="30" width="44" height="6" rx="2" fill={color} opacity="0.6" />
          <rect x="98" y="42" width="30" height="4" rx="2" fill={color} opacity="0.3" />
          <rect x="160" y="22" width="60" height="40" rx="6" fill={softColor} />
          <text x="190" y="48" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">FCFA</text>
          <rect x="230" y="22" width="30" height="40" rx="6" fill={color} opacity="0.2" />
          <path d="M245 32 L245 52 M237 40 L253 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="15" width="140" height="50" rx="10" fill="#25D366" opacity="0.1" />
          <rect x="28" y="22" width="100" height="8" rx="3" fill="#25D366" opacity="0.5" />
          <rect x="28" y="36" width="80" height="6" rx="2" fill="#25D366" opacity="0.3" />
          <rect x="28" y="48" width="60" height="6" rx="2" fill="#25D366" opacity="0.3" />
          <circle cx="170" cy="40" r="18" fill="#25D366" />
          <path d="M162 38 Q170 30 178 38 Q180 44 174 48 L176 52 L171 49 Q165 49 162 44 Z" fill="white" />
          <rect x="195" y="22" width="70" height="36" rx="8" fill={softColor} />
          <circle cx="230" cy="40" r="8" fill={color} opacity="0.6" />
        </svg>
      );

    case "delivery":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="25" width="50" height="35" rx="4" fill={softColor} />
          <rect x="25" y="30" width="40" height="6" rx="2" fill={color} opacity="0.5" />
          <rect x="25" y="40" width="40" height="6" rx="2" fill={color} opacity="0.3" />
          <path d="M70 35 L100 35 L115 45 L115 60 L70 60 Z" fill={color} opacity="0.7" />
          <rect x="78" y="40" width="22" height="12" rx="1" fill="white" opacity="0.8" />
          <circle cx="80" cy="62" r="5" fill="#1e293b" />
          <circle cx="105" cy="62" r="5" fill="#1e293b" />
          <circle cx="80" cy="62" r="2" fill="#94a3b8" />
          <circle cx="105" cy="62" r="2" fill="#94a3b8" />
          <path d="M130 40 L160 40" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
          <path d="M155 35 L162 40 L155 45" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="175" y="25" width="80" height="35" rx="4" fill={softColor} />
          <circle cx="215" cy="42" r="10" fill={color} opacity="0.6" />
          <path d="M210 42 L214 46 L220 38" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "ai":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="20" width="80" height="50" rx="8" fill={softColor} />
          <circle cx="40" cy="35" r="3" fill={color} />
          <circle cx="55" cy="35" r="3" fill={color} opacity="0.7" />
          <circle cx="70" cy="35" r="3" fill={color} opacity="0.4" />
          <circle cx="85" cy="35" r="3" fill={color} opacity="0.2" />
          <rect x="30" y="48" width="60" height="4" rx="2" fill={color} opacity="0.3" />
          <rect x="30" y="58" width="40" height="4" rx="2" fill={color} opacity="0.3" />
          <path d="M110 45 L130 45" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
          <path d="M125 40 L132 45 L125 50" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="20" width="120" height="50" rx="8" fill={color} opacity="0.15" />
          <text x="200" y="42" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">IA</text>
          <rect x="150" y="50" width="100" height="4" rx="2" fill={color} opacity="0.4" />
          <rect x="150" y="58" width="70" height="4" rx="2" fill={color} opacity="0.3" />
        </svg>
      );

    case "marketing":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="15" y="22" width="20" height="40" rx="3" fill={color} opacity="0.7" />
          <rect x="40" y="32" width="20" height="30" rx="3" fill={color} opacity="0.5" />
          <rect x="65" y="40" width="20" height="22" rx="3" fill={color} opacity="0.35" />
          <path d="M95 50 L120 30 L145 38 L170 25" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="120" cy="30" r="3" fill={color} />
          <circle cx="145" cy="38" r="3" fill={color} />
          <circle cx="170" cy="25" r="3" fill={color} />
          <rect x="185" y="22" width="80" height="40" rx="6" fill={softColor} />
          <circle cx="200" cy="42" r="6" fill={color} opacity="0.6" />
          <rect x="212" y="36" width="40" height="4" rx="2" fill={color} opacity="0.4" />
          <rect x="212" y="44" width="30" height="3" rx="1.5" fill={color} opacity="0.3" />
        </svg>
      );

    case "analytics":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="15" y="20" width="200" height="50" rx="6" fill={softColor} />
          <line x1="20" y1="60" x2="210" y2="60" stroke={color} strokeWidth="1" opacity="0.4" />
          <rect x="25" y="45" width="10" height="15" fill={color} opacity="0.5" />
          <rect x="45" y="38" width="10" height="22" fill={color} opacity="0.6" />
          <rect x="65" y="30" width="10" height="30" fill={color} opacity="0.75" />
          <rect x="85" y="35" width="10" height="25" fill={color} opacity="0.65" />
          <rect x="105" y="22" width="10" height="38" fill={color} />
          <rect x="125" y="28" width="10" height="32" fill={color} opacity="0.8" />
          <rect x="145" y="40" width="10" height="20" fill={color} opacity="0.5" />
          <path d="M25 50 L50 40 L75 30 L100 38 L125 25 L150 32 L175 22 L200 18" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="125" cy="25" r="3" fill={color} />
          <circle cx="200" cy="18" r="3" fill={color} />
          <rect x="225" y="22" width="50" height="20" rx="4" fill="white" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
          <text x="250" y="36" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">+32%</text>
        </svg>
      );

    case "stock":
      return (
        <svg viewBox="0 0 280 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="25" width="30" height="30" rx="3" fill={color} opacity="0.6" />
          <line x1="20" y1="35" x2="50" y2="35" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="35" y1="25" x2="35" y2="55" stroke="white" strokeWidth="1" opacity="0.6" />
          <rect x="55" y="25" width="30" height="30" rx="3" fill={color} opacity="0.5" />
          <line x1="55" y1="35" x2="85" y2="35" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="70" y1="25" x2="70" y2="55" stroke="white" strokeWidth="1" opacity="0.6" />
          <rect x="90" y="25" width="30" height="30" rx="3" fill={color} opacity="0.4" />
          <line x1="90" y1="35" x2="120" y2="35" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="105" y1="25" x2="105" y2="55" stroke="white" strokeWidth="1" opacity="0.6" />
          <rect x="140" y="20" width="120" height="40" rx="6" fill={softColor} />
          <text x="200" y="38" textAnchor="middle" fill={color} fontSize="9" fontWeight="bold">EN STOCK</text>
          <text x="200" y="52" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">248</text>
        </svg>
      );

    default:
      return null;
  }
}
