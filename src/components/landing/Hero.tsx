"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  MessageCircle,
  Wallet,
  Sparkles,
  Truck,
  Store,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { AfricaMap } from "./AfricaMap";
import { Particles } from "./Particles";
import { IMAGES } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 overflow-hidden bg-mesh-light">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-yaa-green/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-yaa-orange/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* ============= LEFT — Text ============= */}
          <div className="lg:col-span-6 xl:col-span-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-soft text-xs font-semibold text-slate-700"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yaa-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yaa-green" />
              </span>
              Déjà plus de 10 000 marchands conquis en Afrique
              <span className="text-amber-500 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
              className="mt-5 font-display font-extrabold tracking-tight text-slate-900 text-[2.6rem] sm:text-5xl lg:text-[3.4rem] xl:text-6xl leading-[1.05] text-balance"
            >
              L'Afrique avance,
              <br className="hidden sm:block" />{" "}
              vos{" "}
              <span className="relative inline-block">
                <span className="text-yaa-orange">ambitions</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="10"
                  viewBox="0 0 200 10"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 7C50 3 100 3 198 6"
                    stroke="#F7931A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              prennent vie avec{" "}
              <span className="text-gradient-green">YAA</span>.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl text-pretty"
            >
              De la première vente à l'expansion internationale, YAA accompagne
              chaque étape de votre réussite. Boutique en ligne, paiements
              Mobile Money, livraison, WhatsApp Business — tout, réunifié dans
              une seule plateforme premium.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#tarifs"
                className="btn-shine group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-yaa-green hover:bg-yaa-green-dark rounded-xl shadow-glow-green transition-all"
              >
                Créer ma boutique gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#dashboard"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yaa-green-soft text-yaa-green group-hover:bg-yaa-green group-hover:text-white transition-colors">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                Voir une démo
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.35 }}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-yaa-green" />
                0 FCFA pour démarrer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-yaa-green" />
                Sans engagement
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-yaa-green" />
                Configuration en 5 minutes
              </span>
            </motion.div>

            {/* Mini partner row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Paiements acceptés
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-700">
                <PartnerText name="Wave" className="text-sky-600" />
                <PartnerText name="Orange Money" className="text-orange-500" />
                <PartnerText name="MTN MoMo" className="text-yellow-500" />
                <PartnerText name="Moov Money" className="text-blue-600" />
                <PartnerText name="CinetPay" className="text-purple-600" />
              </div>
            </motion.div>
          </div>

          {/* ============= RIGHT — Composed visual ============= */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerText({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`font-display font-bold text-sm tracking-tight ${className}`}
    >
      {name}
    </span>
  );
}

/* ============================================================
   HERO VISUAL — composed scene:
   - Background: Africa map SVG with glowing cities
   - Foreground: photo of woman entrepreneur
   - Floating glass cards (sales, payment, order, testimonial)
   - Floating brand icons (WhatsApp, Wallet, Truck, Sparkles, etc.)
   - Particles
   ============================================================ */
