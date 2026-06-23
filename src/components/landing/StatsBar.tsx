"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  Users,
  Globe2,
  Activity,
  Star,
} from "lucide-react";
import { Counter } from "./Counter";
import { STATS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<string, React.ElementType> = {
  green: ShoppingCart,
  orange: Users,
  dark: Globe2,
  purple: Activity,
  gold: Star,
};

const STYLES: Record<string, { icon: string; text: string }> = {
  green: { icon: "bg-yaa-green-soft text-yaa-green", text: "text-yaa-green" },
  orange: { icon: "bg-yaa-orange-soft text-yaa-orange", text: "text-yaa-orange" },
  dark: { icon: "bg-slate-100 text-slate-900", text: "text-slate-900" },
  purple: { icon: "bg-purple-100 text-purple-600", text: "text-purple-600" },
  gold: { icon: "bg-amber-100 text-amber-600", text: "text-amber-600" },
};

export function StatsBar() {
  return (
    <section className="relative py-16 lg:py-20 bg-slate-950 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-yaa-green/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-yaa-orange/20 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Des chiffres qui parlent
          </h2>
          <p className="mt-2 text-slate-400 max-w-xl mx-auto">
            La confiance de milliers de marchands africains, mesurée chaque jour.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {STATS.map((stat, i) => {
            const Icon = ICONS[stat.accent];
            const style = STYLES[stat.accent];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: easeOut, delay: i * 0.08 }}
                className="relative group"
              >
                <div className="relative h-full rounded-2xl p-5 lg:p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.08]">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
                      style.icon
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div
                    className={cn(
                      "font-display font-extrabold text-3xl lg:text-4xl tracking-tight",
                      style.text
                    )}
                  >
                    <Counter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.value % 1 !== 0 ? 1 : 0}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-400 leading-snug">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
