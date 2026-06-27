"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Ticket, Calendar, Users, TrendingUp, MoreHorizontal, Copy, Pencil, Trash2, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { useToast } from "@/hooks/use-toast";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type PromoCode = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  status: "active" | "scheduled" | "expired";
  startDate: string;
  endDate: string;
  description?: string;
};

const MOCK_PROMOS: PromoCode[] = [
  { id: "P1", code: "BIENVENUE10", type: "percentage", value: 10, minOrder: 0, usageLimit: 100, usedCount: 47, status: "active", startDate: "01 Jun 2026", endDate: "31 Déc 2026", description: "10% pour les nouveaux clients" },
  { id: "P2", code: "TABASKI2026", type: "percentage", value: 20, minOrder: 50000, usageLimit: 200, usedCount: 156, status: "active", startDate: "10 Jun 2026", endDate: "15 Jul 2026", description: "Promo Tabaski -20%" },
  { id: "P3", code: "LIVRAISON500", type: "fixed", value: 500, minOrder: 25000, usageLimit: 50, usedCount: 23, status: "active", startDate: "01 Jun 2026", endDate: "30 Jun 2026", description: "Livraison offerte" },
  { id: "P4", code: "BLACKFRIDAY", type: "percentage", value: 30, minOrder: 0, usageLimit: 500, usedCount: 0, status: "scheduled", startDate: "24 Nov 2026", endDate: "30 Nov 2026", description: "Black Friday -30%" },
  { id: "P5", code: "ETE2025", type: "percentage", value: 15, minOrder: 10000, usageLimit: 100, usedCount: 100, status: "expired", startDate: "01 Jun 2025", endDate: "31 Aoû 2025", description: "Promo été expirée" },
];

const STATUS_STYLES = {
  active: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  expired: "bg-muted text-muted-foreground",
};

export default function PromoCodesPage() {
  const { toast } = useToast();
  const [promos, setPromos] = React.useState(MOCK_PROMOS);
  const [showModal, setShowModal] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = promos.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Codes actifs", value: promos.filter((p) => p.status === "active").length, color: "green" as const, icon: "Ticket" },
    { label: "Utilisations", value: promos.reduce((s, p) => s + p.usedCount, 0), color: "orange" as const, icon: "Users" },
    { label: "À venir", value: promos.filter((p) => p.status === "scheduled").length, color: "blue" as const, icon: "Calendar" },
    { label: "Taux conversion", value: 18.5, format: "percent" as const, color: "purple" as const, icon: "TrendingUp" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Codes Promo"
        subtitle="Créez des réductions, codes promo et offres marketing"
        actions={
          <Button onClick={() => setShowModal(true)} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            <Plus className="w-4 h-4" /> Nouveau code
          </Button>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          <div className="relative max-w-md mb-4">
            <Input
              placeholder="Rechercher un code promo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Code</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Réduction</th>
                  <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Min. commande</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Utilisations</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Période</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
                          <Ticket className="w-4 h-4 text-yaa-green-600" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-xs">{p.code}</p>
                          {p.description && <p className="text-[10px] text-muted-foreground">{p.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-yaa-orange-600">
                        {p.type === "percentage" ? `${p.value}%` : formatFCFA(p.value)}
                        <Percent className="w-3 h-3 opacity-50" />
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right hidden md:table-cell text-muted-foreground">
                      {p.minOrder > 0 ? formatFCFA(p.minOrder) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold">{p.usedCount}</span>
                      <span className="text-muted-foreground text-xs">/{p.usageLimit}</span>
                      <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden max-w-[80px] mx-auto">
                        <div
                          className="h-full bg-yaa-green-500 rounded-full"
                          style={{ width: `${(p.usedCount / p.usageLimit) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {p.startDate} → {p.endDate}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", STATUS_STYLES[p.status])}>
                        {p.status === "active" ? "Actif" : p.status === "scheduled" ? "Planifié" : "Expiré"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(p.code);
                            toast({ title: "Code copié !", description: p.code });
                          }}>
                            <Copy className="h-4 w-4 mr-2" /> Copier le code
                          </DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600"
                            onClick={() => {
                              setPromos(promos.filter((x) => x.id !== p.id));
                              toast({ title: "Code supprimé", description: p.code });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold">Aucun code promo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Créez votre premier code promo pour stimuler vos ventes.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau code promo</DialogTitle>
            <DialogDescription>
              Créez une réduction pour vos clients. Le code sera applicable au checkout.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowModal(false);
              toast({ title: "Code promo créé !", description: "Il est maintenant actif." });
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="code" className="text-xs font-semibold">Code *</Label>
              <Input id="code" placeholder="BIENVENUE10" required className="mt-1 font-mono uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Type</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value" className="text-xs font-semibold">Valeur *</Label>
                <Input id="value" type="number" min="0" placeholder="10" required className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minOrder" className="text-xs font-semibold">Min. commande (FCFA)</Label>
                <Input id="minOrder" type="number" min="0" placeholder="25000" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="usageLimit" className="text-xs font-semibold">Limite d&apos;usage</Label>
                <Input id="usageLimit" type="number" min="1" placeholder="100" required className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs font-semibold">Date début</Label>
                <Input id="startDate" type="date" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs font-semibold">Date fin</Label>
                <Input id="endDate" type="date" className="mt-1" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-yaa-green-700">Astuce :</span> Les codes promo sont appliqués automatiquement au checkout si le client les a saisis. Combinez avec un email marketing pour maximiser l&apos;impact.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button type="submit" className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                <Plus className="w-4 h-4" /> Créer le code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
