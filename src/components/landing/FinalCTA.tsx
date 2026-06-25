"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Particles } from "./Particles";
import { AfricaMap } from "./AfricaMap";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Premium dark green background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yaa-green-deep via-yaa-green-dark to-slate-950" />

      {/* Decorative layers */}
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <AfricaMap className="absolute -right-32 top-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-30" />
      <Particles count={30} className="absolute inset-0" color="#F7931A" />
      <Particles count={20} className="absolute inset-0" color="#22C55E" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-yaa-green/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-yaa-orange" />
          Rejoignez le mouvement
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
          className="mt-5 font-display font-extrabold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl text-balance leading-tight"
        >
          Rejoignez la communauté des marchands
          <br className="hidden sm:block" /> qui réussissent avec{" "}
          <span className="text-gradient-orange">YAA</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
          className="mt-5 text-lg text-white/80 max-w-2xl mx-auto text-pretty"
        >
          Lancez votre boutique aujourd'hui. Vos premières commandes demain.
          Votre succès, notre mission.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="/signup"
            className="btn-shine group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-900 bg-white hover:bg-slate-50 rounded-xl shadow-2xl transition-all"
          >
            Créer ma boutique gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-xl transition-all"
          >
            Parler à un expert
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70"
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yaa-orange" />
            0 FCFA pour démarrer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yaa-orange" />
            Sans engagement
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-yaa-orange" />
            Configuration en 5 minutes
          </span>
        </motion.div>
      </div>
    </section>
  );
}
