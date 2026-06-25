"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogIn, LayoutDashboard } from "lucide-react";
import { YaaLogo } from "./YaaLogo";
import { NAV_LINKS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3"
      >
        <nav
          className={cn(
            "w-full max-w-7xl flex items-center justify-between gap-4 rounded-2xl px-4 sm:px-5 py-2.5 transition-all duration-300",
            scrolled
              ? "bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-soft"
              : "bg-white/40 backdrop-blur-md border border-transparent"
          )}
        >
          {/* Left — Logo */}
          <YaaLogo size="md" className="flex-shrink-0" />

          {/* Center — Navigation links */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-yaa-green transition-colors rounded-lg hover:bg-yaa-green-soft/60 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-yaa-green hover:bg-yaa-green-soft/50 transition-colors rounded-lg whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </a>
            <a
              href="/login"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-800 hover:text-yaa-green transition-colors rounded-lg whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              Se connecter
            </a>
            <a
              href="/signup"
              className="btn-shine group inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-yaa-green hover:bg-yaa-green-dark rounded-lg shadow-glow-green transition-all whitespace-nowrap"
            >
              Créer ma boutique
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <button
            className="lg:hidden p-2 text-slate-800 flex-shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[88vw] bg-white shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <YaaLogo size="sm" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 text-base font-medium text-slate-800 hover:text-yaa-green hover:bg-yaa-green-soft/50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-slate-200 flex flex-col gap-2">
                <a
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-center text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Accéder au Dashboard Admin
                </a>
                <a
                  href="/login"
                  className="px-4 py-3 text-center text-sm font-semibold text-slate-800 border border-slate-200 rounded-lg"
                >
                  Se connecter
                </a>
                <a
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-center text-sm font-semibold text-white bg-yaa-green hover:bg-yaa-green-dark rounded-lg"
                >
                  Créer ma boutique
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
