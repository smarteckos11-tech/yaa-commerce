"use client";

import { motion } from "framer-motion";
import {
  Star,
  TrendingUp,
  MessageCircle,
  Wallet,
  Sparkles,
  Truck,
  Store,
  CreditCard,
  CheckCircle2,
  MapPin,
  Package,
  Send,
  Bot,
  ArrowUpRight,
  ShoppingBag,
  UtensilsCrossed,
  Footprints,
  Smartphone,
  Plug,
} from "lucide-react";
import { AfricaMap } from "./AfricaMap";
import { Particles } from "./Particles";
import { VendorBoutiqueCard, CoteDIvoireMap } from "./ProductsShowcase";
import { IMAGES } from "@/lib/landing-data";

const easeOut = [0.16, 1, 0.3, 1] as const;

/* ============================================================
   SLIDE 1 — "L'Afrique avance..." 
   woman entrepreneur + Africa map + 4 floating sales cards
   ============================================================ */
export function Slide1Visual() {
  return (
    <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <AfricaMap className="w-[110%] h-[110%] -translate-y-4 opacity-70" />
      </motion.div>

      <Particles count={28} className="absolute inset-0 pointer-events-none hidden sm:block" color="#0F8A4B" />
      <Particles count={12} className="absolute inset-0 pointer-events-none hidden sm:block" color="#F7931A" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[380px] sm:w-[340px] sm:h-[440px] lg:w-[360px] rounded-full bg-gradient-to-b from-yaa-green/30 via-yaa-orange/15 to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="relative w-[240px] sm:w-[300px] lg:w-[360px] aspect-[3/4] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-premium ring-1 ring-white/60 bg-white">
          <img src={IMAGES.yaaCouple} alt="Couple d'entrepreneurs YAA avec tabliers de marque" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4">
            <div className="glass-card rounded-xl px-3 py-1.5 inline-block">
              <p className="text-[10px] font-medium text-slate-700">Amina & Kofi · Abidjan</p>
              <p className="text-xs font-bold text-yaa-green">1M FCFA / an</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sales card — top left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.7 }}
        className="absolute top-2 sm:top-8 left-0 sm:-left-4 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 w-[170px] sm:w-[210px]">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-slate-600">Ventes du mois</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-yaa-green bg-yaa-green-soft px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />+32%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-display text-slate-900">
              250 000 <span className="text-xs sm:text-sm font-bold text-slate-500">FCFA</span>
            </p>
            <div className="mt-2 sm:mt-3 h-8 sm:h-10">
              <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark-1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0F8A4B" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#0F8A4B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4" stroke="#0F8A4B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4 L200 40 L0 40 Z" fill="url(#spark-1)" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment card — top right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.85 }}
        className="absolute top-6 sm:top-16 right-0 sm:-right-2 z-20"
      >
        <div className="animate-float-medium">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 w-[170px] sm:w-[210px]">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs sm:text-sm">W</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate">Paiement reçu</p>
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

      {/* Vendor boutique showcase card — bottom left (replaces WhatsApp order card) */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.0 }}
        className="hidden sm:block absolute bottom-6 lg:bottom-12 left-0 lg:-left-6 z-20"
      >
        <div className="animate-float-fast">
          <VendorBoutiqueCard />
        </div>
      </motion.div>

      {/* Payment providers card — bottom right (using user-provided payment badges image) */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.15 }}
        className="hidden sm:block absolute bottom-4 lg:bottom-10 right-0 lg:-right-4 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-2xl p-3 w-[170px]">
            <p className="text-[10px] font-semibold text-slate-700 mb-1.5">Paiements acceptés</p>
            <img
              src={IMAGES.yaaPaymentBadges}
              alt="Badges Wave, Orange Money, MTN MoMo, Moov Money, CinetPay"
              className="w-full h-auto rounded-md"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>

      {/* Floating brand icons — desktop only */}
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

/* ============================================================
   SLIDE 2 — "Transformez chaque conversation WhatsApp en vente"
   woman with smartphone + WhatsApp phone mockup + payment cards
   ============================================================ */
