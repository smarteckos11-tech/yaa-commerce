"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";
import { Particles } from "./Particles";
import { SLIDES, type Slide } from "@/lib/landing-data";
import { Slide1Visual, Slide2Visual, Slide3Visual, Slide4Visual } from "./SlideVisuals";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;
const SLIDE_DURATION = 7000; // 7 seconds per slide

const VISUALS = [Slide1Visual, Slide2Visual, Slide3Visual, Slide4Visual];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  // Progress + auto-advance
  useEffect(() => {
    if (isPaused) return;
    const tickMs = 50;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + tickMs / SLIDE_DURATION;
        if (next >= 1) {
          setActiveIndex((i) => (i + 1) % SLIDES.length);
          return 0;
        }
        return next;
      });
    }, tickMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const activeSlide = SLIDES[activeIndex];
  const ActiveVisual = VISUALS[activeIndex];

  return (
    <section
      className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 overflow-hidden bg-mesh-light"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-yaa-green/10 blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-yaa-orange/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* ============= LEFT — Text (animated per slide) ============= */}
          <div className="lg:col-span-6 xl:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, ease: easeOut }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-soft text-xs font-semibold text-slate-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yaa-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yaa-green" />
                  </span>
                  {activeSlide.badge}
                  <span className="text-amber-500 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                </div>

                {/* Title */}
                <h1 className="mt-5 font-display font-extrabold tracking-tight text-slate-900 text-[2.4rem] sm:text-5xl lg:text-[3.3rem] xl:text-6xl leading-[1.05] text-balance">
                  {renderTitle(activeSlide)}
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl text-pretty">
                  {activeSlide.subtitle}
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={activeSlide.primaryCta.href}
                    className="btn-shine group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-yaa-green hover:bg-yaa-green-dark rounded-xl shadow-glow-green transition-all"
                  >
                    {activeSlide.primaryCta.label}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href={activeSlide.secondaryCta.href}
                    className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yaa-green-soft text-yaa-green group-hover:bg-yaa-green group-hover:text-white transition-colors">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </span>
                    {activeSlide.secondaryCta.label}
                  </a>
                </div>

                {/* Trust points */}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                  {activeSlide.trustPoints.map((point) => (
                    <span key={point} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-yaa-green" />
                      {point}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ===== Carousel controls (persistent, below text) ===== */}
            <div className="mt-10 pt-6 border-t border-slate-200/70 flex items-center justify-between gap-4">
              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => goTo(i)}
                    className="group flex items-center gap-2"
                    aria-label={`Aller au slide ${i + 1}`}
                  >
                    <div
                      className={cn(
                        "relative h-1.5 rounded-full overflow-hidden transition-all duration-300",
                        i === activeIndex
                          ? "w-16 bg-slate-200"
                          : "w-8 bg-slate-200 hover:bg-slate-300"
                      )}
                    >
                      {i === activeIndex && (
                        <div
                          className="absolute inset-y-0 left-0 bg-yaa-green rounded-full"
                          style={{ width: `${progress * 100}%` }}
                        />
                      )}
                      {i < activeIndex && (
                        <div className="absolute inset-0 bg-yaa-green/40 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={isPaused}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-yaa-green hover:text-yaa-green flex items-center justify-center text-slate-600 transition-colors shadow-soft disabled:opacity-50"
                  aria-label="Slide précédent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goNext}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-yaa-green hover:text-yaa-green flex items-center justify-center text-slate-600 transition-colors shadow-soft"
                  aria-label="Slide suivant"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-yaa-green hover:text-yaa-green flex items-center justify-center text-slate-600 transition-colors shadow-soft"
                  aria-label={isPaused ? "Reprendre" : "Pause"}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mini partner row (only on first slide) */}
            <AnimatePresence>
              {activeIndex === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 pt-6 border-t border-slate-200/70 overflow-hidden"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Paiements acceptés
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-700">
                    <span className="font-display font-bold text-sm tracking-tight text-sky-600">Wave</span>
                    <span className="font-display font-bold text-sm tracking-tight text-orange-500">Orange Money</span>
                    <span className="font-display font-bold text-sm tracking-tight text-yellow-500">MTN MoMo</span>
                    <span className="font-display font-bold text-sm tracking-tight text-blue-600">Moov Money</span>
                    <span className="font-display font-bold text-sm tracking-tight text-purple-600">CinetPay</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ============= RIGHT — Visual (animated per slide) ============= */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.7, ease: easeOut }}
                className="relative"
              >
                <ActiveVisual />
              </motion.div>
            </AnimatePresence>

            {/* Slide counter — desktop only */}
            <div className="hidden lg:flex absolute -top-4 -right-4 z-40 items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-bold text-slate-700">
              <span className="text-yaa-green">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-slate-400">/ {String(SLIDES.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderTitle(slide: Slide) {
  return slide.titleLines.map((line, i) => {
    if (line.highlight === "orange") {
      return (
        <span key={i} className="relative inline-block">
          <span className="text-yaa-orange">{line.text}</span>
          <svg
            className="absolute -bottom-1 left-0 w-full"
            height="10"
            viewBox="0 0 200 10"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M2 7C50 3 100 3 198 6" stroke="#F7931A" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      );
    }
    if (line.highlight === "green") {
      return (
        <span key={i} className="text-gradient-green">
          {line.text}
        </span>
      );
    }
    return <span key={i}>{line.text}</span>;
  });
}
