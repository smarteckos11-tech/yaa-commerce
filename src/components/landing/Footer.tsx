"use client";

import { Quote } from "lucide-react";
import { YaaLogo } from "./YaaLogo";

const FOOTER_LINKS = [
  {
    title: "Produit",
    links: [
      "Fonctionnalités",
      "Tarifs",
      "Dashboard",
      "Intégrations",
      "Mobile App",
      "Nouveautés",
    ],
  },
  {
    title: "Ressources",
    links: [
      "Centre d'aide",
      "Documentation",
      "Guides e-commerce",
      "Blog",
      "Webinaires",
      "Communauté",
    ],
  },
  {
    title: "Entreprise",
    links: [
      "À propos",
      "Carrières",
      "Presse",
      "Partenaires",
      "Investisseurs",
      "Contact",
    ],
  },
  {
    title: "Légal",
    links: [
      "Conditions d'utilisation",
      "Confidentialité",
      "Cookies",
      "Sécurité",
      "Conformité",
      "Mentions légales",
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden">
      {/* Top gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yaa-green/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Quote banner */}
        <div className="relative mb-14 lg:mb-16 p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-yaa-green/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-yaa-orange/10 blur-3xl" />
          <Quote className="relative w-10 h-10 text-yaa-green mb-4 opacity-80" />
          <p className="relative font-display font-medium text-xl lg:text-2xl text-white leading-relaxed max-w-3xl text-pretty">
            « YAA n'est pas juste une plateforme, c'est un mouvement pour
            l'indépendance économique de l'Afrique. »
          </p>
          <p className="relative mt-4 text-sm text-slate-400">
            — L'équipe YAA
          </p>
        </div>

        {/* Main footer */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="bg-white/95 inline-block px-3 py-2 rounded-lg">
              <YaaLogo size="md" />
            </div>
            <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-xs">
              La plateforme e-commerce tout-en-un, pensée pour les marchands
              africains. De la première vente à l'expansion internationale.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { name: "Twitter", href: "https://twitter.com/yaa_commerce" },
                { name: "LinkedIn", href: "https://linkedin.com/company/yaa-commerce" },
                { name: "Instagram", href: "https://instagram.com/yaa_commerce" },
                { name: "Facebook", href: "https://facebook.com/yaa_commerce" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-yaa-green hover:text-white text-slate-400 flex items-center justify-center transition-colors text-xs font-bold"
                >
                  {s.name[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-bold text-sm text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => {
                  // Map common labels to actual routes
                  const linkRoutes: Record<string, string> = {
                    "Fonctionnalités": "#fonctionnalites",
                    "Tarifs": "#tarifs",
                    "Dashboard": "/demo",
                    "Intégrations": "#fonctionnalites",
                    "Mobile App": "/demo",
                    "Documentation": "/docs",
                    "Guides e-commerce": "/docs",
                    "Blog": "/blog",
                    "Webinaires": "/blog",
                    "Communauté": "/contact",
                    "Centre d'aide": "/contact",
                    "À propos": "/contact",
                    "Carrières": "/contact",
                    "Presse": "/contact",
                    "Partenaires": "#partenaires",
                    "Investisseurs": "/contact",
                    "Contact": "/contact",
                    "Conditions d'utilisation": "/legal/terms",
                    "Confidentialité": "/legal/privacy",
                    "Cookies": "/legal/cookies",
                    "Sécurité": "/legal/security",
                    "Conformité": "/legal/compliance",
                    "Mentions légales": "/legal/mentions",
                  };
                  const href = linkRoutes[link] || "#";
                  return (
                    <li key={link}>
                      <a
                        href={href}
                        className="text-sm text-slate-400 hover:text-yaa-green transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 YAA. Tous droits réservés. Fait avec ❤️ en Afrique.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yaa-green animate-pulse-soft" />
              Tous les systèmes opérationnels
            </span>
            <span className="hidden sm:inline">·</span>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
