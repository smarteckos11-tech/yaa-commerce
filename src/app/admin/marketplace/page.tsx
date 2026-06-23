"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/ui-bits";
import { MARKETPLACE_CATEGORIES, FEATURED_EXTENSIONS, ALL_EXTENSIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = React.useState("Toutes");

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketplace"
        subtitle="Étendez YAA avec des extensions officielles et communautaires"
        actions={
          <>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 rounded">
              {ALL_EXTENSIONS.filter(e => e.installed).length} installées
            </span>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><Plus className="h-4 w-4" /> Développer une extension</Button>
          </>
        }
      />

      {/* Categories */}
      <motion.div variants={item} className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {MARKETPLACE_CATEGORIES.map((c) => {
          const active = activeCategory === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setActiveCategory(active ? "Toutes" : c.name)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all hover:shadow-md",
                active
                  ? "border-yaa-green-500 ring-2 ring-yaa-green-500/30 bg-yaa-green-50/50 dark:bg-yaa-green-950/20"
                  : "border-border bg-card hover:border-yaa-green-300"
              )}
            >
              <div className="text-2xl mb-1">{c.emoji}</div>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.count} extensions</p>
            </button>
          );
        })}
      </motion.div>

      {/* Search + filters */}
      <motion.div variants={item} className="flex flex-col lg:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une extension..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">Trier: Popularité</Button>
        <Button variant="outline" size="sm">Filtres</Button>
      </motion.div>

      {/* Featured */}
      <motion.div variants={item} className="mb-6">
        <h2 className="font-display font-semibold text-lg mb-3">⭐ Extensions à la une</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {FEATURED_EXTENSIONS.map((e, idx) => (
            <motion.div key={e.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400">{e.category}</span>
                  {e.installed && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">
                      <Check className="h-2.5 w-2.5" /> Installée
                    </span>
                  )}
                </div>
                <p className="font-semibold mb-0.5">{e.name}</p>
                <p className="text-[11px] text-muted-foreground mb-2">par {e.developer}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{e.description}</p>
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{e.rating}</span>
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{e.installs} installs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-yaa-green-600">{e.price}</span>
                  <Button
                    size="sm"
                    variant={e.installed ? "outline" : "default"}
                    className={cn(!e.installed && "bg-yaa-green-500 hover:bg-yaa-green-600")}
                  >
                    {e.installed ? "Configurer" : "Installer"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All extensions */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-3">Toutes les extensions</h2>
        <Card className="p-2">
          {ALL_EXTENSIONS.map((e, idx) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                {e.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  {e.name}
                  {e.installed && <Check className="h-3 w-3 text-yaa-green-500" />}
                </p>
                <p className="text-[11px] text-muted-foreground">par {e.developer} · {e.category}</p>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{e.rating}</span>
                <span className="text-muted-foreground ml-2">{e.installs}</span>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-yaa-green-600">{e.price}</p>
              </div>
              <Button
                size="sm"
                variant={e.installed ? "outline" : "default"}
                className={cn(!e.installed && "bg-yaa-green-500 hover:bg-yaa-green-600")}
              >
                {e.installed ? "Configurer" : "Installer"}
              </Button>
            </motion.div>
          ))}
        </Card>
      </motion.div>
    </motion.div>
  );
}