export function Slide2Visual() {
  return (
    <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full">
      {/* Background dots */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#25D366]/15 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-yaa-orange/10 blur-3xl" />

      <Particles count={20} className="absolute inset-0 pointer-events-none hidden sm:block" color="#25D366" />
      <Particles count={10} className="absolute inset-0 pointer-events-none hidden sm:block" color="#F7931A" />

      {/* Photo of woman with smartphone — left side */}
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
        className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="relative w-[200px] sm:w-[260px] lg:w-[300px] aspect-[3/4] rounded-[1.5rem] overflow-hidden shadow-premium ring-1 ring-white/60 bg-white">
          <img src={IMAGES.yaaManSuccess} alt="Entrepreneur souriant avec smartphone, geste de succès" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
            <div className="glass-card rounded-xl px-3 py-1.5 inline-block">
              <p className="text-[10px] font-medium text-slate-700">Koffi · Abidjan</p>
              <p className="text-xs font-bold text-[#25D366]">+5 000 commandes WhatsApp</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Phone Mockup — right side */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.5 }}
        className="absolute right-0 sm:right-4 lg:right-12 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="animate-float-medium">
          <WhatsAppPhoneMockup />
        </div>
      </motion.div>

      {/* Floating payment received card — top right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.9 }}
        className="absolute top-2 sm:top-6 right-0 sm:right-2 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 w-[180px] sm:w-[210px]">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <img
                src="/brands/orange-money.svg"
                alt="Logo Orange Money"
                className="h-8 w-auto"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-900">Paiement reçu</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">Orange Money · 1 min</p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yaa-green flex-shrink-0" />
            </div>
            <p className="mt-2 sm:mt-2.5 text-base sm:text-lg font-extrabold font-display text-slate-900">
              45 000 <span className="text-[10px] sm:text-xs text-slate-500">FCFA</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp product catalog showcase — bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
        className="hidden sm:block absolute bottom-4 lg:bottom-8 left-2 lg:left-4 z-20"
      >
        <div className="animate-float-fast">
          <div className="glass-card rounded-2xl p-3.5 w-[230px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-900">Catalogue WhatsApp</p>
              </div>
              <span className="text-[9px] text-[#25D366] font-bold bg-[#25D366]/10 px-1.5 py-0.5 rounded">12 produits</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { emoji: "👜", label: "Sacs" },
                { emoji: "👟", label: "Chauss" },
                { emoji: "📱", label: "Tél" },
                { emoji: "💄", label: "Cosm" },
                { emoji: "🍲", label: "Food" },
                { emoji: "🔌", label: "Élec" },
                { emoji: "👗", label: "Mode" },
                { emoji: "⌚", label: "Montres" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.3 + i * 0.05 }}
                  className="aspect-square rounded-md bg-slate-50 border border-slate-100 flex flex-col items-center justify-center hover:border-yaa-green/30 hover:bg-white transition-colors"
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-[7px] text-slate-600 font-medium mt-0.5">{p.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] text-slate-500">Paiement intégré</span>
              <div className="flex items-center gap-0.5">
                <img src="/brands/wave.png" alt="Wave" className="h-3 w-auto" />
                <img src="/brands/orange-money.svg" alt="Orange Money" className="h-3 w-auto" />
                <img src="/brands/mtn.png" alt="MTN MoMo" className="h-3 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating icon — desktop only */}
      <FloatingIcon className="hidden lg:block absolute top-1/4 left-1/2 z-30" delay={1.4} duration={4.5}>
        <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center shadow-glow-green">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
      </FloatingIcon>
      <FloatingIcon className="hidden lg:block absolute bottom-1/4 right-1/3 z-30" delay={1.7} duration={5}>
        <div className="w-10 h-10 rounded-xl bg-yaa-orange flex items-center justify-center shadow-glow-orange">
          <Send className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>
    </div>
  );
}

