"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Mail, Smartphone, MessageCircle, Bell, Zap, Target, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { MARKETING_CHANNELS, MARKETING_CAMPAIGNS, MARKETING_SEGMENTS, AUTOMATIONS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CHANNEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-400", bar: "bg-blue-500" },
  green: { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400", bar: "bg-yaa-green-500" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
  orange: { bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-700 dark:text-yaa-orange-400", bar: "bg-yaa-orange-500" },
};

export default function MarketingPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketing"
        subtitle="Campagnes multi-canal, segments IA et automatisations"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5 border-yaa-green-300 text-yaa-green-600 hover:bg-yaa-green-50"><Sparkles className="h-4 w-4" /> IA: Créer campagne</Button>
            <Button size="sm" className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"><Plus className="h-4 w-4" /> Nouvelle campagne</Button>
          </>
        }
      />

      {/* Channel stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {MARKETING_CHANNELS.map((c) => {
          const col = CHANNEL_COLORS[c.color];
          return (
            <Card key={c.name} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", col.bg, col.text)}>
                  <DynamicIcon name={c.icon} className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{c.name}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Envoyés</p>
                  <p className="text-lg font-bold">{c.sent}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-muted-foreground">Ouverts</p>
                  <p className="text-lg font-bold">{c.opened}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", col.bar)} style={{ width: `${c.rate}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{c.rate}% ouverture</p>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="campagnes">
          <TabsList className="mb-4">
            <TabsTrigger value="campagnes">Campagnes</TabsTrigger>
            <TabsTrigger value="segments">Segments IA</TabsTrigger>
            <TabsTrigger value="automatisations">Automatisations</TabsTrigger>
          </TabsList>

          {/* Campagnes */}
          <TabsContent value="campagnes" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {MARKETING_CAMPAIGNS.map((c, idx) => {
                const chIcon = c.channel === "Email" ? Mail : c.channel === "SMS" ? Smartphone : c.channel === "WhatsApp" ? MessageCircle : Bell;
                const chCol = c.channel === "Email" ? CHANNEL_COLORS.blue : c.channel === "SMS" ? CHANNEL_COLORS.green : c.channel === "WhatsApp" ? CHANNEL_COLORS.emerald : CHANNEL_COLORS.orange;
                const ChIcon = chIcon;
                return (
                  <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", chCol.bg, chCol.text)}>
                          <ChIcon className="h-5 w-5" />
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", c.status === "Active" ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : c.status === "Planifiée" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
                          {c.status}
                        </span>
                      </div>
                      <p className="font-semibold mb-3">{c.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-[10px] text-muted-foreground">Envoyés</p><p className="font-bold">{c.sent}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Ouverts</p><p className="font-bold">{c.opened}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Cliqués</p><p className="font-bold">{c.clicked}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Revenu</p><p className="font-bold text-yaa-green-600">{formatFCFA(c.revenue)}</p></div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Segments IA */}
          <TabsContent value="segments" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {MARKETING_SEGMENTS.map((s, idx) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{s.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div><p className="text-[10px] text-muted-foreground">Clients</p><p className="font-bold">{s.clients}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Revenus</p><p className="font-bold text-[10px]">{formatFCFA(s.revenue)}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Croissance</p><p className={cn("font-bold", s.growth.startsWith("+") ? "text-yaa-green-600" : "text-rose-600")}>{s.growth}</p></div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50 gap-1">
                      <Target className="h-3 w-3" /> Cibler
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Automatisations */}
          <TabsContent value="automatisations" className="mt-0">
            <div className="space-y-2">
              {AUTOMATIONS.map((a, idx) => (
                <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", a.active ? "bg-yaa-green-100 text-yaa-green-600 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground")}>
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">{a.action}</p>
                    </div>
                    <div className="hidden md:block text-xs">
                      <p className="text-[10px] text-muted-foreground">Trigger</p>
                      <code className="font-mono bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">{a.trigger}</code>
                    </div>
                    <div className="text-center text-xs hidden lg:block">
                      <p className="text-[10px] text-muted-foreground">Exécutions</p>
                      <p className="font-bold">{a.executions}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", a.active ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground")}>
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
