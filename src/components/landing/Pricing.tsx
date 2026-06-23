"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Zap } from "lucide-react";
import { PRICING_PLANS, type PricingPlan } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Pricing() {
  return (
    <section
      id="tarifs"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh-light opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-yaa-green/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yaa-green-soft text-yaa-green text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5" />
            Tarifs transparents · Sans engagement
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
            className="mt-4 font-display font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl lg:text-5xl text-balance"
          >
            Un tarif pour chaque ambition
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
            className="mt-5 text-lg text-slate-600 text-pretty"
          >
            Commencez gratuitement. Évoluez quand vous êtes prêt. Annulez à tout
            moment. Des prix pensés pour les réalités africaines, en FCFA.
          </motion.p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 max-w-6xl mx-auto items-stretch">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-yaa-green" />
            Paiement Mobile Money accepté
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-yaa-green" />
            Annulation en 1 clic
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-yaa-green" />
            Sans frais cachés
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-yaa-green" />
            Support en français & anglais
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  index,
}: {
  plan: PricingPlan;
  index: number;
}) {
  const isHighlight = plan.highlight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: easeOut, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className={cn(
        "relative rounded-3xl p-7 lg:p-8 flex flex-col",
        isHighlight
          ? "bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-premium ring-1 ring-slate-900/10 lg:scale-[1.03]"
          : "bg-white border border-slate-200 shadow-soft hover:shadow-premium hover:border-slate-300 transition-all"
      )}
    >
      {/* Highlight glow */}
      {isHighlight && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-yaa-green to-transparent" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yaa-orange text-white text-[10px] font-bold uppercase tracking-wider shadow-glow-orange">
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div className="flex items-center gap-2">
        <h3
          className={cn(
            "font-display font-bold text-xl",
            isHighlight ? "text-white" : "text-slate-900"
          )}
        >
          {plan.name}
        </h3>
        {isHighlight && (
          <Sparkles className="w-4 h-4 text-yaa-orange" />
        )}
      </div>
      <p
        className={cn(
          "mt-1.5 text-sm",
          isHighlight ? "text-slate-300" : "text-slate-500"
        )}
      >
        {plan.tagline}
      </p>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-4xl lg:text-5xl",
            isHighlight ? "text-white" : "text-slate-900"
          )}
        >
          {plan.price.toLocaleString("fr-FR")}
        </span>
        <span
          className={cn(
            "text-sm font-semibold",
            isHighlight ? "text-slate-300" : "text-slate-500"
          )}
        >
          FCFA / mois
        </span>
      </div>

      {/* CTA */}
      <a
        href="#"
        className={cn(
          "btn-shine group mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all",
          isHighlight
            ? "bg-yaa-orange hover:bg-yaa-orange-dark text-white shadow-glow-orange"
            : "bg-slate-900 hover:bg-slate-800 text-white"
        )}
      >
        {plan.cta}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </a>

      {/* Divider */}
      <div
        className={cn(
          "my-6 h-px",
          isHighlight ? "bg-white/10" : "bg-slate-100"
        )}
      />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center",
                isHighlight ? "bg-yaa-green" : "bg-yaa-green-soft"
              )}
            >
              <Check
                className={cn(
                  "w-2.5 h-2.5",
                  isHighlight ? "text-white" : "text-yaa-green"
                )}
                strokeWidth={3}
              />
            </span>
            <span
              className={cn(
                isHighlight ? "text-slate-200" : "text-slate-700"
              )}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
