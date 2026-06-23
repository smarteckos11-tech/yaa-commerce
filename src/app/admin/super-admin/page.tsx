"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, Check, X, CheckCircle2, Clock, XCircle, Upload, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { SUPER_ADMIN_STATS, SUPER_ADMIN_USERS, SUPER_ADMIN_PLANS, SUPER_ADMIN_ROLES, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  "Découverte": { bg: "bg-muted", text: "text-muted-foreground" },
  "Business": { bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-700 dark:text-yaa-orange-400" },
  "Pro": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400" },
};

const STATUS_INFO: Record<string, { icon: React.ElementType; color: string }> = {
  "Actif": { icon: CheckCircle2, color: "text-yaa-green-600" },
  "Essai": { icon: Clock, color: "text-amber-600" },
  "Suspendu": { icon: XCircle, color: "text-rose-600" },
};

const ROLE_DOT_COLORS: Record<string, string> = {
  red: "bg-rose-500",
  green: "bg-yaa-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  yellow: "bg-amber-500",
};

export default function SuperAdminPage() {
  const [primaryColor, setPrimaryColor] = React.useState("#0F8A5F");

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Super Admin
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 px-2 py-0.5 rounded">
              <Crown className="h-3 w-3" /> Plateforme
            </span>
          </span>
        }
        subtitle="Administration globale de la plateforme YAA"
      />

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        {SUPER_ADMIN_STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            format={s.format as "number" | "fcfa" | "percent" | undefined}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="plans">Plans & Facturation</TabsTrigger>
            <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
            <TabsTrigger value="whitelabel">White-Label</TabsTrigger>
          </TabsList>

          {/* Users */}
          <TabsContent value="users" className="mt-0">
            <Card className="p-4 lg:p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Utilisateur</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Plan</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">MRR</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Inscrit le</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPER_ADMIN_USERS.map((u, idx) => {
                      const plan = PLAN_COLORS[u.plan];
                      const st = STATUS_INFO[u.status];
                      const StIcon = st.icon;
                      return (
                        <motion.tr
                          key={u.email}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-muted text-xs font-bold">{u.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{u.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", plan.bg, plan.text)}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", st.color)}>
                              <StIcon className="h-3 w-3" /> {u.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">{u.mrr > 0 ? formatFCFA(u.mrr) : "—"}</td>
                          <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden lg:table-cell">{u.date}</td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7">Voir</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-rose-600">Bannir</Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Plans */}
          <TabsContent value="plans" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUPER_ADMIN_PLANS.map((p, idx) => (
                <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className={cn("p-5 lg:p-6 h-full flex flex-col", p.popular && "ring-2 ring-yaa-green-500 relative")}>
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-yaa-green-500 px-3 py-0.5 rounded-full">
                        Populaire
                      </span>
                    )}
                    <p className="font-display font-bold text-lg mb-1">{p.name}</p>
                    <p className="text-2xl font-display font-extrabold mb-1">{formatFCFA(p.price)}<span className="text-xs font-medium text-muted-foreground">/mois</span></p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{p.users} utilisateurs</span>
                        <span className="font-bold">{p.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-yaa-green-500 rounded-full" style={{ width: `${p.percent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Revenu: <span className="font-bold text-yaa-green-600">{formatFCFA(p.revenue)}</span></p>
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-yaa-green-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-4 w-full">Modifier</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Roles */}
          <TabsContent value="roles" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {SUPER_ADMIN_ROLES.map((r, idx) => (
                <motion.div key={r.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 lg:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", ROLE_DOT_COLORS[r.color])} />
                        <p className="font-semibold">{r.name}</p>
                      </div>
                      <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{r.count} users</span>
                    </div>
                    <ul className="space-y-1.5">
                      {r.permissions.map((perm) => (
                        <li key={perm} className="flex items-start gap-2 text-xs">
                          <Check className="h-3.5 w-3.5 text-yaa-green-500 flex-shrink-0 mt-0.5" />
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* White-Label */}
          <TabsContent value="whitelabel" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h3 className="font-display font-semibold text-lg mb-4">Configuration White-Label</h3>
              <div className="space-y-5">
                {/* Platform name */}
                <div>
                  <Label htmlFor="platform-name" className="text-xs font-semibold mb-1.5 block">Nom de la plateforme</Label>
                  <Input id="platform-name" defaultValue="YAA Commerce" />
                </div>

                {/* Primary color */}
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Couleur primaire</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono max-w-32"
                    />
                    <div
                      className="w-10 h-10 rounded-md border flex-shrink-0"
                      style={{ background: primaryColor }}
                    />
                  </div>
                </div>

                {/* Logo upload */}
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-yaa-green-500 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Cliquez pour téléverser</p>
                    <p className="text-[11px] text-muted-foreground">PNG, SVG ou JPG · max 2MB</p>
                  </div>
                </div>

                {/* Custom domain */}
                <div>
                  <Label htmlFor="domain" className="text-xs font-semibold mb-1.5 block">Domaine personnalisé</Label>
                  <Input id="domain" placeholder="boutique.exemple.com" />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Configurez un enregistrement CNAME pointant vers <code className="font-mono bg-muted px-1 py-0.5 rounded">cname.yaa-commerce.com</code>
                  </p>
                </div>

                <Button className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                  <Check className="h-4 w-4" /> Sauvegarder
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