function HeroVisual() {
  return (
    <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full">
      {/* Africa map background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <AfricaMap className="w-[110%] h-[110%] -translate-y-4 opacity-70" />
      </motion.div>

      {/* Particles overlay — desktop only */}
      <Particles
        count={28}
        className="absolute inset-0 pointer-events-none hidden sm:block"
        color="#0F8A4B"
      />
      <Particles
        count={12}
        className="absolute inset-0 pointer-events-none hidden sm:block"
        color="#F7931A"
      />

      {/* Glow behind photo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[380px] sm:w-[340px] sm:h-[440px] lg:w-[360px] rounded-full bg-gradient-to-b from-yaa-green/30 via-yaa-orange/15 to-transparent blur-3xl" />

      {/* Main photo — woman entrepreneur */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="relative w-[240px] sm:w-[300px] lg:w-[360px] aspect-[3/4] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-premium ring-1 ring-white/60">
          <img
            src={IMAGES.womanBoutique}
            alt="Entrepreneure africaine souriante dans sa boutique"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay for premium look */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
          {/* Bottom badge */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 flex items-center justify-between">
            <div className="glass-card rounded-xl px-3 py-1.5">
              <p className="text-[10px] font-medium text-slate-700">
                Amina · Yaoundé
              </p>
              <p className="text-xs font-bold text-yaa-green">
                1M FCFA / an
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== FLOATING GLASS CARDS ===== */}

      {/* 1. Sales stat card — top left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.7 }}
        className="absolute top-2 sm:top-8 left-0 sm:-left-4 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 w-[170px] sm:w-[210px]">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-slate-600">
                Ventes du mois
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-yaa-green bg-yaa-green-soft px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                +32%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-display text-slate-900">
              250 000{" "}
              <span className="text-xs sm:text-sm font-bold text-slate-500">FCFA</span>
            </p>
            <div className="mt-2 sm:mt-3 h-8 sm:h-10">
              <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0F8A4B" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#0F8A4B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4"
                  stroke="#0F8A4B"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4 L200 40 L0 40 Z"
                  fill="url(#spark-green)"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Payment received card — top right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.85 }}
        className="absolute top-6 sm:top-16 right-0 sm:-right-2 z-20"
      >
        <div className="animate-float-medium">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 w-[170px] sm:w-[210px]">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs sm:text-sm">
                W
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate">
                  Paiement reçu
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">Wave · il y a 2 min</p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yaa-green flex-shrink-0" />
            </div>
            <p className="mt-2 sm:mt-2.5 text-base sm:text-lg font-extrabold font-display text-slate-900">
              25 000 <span className="text-[10px] sm:text-xs text-slate-500">FCFA</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. New WhatsApp order card — bottom left — desktop only */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.0 }}
        className="hidden sm:block absolute bottom-8 lg:bottom-16 left-0 lg:-left-6 z-20"
      >
        <div className="animate-float-fast">
          <div className="glass-card rounded-2xl p-3.5 w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-900">
                Nouvelle commande WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                <Store className="w-4 h-4 text-yaa-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  Sac en cuir Premium
                </p>
                <p className="text-[10px] text-slate-500">x1 · Livraison Yango</p>
              </div>
              <p className="text-xs font-bold text-slate-900">25K</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Satisfaction card — bottom right — desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.15 }}
        className="hidden sm:block absolute bottom-4 lg:bottom-10 right-0 lg:-right-4 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-2xl p-3.5 w-[180px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-amber-500 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </span>
              <span className="text-xs font-bold text-slate-900">5.0</span>
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Satisfaction marchands
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Basé sur 10 000+ avis
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===== FLOATING BRAND ICONS — desktop only ===== */}
      <FloatingIcon className="hidden lg:block absolute top-0 left-1/4 z-30" delay={1.2} duration={4}>
        <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shadow-glow-green">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>

      <FloatingIcon className="hidden lg:block absolute top-1/3 right-4 z-30" delay={1.5} duration={5}>
        <div className="w-10 h-10 rounded-xl bg-yaa-orange flex items-center justify-center shadow-glow-orange">
          <Wallet className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>

      <FloatingIcon className="hidden lg:block absolute bottom-1/4 left-2 z-30" delay={1.8} duration={4.5}>
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-yaa-orange" />
        </div>
      </FloatingIcon>

      <FloatingIcon className="hidden lg:block absolute bottom-0 right-1/3 z-30" delay={2.1} duration={5.5}>
        <div className="w-10 h-10 rounded-xl bg-yaa-green flex items-center justify-center shadow-glow-green">
          <Truck className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>

      <FloatingIcon className="hidden lg:block absolute top-1/2 -left-2 z-30" delay={2.4} duration={6}>
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-soft border border-slate-100">
          <CreditCard className="w-4 h-4 text-yaa-green" />
        </div>
      </FloatingIcon>

      <FloatingIcon className="hidden lg:block absolute top-1/4 right-0 z-30" delay={2.7} duration={4.8}>
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-soft border border-slate-100">
          <Store className="w-4 h-4 text-yaa-orange" />
        </div>
      </FloatingIcon>
    </div>
  );
}

function FloatingIcon({
  children,
  className,
  delay = 0,
  duration = 5,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: easeOut, delay }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
