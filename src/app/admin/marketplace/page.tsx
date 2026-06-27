"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star, Check, Clock, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/ui-bits";
import { useToast } from "@/hooks/use-toast";
import { MARKETPLACE_CATEGORIES, FEATURED_EXTENSIONS, ALL_EXTENSIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function MarketplacePage() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = React.useState("Toutes");
  const [search, setSearch] = React.useState("");
  const [installed, setInstalled] = React.useState<Set<string>>(
    new Set(ALL_EXTENSIONS.filter(e => e.installed).map(e => e.name))
  );
  const [installing, setInstalling] = React.useState<string | null>(null);
  const [waitlist, setWaitlist] = React.useState<Set<string>>(new Set());

  const toggleInstall = (name: string, status: string) => {
    if (status === "coming_soon") {
      // Join waitlist
      setWaitlist(prev => new Set([...prev, name]));
      toast({ title: "Ajouté à la liste d'attente", description: `Vous serez notifié quand ${name} sera disponible.` });
      return;
    }

    if (installed.has(name)) {
      // Uninstall
      setInstalling(name);
      setTimeout(() => {
        setInstalled(prev => { const next = new Set(prev); next.delete(name); return next; });
        setInstalling(null);
        toast({ title: "Extension désinstallée", description: name });
      }, 800);
    } else {
      // Install
      setInstalling(name);
      setTimeout(() => {
        setInstalled(prev => new Set([...prev, name]));
        setInstalling(null);
        toast({ title: "Extension installée ✓", description: `${name} est maintenant actif sur votre boutique.` });
      }, 1000);
    }
  };

  const filtered = ALL_EXTENSIONS.filter(e => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.developer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketplace"
        subtitle="Étendez YAA avec des extensions"
        actions={
          <>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-yaa-green-100 text-yaa-green-700 rounded">
              {installed.size} installée{installed.size > 1 ? "s" : ""}
            </span>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600" onClick={() => toast({ title: "Portail développeur", description: "Documentation API bientôt disponible" })}>
              <Plus className="w-4 h-4" /> Développer une extension
            </Button>
          </>
        }
      />

      {/* Categories */}
      <motion.div variants={item} className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {MARKETPLACE_CATEGORIES.map((c) => {
          const active = activeCategory === c.name;
          return (
            <button key={c.name} onClick={() => setActiveCategory(active ? "Toutes" : c.name)}
              className={cn("p-3 rounded-xl border text-center transition-all hover:shadow-md",
                active ? "border-yaa-green-500 ring-2 ring-yaa-green-500/30 bg-yaa-green-50/50" : "border-border bg-card hover:border-yaa-green-300")}>
              <div className="text-2xl mb-1">{c.emoji}</div>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.count} extensions</p>
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une extension..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Featured */}
      <motion.div variants={item} className="mb-6">
        <h2 className="font-display font-semibold text-lg mb-3">⭐ Extensions à la une</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {FEATURED_EXTENSIONS.map((e, idx) => {
            const isComingSoon = e.status === "coming_soon";
            const isInstalled = installed.has(e.name);
            const isInstalling = installing === e.name;
            const isWaitlisted = waitlist.has(e.name);
            return (
              <motion.div key={e.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className={cn("p-4 hover:shadow-md transition-shadow h-full flex flex-col", isComingSoon && "opacity-90")}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yaa-orange-100 text-yaa-orange-700">{e.category}</span>
                    {isInstalled ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 px-1.5 py-0.5 rounded"><Check className="h-2.5 w-2.5" /> Installée</span>
                    ) : isComingSoon ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded"><Clock className="h-2.5 w-2.5" /> Bientôt</span>
                    ) : null}
                  </div>
                  <p className="font-semibold mb-0.5">{e.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-2">par {e.developer}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{e.description}</p>

                  {isComingSoon && (e as any).projectDescription && (
                    <div className="mb-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                      <p className="text-[10px] font-bold text-amber-700 mb-0.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Projet YAA</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{(e as any).projectDescription}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="font-bold">{e.rating}</span></span>
                    <span className="text-muted-foreground">·</span><span className="text-muted-foreground">{e.installs} installs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-yaa-green-600">{e.price}</span>
                    {isComingSoon ? (
                      <Button size="sm" variant="outline" disabled={isWaitlisted} onClick={() => toggleInstall(e.name, e.status)} className="gap-1">
                        {isWaitlisted ? <><Check className="w-3 h-3" /> En attente</> : <><Clock className="w-3 h-3" /> Liste d'attente</>}
                      </Button>
                    ) : (
                      <Button size="sm" variant={isInstalled ? "outline" : "default"} disabled={isInstalling} onClick={() => toggleInstall(e.name, e.status)} className={cn(!isInstalled && "bg-yaa-green-500 hover:bg-yaa-green-600")}>
                        {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : isInstalled ? "Configurer" : "Installer"}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* All extensions */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-3">Toutes les extensions</h2>
        <Card className="p-2">
          {filtered.map((e, idx) => {
            const isInstalled = installed.has(e.name);
            const isInstalling = installing === e.name;
            const isWaitlisted = waitlist.has(e.name);
            return (
              <motion.div key={e.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">{e.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1.5">{e.name}{isInstalled && <Check className="h-3 w-3 text-yaa-green-500" />}</p>
                  <p className="text-[11px] text-muted-foreground">par {e.developer} · {e.category}</p>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="font-bold">{e.rating}</span>
                  <span className="text-muted-foreground ml-2">{e.installs}</span>
                </div>
                <div className="text-right hidden sm:block"><p className="text-sm font-bold text-yaa-green-600">{e.price}</p></div>
                {e.status === "coming_soon" ? (
                  <Button size="sm" variant="outline" disabled={isWaitlisted} onClick={() => toggleInstall(e.name, e.status)} className="gap-1">
                    {isWaitlisted ? <><Check className="w-3 h-3" /> En attente</> : "Liste d'attente"}
                  </Button>
                ) : (
                  <Button size="sm" variant={isInstalled ? "outline" : "default"} disabled={isInstalling} onClick={() => toggleInstall(e.name, e.status)} className={cn(!isInstalled && "bg-yaa-green-500 hover:bg-yaa-green-600")}>
                    {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : isInstalled ? "Configurer" : "Installer"}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </Card>
      </motion.div>
    </motion.div>
  );
}