function WhatsAppPhoneMockup() {
  return (
    <div className="relative w-[180px] sm:w-[220px] lg:w-[240px]">
      {/* Phone frame */}
      <div className="relative rounded-[2rem] bg-slate-900 p-2 shadow-premium ring-1 ring-white/20">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-b-xl z-20" />
        {/* Screen */}
        <div className="rounded-[1.6rem] overflow-hidden bg-[#E5DDD5] aspect-[9/18]">
          {/* WhatsApp header */}
          <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">M</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Mariama Boutique</p>
              <p className="text-[9px] opacity-80">en ligne</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>

          {/* Chat area */}
          <div className="p-2 space-y-1.5">
            {/* Incoming message */}
            <div className="max-w-[80%] bg-white rounded-lg rounded-tl-none px-2.5 py-1.5 shadow-sm">
              <p className="text-[10px] text-slate-800">Bonjour, ce sac est dispo ?</p>
              <p className="text-[8px] text-slate-400 text-right">14:32</p>
            </div>

            {/* Product card */}
            <div className="max-w-[85%] bg-white rounded-lg rounded-tl-none p-1.5 shadow-sm">
              <div className="rounded-md overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                  <Store className="w-6 h-6 text-yaa-orange" />
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold text-slate-900">Sac en cuir Premium</p>
                  <p className="text-[11px] font-bold text-yaa-green">25 000 FCFA</p>
                </div>
              </div>
              <p className="text-[8px] text-slate-400 text-right mt-0.5">14:32</p>
            </div>

            {/* Outgoing message */}
            <div className="ml-auto max-w-[80%] bg-[#DCF8C6] rounded-lg rounded-tr-none px-2.5 py-1.5 shadow-sm">
              <p className="text-[10px] text-slate-800">Oui ! Je le prends 🙏</p>
              <p className="text-[8px] text-slate-400 text-right">14:33 ✓✓</p>
            </div>

            {/* Order confirmation */}
            <div className="max-w-[85%] bg-white rounded-lg rounded-tl-none p-1.5 shadow-sm border-l-2 border-yaa-green">
              <p className="text-[9px] font-bold text-yaa-green mb-0.5">✓ Commande confirmée</p>
              <p className="text-[9px] text-slate-700">Paiement Orange Money reçu</p>
              <p className="text-[8px] text-slate-400 text-right">14:33</p>
            </div>
          </div>

          {/* Input bar */}
          <div className="absolute bottom-0 inset-x-0 bg-[#F0F0F0] p-1.5 flex items-center gap-1.5">
            <div className="flex-1 bg-white rounded-full px-2.5 py-1 text-[9px] text-slate-400">Message</div>
            <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center">
              <Send className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp badge floating */}
      <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-glow-green ring-2 ring-white">
        <MessageCircle className="w-4 h-4 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
      </div>
    </div>
  );
}

/* ============================================================
   SLIDE 3 — "De Abidjan à Korhogo, livrés en 24h"
   delivery man + tracking card + Côte d'Ivoire map with routes
   ============================================================ */
