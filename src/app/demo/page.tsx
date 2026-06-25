"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Play, Clock, Sparkles } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { NAV_GROUPS } from "@/lib/admin-data";

const DEMO_FEATURES = [
  { icon: "LayoutDashboard", title: "Tableau de Bord", desc: "Vue d'ensemble de votre activité en temps réel", color: "bg-yaa-green-100 text-yaa-green-700" },
  { icon: "Package", title: "10 Produits", desc: "Catalogue complet avec catégories colorées", color: "bg-yaa-orange-100 text-yaa-orange-700" },
  { icon: "ShoppingCart", title: "Kanban Commandes", desc: "5 colonnes, 14 commandes mock", color: "bg-sky-100 text-sky-700" },
  { icon: "Users", title: "10 Clients", desc: "Fidélité, segments VIP, dépenses", color: "bg-violet-100 text-violet-700" },
  { icon: "CreditCard", title: "9 Fournisseurs", desc: "Wave, Orange, MTN, Moov, CinetPay...", color: "bg-emerald-100 text-emerald-700" },
  { icon: "MessageCircle", title: "Chat WhatsApp", desc: "Interface complète avec suggestions IA", color: "bg-[#25D366]/20 text-[#1da851]" },
  { icon: "Truck", title: "Calculateur Livraison", desc: "Yango, DHL, FedEx avec prix comparés", color: "bg-rose-100 text-rose-700" },
  { icon: "Megaphone", title: "Marketing Multi-canal", desc: "Email, SMS, WhatsApp, Push", color: "bg-amber-100 text-amber-700" },
  { icon: "Brain", title: "IA YaaMind", desc: "Chat IA avec modèles GPT-4o/Claude/Gemini", color: "bg-purple-100 text-purple-700" },
  { icon: "BarChart3", title: "Analytics Recharts", desc: "Prédictions IA, funnel, sources trafic", color: "bg-blue-100 text-blue-700" },
  { icon: "Plug", title: "8 MCP Connecteurs", desc: "Gmail, Slack, Notion, Airtable...", color: "bg-indigo-100 text-indigo-700" },
  { icon: "ShieldCheck", title: "Super Admin", desc: "White-label, plans, rôles, utilisateurs", color: "bg-red-100 text-red-700" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-mesh-light">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <YaaLogo size="md" />
          <Link href="/signup" className="text-sm font-semibold text-white bg-yaa-green-500 hover:bg-yaa-green-600 px-3 py-1.5 rounded-lg">
            Créer ma boutique
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yaa-orange-100 text-yaa-orange-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Démo interactive · Sans inscription
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-balance">
            Explorez le dashboard YAA en <span className="text-gradient-green">temps réel</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 text-pretty">
            Découvrez les 13 pages de votre futur tableau de bord. Données mock réalistes,
            design premium, toutes les fonctionnalités prêtes à explorer.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
              <Link href="/admin">
                <Play className="w-4 h-4 fill-current" />
                Lancer la démo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-1.5">
              <Link href="/signup">
                Créer ma boutique
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Accès immédiat · Aucune carte bancaire requise
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10"
        >
          {DEMO_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow h-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${f.color}`}>
                  <DynamicIcon name={f.icon} className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick links to all pages */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg mb-4">Accès rapide aux 13 pages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-yaa-green-100 transition-colors">
                  <DynamicIcon name={item.icon} className="w-4 h-4 text-muted-foreground group-hover:text-yaa-green-600" />
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    item.badge.variant === "green" ? "bg-yaa-green-100 text-yaa-green-700" : "bg-yaa-orange-100 text-yaa-orange-700"
                  }`}>
                    {item.badge.text}
                  </span>
                )}
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-yaa-green-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
