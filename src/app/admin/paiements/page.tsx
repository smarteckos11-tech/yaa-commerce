"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Settings, Search, CheckCircle2, Clock, XCircle, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { PROVIDERS, PAYMENT_STATS, TRANSACTIONS, PAYMENT_COLORS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const TX_STATUS = {
  "Réussi": { icon: CheckCircle2, color: "text-yaa-green-600" },
  "En attente": { icon: Clock, color: "text-amber-600" },
  "Échecé": { icon: XCircle, color: "text-rose-600" },
};

export default function PaiementsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Paiements"
        subtitle="Gérez vos fournisseurs de paiement Mobile Money et transactions"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><RefreshCw className="h-4 w-4" /> Synchroniser</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Settings className="h-4 w-4" /> Configurer</Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {PAYMENT_STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            format={s.format as "number" | "fcfa" | "percent" | undefined}
            suffix={s.suffix}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="fournisseurs">
          <TabsList className="mb-4">
            <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Tab Fournisseurs */}
          <TabsContent value="fournisseurs" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {PROVIDERS.map((p, idx) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-1.5" style={{ background: p.color }} />
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: p.color }}
                        >
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold truncate">{p.name}</p>
                            {p.connected && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">
                                <span className="w-1 h-1 rounded-full bg-yaa-green-500" /> Connecté
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{p.type}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                        <Globe className="h-3 w-3" /> {p.country}
                      </p>
                      {p.connected ? (
                        <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Solde</p>
                            <p className="text-sm font-bold">{formatFCFA(p.balance || 0)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Transactions</p>
                            <p className="text-sm font-bold">{p.transactions}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 p-2.5 bg-muted/30 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Non configuré</p>
                        </div>
                      )}
                      <Button
                        variant={p.connected ? "outline" : "default"}
                        size="sm"
                        className={cn("w-full", !p.connected && "bg-yaa-green-500 hover:bg-yaa-green-600")}
                      >
                        {p.connected ? "Configurer" : "Connecter"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tab Transactions */}
          <TabsContent value="transactions" className="mt-0">
            <Card className="p-4 lg:p-5">
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une transaction..." className="pl-9" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">ID</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Fournisseur</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Montant</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Référence</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSACTIONS.map((tx, idx) => {
                      const pay = PAYMENT_COLORS[tx.provider];
                      const st = TX_STATUS[tx.status];
                      const StIcon = st.icon;
                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-3 font-mono text-xs">{tx.id}</td>
                          <td className="px-3 py-3 font-medium">{tx.client}</td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded", pay.bg, pay.text)}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pay.dot }} />
                              {tx.provider}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">{formatFCFA(tx.amount)}</td>
                          <td className="px-3 py-3 hidden lg:table-cell font-mono text-xs text-muted-foreground">{tx.reference}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", st.color)}>
                              <StIcon className="h-3 w-3" /> {tx.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">{tx.date}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