export function Slide3Visual() {
  return (
    <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full">
      {/* Côte d'Ivoire map background (right) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOut, delay: 0.2 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[65%] h-[90%] flex items-center justify-center opacity-90"
      >
        <CoteDIvoireMap className="w-full h-full" />
      </motion.div>

      <Particles count={20} className="absolute inset-0 pointer-events-none hidden sm:block" color="#F7931A" />
      <Particles count={10} className="absolute inset-0 pointer-events-none hidden sm:block" color="#0F8A4B" />

      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yaa-green/15 blur-3xl" />

      {/* Photo of delivery man — left */}
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
        className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="relative w-[220px] sm:w-[270px] lg:w-[310px] aspect-[3/4] rounded-[1.5rem] overflow-hidden shadow-premium ring-1 ring-white/60">
          <img src={IMAGES.deliveryDriver} alt="Livreur Yango avec colis à Abidjan" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-2">
            <div className="glass-card rounded-xl px-3 py-1.5 inline-block">
              <p className="text-[10px] font-medium text-slate-700">Ibrahim · Abidjan</p>
              <p className="text-xs font-bold text-yaa-orange">Yango Delivery</p>
            </div>
            <img src="/brands/yango.png" alt="Yango" className="h-7 w-auto rounded-md bg-white/90 p-0.5" />
          </div>
        </div>
      </motion.div>

      {/* Tracking card — top right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.7 }}
        className="absolute top-2 sm:top-8 right-0 sm:-right-2 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3.5 sm:p-4 w-[200px] sm:w-[230px]">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-yaa-orange flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">Colis #YA-2841</p>
                <p className="text-[10px] text-slate-500">Abidjan → Bouaké</p>
              </div>
            </div>
            {/* Timeline */}
            <div className="space-y-1.5 mb-2">
              <TimelineStep label="Commande reçue" done time="14:32" />
              <TimelineStep label="Pris en charge par Yango" done time="14:45" />
              <TimelineStep label="En route vers Bouaké" active time="15:02" />
              <TimelineStep label="Livré" pending time="~22:30" />
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Arrivée estimée</span>
              <span className="text-xs font-bold text-yaa-green">8h</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cities covered card — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.9 }}
        className="hidden sm:block absolute bottom-6 lg:bottom-10 right-0 sm:-right-4 z-20"
      >
        <div className="animate-float-medium">
          <div className="glass-card rounded-2xl p-3.5 w-[210px]">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-yaa-green" />
              <p className="text-xs font-semibold text-slate-900">Villes desservies</p>
            </div>
            <div className="space-y-1">
              {[
                { city: "Abidjan", time: "2h", hub: true },
                { city: "Yamoussoukro", time: "6h", hub: true },
                { city: "Bouaké", time: "8h", hub: true },
                { city: "San-Pédro", time: "12h", hub: true },
                { city: "Daloa", time: "10h", hub: false },
                { city: "Korhogo", time: "18h", hub: false },
                { city: "Man", time: "14h", hub: false },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className={`${c.hub ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {c.hub && <span className="text-yaa-orange mr-1">●</span>}
                    {c.city}
                  </span>
                  <span className="font-bold text-yaa-green">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delivery partners card — bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
        className="hidden sm:block absolute bottom-6 lg:bottom-10 left-2 lg:left-6 z-20"
      >
        <div className="animate-float-fast">
          <div className="glass-card rounded-2xl p-3.5 w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-yaa-green" />
              <p className="text-xs font-semibold text-slate-900">Partenaires livraison</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-slate-100">
                <img src="/brands/yango.png" alt="Yango" className="h-5 w-auto" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-900">Yango</p>
                  <p className="text-[8px] text-slate-500">Express Abidjan</p>
                </div>
                <span className="text-[9px] font-bold text-yaa-green bg-yaa-green-soft px-1.5 py-0.5 rounded">2h</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-slate-100">
                <img src="/brands/dhl.svg" alt="DHL" className="h-5 w-auto" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-900">DHL</p>
                  <p className="text-[8px] text-slate-500">International</p>
                </div>
                <span className="text-[9px] font-bold text-yaa-orange bg-yaa-orange-soft px-1.5 py-0.5 rounded">24h</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-slate-100">
                <div className="w-5 h-5 rounded-md bg-yaa-green flex items-center justify-center text-white text-[9px] font-bold">CI</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-900">Coursiers locaux</p>
                  <p className="text-[8px] text-slate-500">Intérieur du pays</p>
                </div>
                <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">18h</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating brand icons */}
      <FloatingIcon className="hidden lg:block absolute top-1/3 right-1/4 z-30" delay={1.3} duration={4.5}>
        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-premium border border-slate-100">
          <img src="/brands/yango.png" alt="Yango" className="h-7 w-auto" />
        </div>
      </FloatingIcon>
      <FloatingIcon className="hidden lg:block absolute top-1/2 left-1/3 z-30" delay={1.6} duration={5}>
        <div className="w-10 h-10 rounded-xl bg-yaa-green flex items-center justify-center shadow-glow-green">
          <Truck className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>
    </div>
  );
}

function TimelineStep({
  label,
  status,
  time,
}: {
  label: string;
  status: "done" | "active" | "pending";
  time: string;
  done?: boolean;
  active?: boolean;
  pending?: boolean;
}) {
  const dotClass =
    status === "done"
      ? "bg-yaa-green"
      : status === "active"
      ? "bg-yaa-orange ring-2 ring-yaa-orange/30 animate-pulse-soft"
      : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dotClass} flex-shrink-0`} />
      <span className={`text-[10px] flex-1 ${status === "pending" ? "text-slate-400" : "text-slate-700"}`}>
        {label}
      </span>
      <span className="text-[9px] text-slate-400">{time}</span>
    </div>
  );
}

