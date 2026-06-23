"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Settings, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { MCP_CONNECTORS, MCP_STATS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function McpPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="MCP Connecteurs"
        subtitle="Synchronisez vos outils externes avec YAA"
        actions={
          <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><RefreshCw className="h-4 w-4" /> Tout synchroniser</Button>
        }
      />

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6">
        {MCP_STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            suffix={s.suffix}
          />
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {MCP_CONNECTORS.map((c, idx) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: c.color }}
                >
                  {c.name[0]}
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded",
                  c.connected
                    ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", c.connected ? "bg-yaa-green-500" : "bg-muted-foreground/40")} />
                  {c.connected ? "Connecté" : "Déconnecté"}
                </span>
              </div>
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{c.category}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{c.description}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                <Clock className="h-3 w-3" />
                {c.lastSync}
              </div>
              <Button
                variant={c.connected ? "outline" : "default"}
                size="sm"
                className={cn("w-full gap-1.5", !c.connected && "bg-yaa-green-500 hover:bg-yaa-green-600")}
              >
                {c.connected ? <><Settings className="h-3.5 w-3.5" /> Configurer</> : "Connecter"}
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
