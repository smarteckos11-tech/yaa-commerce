"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { PARTNERS } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Partners() {
  // Duplicate for marquee
  const doubled = [...PARTNERS, ...PARTNERS];

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
  partner: { name: string; type: string };
}) {
  return (
    <div className="flex-shrink-0 h-14 px-6 rounded-xl bg-white border border-slate-100 shadow-soft flex items-center justify-center gap-2.5 min-w-[180px]">
      <PartnerMark name={partner.name} />
      <span className="font-display font-bold text-base text-slate-800 whitespace-nowrap">
        {partner.name}
      </span>
    </div>
  );
}

function PartnerMark({ name }: { name: string }) {
  // Brand-colored mark for each partner
  const map: Record<string, { bg: string; text: string; symbol: string }> = {
    Wave: { bg: "bg-sky-500", text: "text-white", symbol: "W" },
    "Orange Money": { bg: "bg-orange-500", text: "text-white", symbol: "O" },
    "MTN Mobile Money": { bg: "bg-yellow-400", text: "text-slate-900", symbol: "M" },
    "Moov Money": { bg: "bg-blue-600", text: "text-white", symbol: "M" },
    CinetPay: { bg: "bg-purple-600", text: "text-white", symbol: "C" },
    "WhatsApp Business": { bg: "bg-[#25D366]", text: "text-white", symbol: "Wa" },
    Yango: { bg: "bg-red-500", text: "text-white", symbol: "Y" },
  };
  const c = map[name] ?? { bg: "bg-slate-700", text: "text-white", symbol: "?" };
  return (
    <div
      className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-extrabold text-sm`}
    >
      {c.symbol}
    </div>
  );
}