function DeliveryRoutesMap({ className }: { className?: string }) {
  // Legacy Africa map — kept as fallback (unused by Slide 3, which now uses CoteDIvoireMap)
  return (
    <svg viewBox="0 0 460 460" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="route-grad" x1="0" y1="0" x2="460" y2="460">
          <stop stopColor="#0F8A4B" stopOpacity="0.15" />
          <stop offset="1" stopColor="#F7931A" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d="M170 50 C 200 45, 230 50, 260 55 L 305 60 C 320 60, 330 70, 332 85 L 340 110 C 348 130, 350 145, 345 165 L 348 180 C 360 195, 365 210, 360 230 L 350 250 C 348 270, 345 285, 340 300 L 335 320 C 330 340, 325 355, 315 370 L 300 385 C 285 395, 270 395, 260 385 L 245 370 C 235 360, 230 365, 230 380 L 235 395 C 240 405, 240 415, 230 415 L 215 410 C 205 405, 200 395, 200 380 L 195 360 C 190 340, 185 320, 180 305 L 170 285 C 165 270, 165 255, 170 240 L 175 225 C 170 215, 165 205, 160 195 L 150 175 C 140 165, 135 155, 140 145 L 145 130 C 150 115, 155 100, 165 85 L 170 65 Z"
        fill="url(#route-grad)"
        stroke="#0F8A4B"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

/* ============================================================
   SLIDE 4 — "Pilotez votre croissance avec l'IA YAA"
   entrepreneur + AI dashboard preview + growth cards
   ============================================================ */
export function Slide4Visual() {
  return (
    <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] w-full">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-yaa-green/15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-3xl" />

      <Particles count={24} className="absolute inset-0 pointer-events-none hidden sm:block" color="#0F8A4B" />
      <Particles count={12} className="absolute inset-0 pointer-events-none hidden sm:block" color="#8B5CF6" />

      {/* Photo of entrepreneur with tablet — right */}
      <motion.div
        initial={{ opacity: 0, x: 40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
        className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="relative w-[220px] sm:w-[260px] lg:w-[300px] aspect-[3/4] rounded-[1.5rem] overflow-hidden shadow-premium ring-1 ring-white/60 bg-white">
          <img src={IMAGES.yaaWomanGreenSuit} alt="Entrepreneure africaine en costume vert avec tablette analytics" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
            <div className="glass-card rounded-xl px-3 py-1.5 inline-block">
              <p className="text-[10px] font-medium text-slate-700">Amina · Yaoundé</p>
              <p className="text-xs font-bold text-yaa-green">+47% croissance IA</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Dashboard mini-preview — left */}
      <motion.div
        initial={{ opacity: 0, x: -40, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: easeOut, delay: 0.5 }}
        className="absolute left-0 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10"
      >
        <div className="animate-float-medium">
          <AIDashboardMini />
        </div>
      </motion.div>

      {/* AI insight card — top right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.9 }}
        className="absolute top-2 sm:top-6 right-0 sm:right-2 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-3.5 w-[180px] sm:w-[210px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-900">Insight IA</p>
              <span className="ml-auto text-[9px] text-purple-600 font-bold">Live</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              « Vos ventes de sacs augmentent de 32%. Je recommande de réapprovisionner 50 unités avant vendredi. »
            </p>
            <button className="mt-2 text-[10px] font-bold text-yaa-green flex items-center gap-0.5">
              Appliquer <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI growth card — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
        className="hidden sm:block absolute bottom-8 lg:bottom-10 right-2 sm:right-4 z-20"
      >
        <div className="animate-float-fast">
          <div className="glass-card rounded-2xl p-3.5 w-[190px]">
            <p className="text-[10px] font-medium text-slate-600">Croissance prédite (30j)</p>
            <p className="text-2xl font-extrabold font-display text-yaa-green mt-0.5">+47%</p>
            <div className="mt-2 h-10">
              <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grow-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 35 L25 30 L50 32 L75 22 L100 24 L125 14 L150 12 L175 6 L200 2" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M0 35 L25 30 L50 32 L75 22 L100 24 L125 14 L150 12 L175 6 L200 2 L200 40 L0 40 Z" fill="url(#grow-grad)" />
                {/* Forecast dashed part */}
                <path d="M125 14 L150 12 L175 6 L200 2" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3 2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">Prédiction IA · 94% confiance</p>
          </div>
        </div>
      </motion.div>

      {/* Auto-generated content card — bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 1.3 }}
        className="hidden sm:block absolute bottom-6 lg:bottom-10 left-2 lg:left-6 z-20"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-2xl p-3.5 w-[200px]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-yaa-orange flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold text-slate-900">Description générée</p>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug italic">
              « Sac à main en cuir véritable, fait main à Dakar. Élégant et durable, parfait pour toutes vos occasions. »
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yaa-green-soft text-yaa-green font-semibold">IA</span>
              <span className="text-[9px] text-slate-400">généré en 0.8s</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating brand icons */}
      <FloatingIcon className="hidden lg:block absolute top-1/4 right-1/3 z-30" delay={1.5} duration={4.5}>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow-green">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </FloatingIcon>
      <FloatingIcon className="hidden lg:block absolute top-1/2 left-1/4 z-30" delay={1.8} duration={5}>
        <div className="w-10 h-10 rounded-xl bg-yaa-green flex items-center justify-center shadow-glow-green">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
      </FloatingIcon>
    </div>
  );
}

function AIDashboardMini() {
  return (
    <div className="relative w-[200px] sm:w-[240px] lg:w-[270px] rounded-2xl bg-white shadow-premium ring-1 ring-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold">YAA Intelligence</p>
            <p className="text-[8px] opacity-70">Tableau de bord IA</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5 space-y-2">
        {/* KPIs row */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-1.5 rounded-lg bg-yaa-green-soft">
            <p className="text-[8px] text-slate-500">Revenus</p>
            <p className="text-[11px] font-bold text-yaa-green">250K</p>
            <p className="text-[8px] text-yaa-green">+32%</p>
          </div>
          <div className="p-1.5 rounded-lg bg-yaa-orange-soft">
            <p className="text-[8px] text-slate-500">Commandes</p>
            <p className="text-[11px] font-bold text-yaa-orange">1 248</p>
            <p className="text-[8px] text-yaa-orange">+18%</p>
          </div>
        </div>

        {/* Mini area chart */}
        <div className="rounded-lg border border-slate-100 p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] font-semibold text-slate-700">Prévision 30j</p>
            <span className="text-[8px] text-purple-600 font-bold">IA 94%</span>
          </div>
          <div className="h-12">
            <svg viewBox="0 0 200 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mini-ai-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M0 32 L25 28 L50 30 L75 22 L100 24 L125 14 L150 16 L175 8 L200 4 L200 40 L0 40 Z" fill="url(#mini-ai-grad)" />
              {/* Forecast zone */}
              <rect x="125" y="0" width="75" height="40" fill="#8B5CF6" opacity="0.05" />
              <path d="M125 14 L150 16 L175 8 L200 4" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3 2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* AI suggestions */}
        <div className="rounded-lg bg-purple-50 p-2">
          <p className="text-[8px] font-bold text-purple-700 mb-1">Suggestions IA</p>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[9px] text-slate-700">
              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              <span>Réapprovisionner sacs cuir</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-700">
              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              <span>Promo WhatsApp vendredi</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-700">
              <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              <span> cibler clients Abidjan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow-green ring-2 ring-white">
        <Bot className="w-4 h-4 text-white" />
      </div>
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
