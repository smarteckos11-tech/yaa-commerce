"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Filter, Plus, Search, MapPin, MessageCircle, Eye, Banknote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { KANBAN_COLUMNS, ORDER_SUMMARY, ORDER_STATUS_COLORS, PAYMENT_COLORS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SUMMARY_COLOR: Record<string, "blue" | "amber" | "purple" | "green" | "red"> = {
  blue: "blue",
  amber: "amber",
  purple: "purple",
  green: "green",
  red: "red",
};

export default function CommandesPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Commandes"
        subtitle="Suivez vos commandes en temps réel via Kanban"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" /> Filtrer</Button>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><Plus className="h-4 w-4" /> Nouvelle commande</Button>
          </>
        }
      />

      {/* Summary cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {ORDER_SUMMARY.map((s) => {
          const colorMap: Record<string, { bg: string; text: string }> = {
            blue: { bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-400" },
            amber: { bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-400" },
            purple: { bg: "bg-violet-50 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-400" },
            green: { bg: "bg-yaa-green-50 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400" },
            red: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-400" },
          };
          const c = colorMap[s.color];
          return (
            <Card key={s.status} className="p-3 lg:p-4">
              <div className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded mb-2", c.bg, c.text)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", `bg-${s.color === "green" ? "yaa-green" : s.color}-500`)} />
                {s.status}
              </div>
              <p className="text-2xl font-display font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatFCFA(s.total)}</p>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une commande..." className="pl-9" />
        </div>
      </motion.div>

      {/* Kanban */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 lg:gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colors = ORDER_STATUS_COLORS[col.status];
          return (
            <div key={col.status} className="flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                  <span className="text-sm font-semibold">{col.status}</span>
                </div>
                <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{col.orders.length}</span>
              </div>
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1 no-scrollbar">
                {col.orders.map((order, idx) => {
                  const pay = PAYMENT_COLORS[order.payment];
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card className={cn("p-3 border-l-4 group cursor-pointer hover:shadow-md transition-shadow", colors.border)}>
                        <div className="flex items-start gap-2 mb-2">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarFallback className="bg-muted text-[10px] font-bold">{order.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{order.customer}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 truncate">
                              <MapPin className="h-2.5 w-2.5" /> {order.city}, {order.country}
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{order.items}</p>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold">{formatFCFA(order.amount)}</p>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5",
                              pay.bg,
                              pay.text
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: pay.dot }} />
                            {order.payment === "Paiement à la livraison" ? "COD" : order.payment}
                          </span>
                        </div>
                        {order.payment === "Paiement à la livraison" && (
                          <div className="mb-2 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            {order.status === "Livré" ? "Cash collecté ✓" : order.status === "Expédié" ? "À collecter à la livraison" : "À collecter"}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-[10px] font-mono text-muted-foreground">{order.id}</p>
                          <p className="text-[10px] text-muted-foreground">{order.time}</p>
                        </div>
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 flex-1">
                            <Eye className="h-3 w-3" /> Détails
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 bg-[#25D366] text-white border-[#25D366] hover:bg-[#1da851]">
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
