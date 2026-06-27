"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Package, MoreHorizontal, Pencil, Trash2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Bundle = {
  id: string;
  name: string;
  products: { name: string; emoji: string; price: number }[];
  bundlePrice: number;
  originalPrice: number;
  soldCount: number;
  status: "active" | "draft" | "expired";
  savings: number;
};

const MOCK_BUNDLES: Bundle[] = [
  {
    id: "B1",
    name: "Coffret Beauté Naturelle",
    products: [
      { name: "Beurre de karité 250g", emoji: "🧴", price: 8500 },
      { name: "Savon noir africain", emoji: "🧼", price: 4500 },
      { name: "Huile de baobab", emoji: "💆", price: 12000 },
    ],
    bundlePrice: 20000,
    originalPrice: 25000,
    soldCount: 47,
    status: "active",
    savings: 5000,
  },
  {
    id: "B2",
    name: "Pack Mode Africaine",
    products: [
      { name: "Boubou royal brodé", emoji: "👔", price: 45000 },
      { name: "Pagne wax premium", emoji: "👗", price: 18000 },
    ],
    bundlePrice: 55000,
    originalPrice: 63000,
    soldCount: 23,
    status: "active",
    savings: 8000,
  },
  {
    id: "B3",
    name: "Box Café Gourmand",
    products: [
      { name: "Café Arabica Man 1kg", emoji: "☕", price: 12000 },
      { name: "Tasse artisanale", emoji: "🍵", price: 5000 },
      { name: "Biscuits maison", emoji: "🍪", price: 3500 },
    ],
    bundlePrice: 18000,
    originalPrice: 20500,
    soldCount: 12,
    status: "draft",
    savings: 2500,
  },
];

const STATUS_STYLES = {
  active: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  expired: "bg-muted text-muted-foreground",
};

export default function BundlesPage() {
  const { toast } = useToast();
  const [bundles, setBundles] = React.useState(MOCK_BUNDLES);
  const [showModal, setShowModal] = React.useState(false);

  const stats = [
    { label: "Bundles actifs", value: bundles.filter((b) => b.status === "active").length, color: "green" as const, icon: "Package" },
    { label: "Ventes bundles", value: bundles.reduce((s, b) => s + b.soldCount, 0), color: "orange" as const, icon: "ShoppingCart" },
    { label: "Revenus générés", value: bundles.reduce((s, b) => s + b.bundlePrice * b.soldCount, 0), format: "fcfa" as const, color: "blue" as const, icon: "Wallet" },
    { label: "Panier moyen +", value: 32, format: "percent" as const, color: "purple" as const, icon: "TrendingUp" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Bundles & Offres groupées"
        subtitle="Vendez plus en combinant des produits avec réduction"
        actions={
          <Button onClick={() => setShowModal(true)} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            <Plus className="w-4 h-4" /> Créer un bundle
          </Button>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-5 hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", STATUS_STYLES[b.status])}>
                    {b.status === "active" ? "Actif" : b.status === "draft" ? "Brouillon" : "Expiré"}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-rose-600"
                      onClick={() => {
                        setBundles(bundles.filter((x) => x.id !== b.id));
                        toast({ title: "Bundle supprimé" });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-display font-bold text-base mb-3">{b.name}</h3>

              <div className="space-y-1.5 mb-4 flex-1">
                {b.products.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatFCFA(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-gradient-to-br from-yaa-green-50 to-yaa-orange-50 dark:from-yaa-green-950/30 dark:to-yaa-orange-950/30 border border-yaa-green-200">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-display font-extrabold text-yaa-green-600">
                    {formatFCFA(b.bundlePrice)}
                  </span>
                  <span className="text-sm line-through text-muted-foreground">
                    {formatFCFA(b.originalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-yaa-orange-600">
                    <Sparkles className="w-3 h-3" />
                    Économie : {formatFCFA(b.savings)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {b.soldCount} vendus
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {bundles.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold">Aucun bundle</p>
            <p className="text-xs text-muted-foreground mt-1">
              Créez votre premier bundle pour augmenter votre panier moyen de 30%+.
            </p>
          </Card>
        )}
      </motion.div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Créer un bundle</DialogTitle>
            <DialogDescription>
              Combinez plusieurs produits avec une réduction pour inciter à l&apos;achat groupé.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowModal(false);
              toast({ title: "Bundle créé !", description: "Il est maintenant visible sur votre boutique." });
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="b-name" className="text-xs font-semibold">Nom du bundle *</Label>
              <Input id="b-name" placeholder="Ex: Coffret Beauté Naturelle" required className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold">Produits à inclure *</Label>
              <div className="mt-1 space-y-1.5 max-h-40 overflow-y-auto p-2 border rounded-md">
                {["Boubou royal brodé", "Pagne wax premium", "Sac en cuir", "Beurre de karité", "Savon noir", "Café Arabica"].map((p) => (
                  <label key={p} className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-xs flex-1">{p}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Sélectionnez 2 à 6 produits</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="b-price" className="text-xs font-semibold">Prix bundle (FCFA) *</Label>
                <Input id="b-price" type="number" min="0" placeholder="20000" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="b-original" className="text-xs font-semibold">Prix original (FCFA)</Label>
                <Input id="b-original" type="number" min="0" placeholder="25000" className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Calculé automatiquement</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-yaa-green-700">Astuce :</span> Les bundles augmentent le panier moyen de 30% en moyenne. Mettez-les en avant sur votre page d&apos;accueil boutique.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button type="submit" className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                <Plus className="w-4 h-4" /> Créer le bundle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
