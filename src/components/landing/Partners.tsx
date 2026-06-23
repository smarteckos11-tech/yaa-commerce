"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { BRAND_LOGOS } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Partners() {
  // Duplicate for marquee
  const doubled = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <section className="relative py-14 lg:py-16 border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="flex flex-col items-center text-center mb-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Nos partenaires de confiance
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-yaa-green" />
            Sécurisé · Protection 100% de vos données
          </div>
        </motion.div>

        {/* Marquee */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex gap-4 sm:gap-6 animate-marquee w-max">
            {doubled.map((partner, i) => (
              <PartnerLogo key={`${partner.name}-${i}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({
  partner,
}: {
  partner: { name: string; src: string; type: string };
}) {
  return (
    <div className="flex-shrink-0 h-16 px-5 rounded-xl bg-white border border-slate-100 shadow-soft flex items-center justify-center gap-2.5 min-w-[180px] hover:border-yaa-green/30 hover:shadow-premium transition-all">
      {/* Logo image — constrained, contain to preserve aspect ratio */}
      <img
        src={partner.src}
        alt={`Logo officiel ${partner.name}`}
        className="h-9 w-auto object-contain"
        loading="lazy"
        onError={(e) => {
          // Hide on error, fallback handled by parent layout
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}
