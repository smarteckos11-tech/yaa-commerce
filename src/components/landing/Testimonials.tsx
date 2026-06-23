"use client";

import { motion } from "framer-motion";
import { Star, Quote, MapPin, TrendingUp } from "lucide-react";
import { TESTIMONIALS } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Testimonials() {
  return (
    <section
      id="temoignages"
      className="relative py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yaa-orange-soft text-yaa-orange text-xs font-semibold"
          >
            <Star className="w-3.5 h-3.5 fill-yaa-orange" />
            Histoires de marchands réels
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
            className="mt-4 font-display font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl lg:text-5xl text-balance"
          >
            Des milliers d'histoires.
            <br className="hidden sm:block" />{" "}
            <span className="text-gradient-orange">Un même succès : YAA</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
            className="mt-5 text-lg text-slate-600 text-pretty"
          >
            Ils vendent. Ils grandissent. Ils inspirent. Et vous, quelle sera
            votre histoire ?
          </motion.p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: easeOut, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl bg-white border border-slate-200 hover:border-yaa-green/30 p-5 lg:p-6 shadow-soft hover:shadow-premium transition-all overflow-hidden"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-100 group-hover:text-yaa-green-soft transition-colors" />

              {/* Photo */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white shadow-soft mb-4">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute -bottom-0.5 -right-0.5 text-base">
                  {t.flag}
                </span>
              </div>

              {/* Name & business */}
              <h3 className="font-display font-bold text-slate-900 text-base">
                {t.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {t.city}, {t.country}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.business}</p>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mt-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-slate-700">
                  5.0
                </span>
              </div>

              {/* Quote */}
              <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">
                « {t.quote} »
              </p>

              {/* Result badge */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yaa-green-soft text-yaa-green text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t.result}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="flex -space-x-2">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-slate-100"
                >
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">
                Plus de 10 000 marchands
              </p>
              <p className="text-xs text-slate-500">
                vendent déjà sur WhatsApp avec YAA
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
