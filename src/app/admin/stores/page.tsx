"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Store,
  Globe,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Loader2,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatCard } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Store = {
  id: string;
  name: string;
  slug: string;
  category: string;
  currency: string;
  plan: string;
  status: "active" | "draft";
  productCount: number;
  orderCount: number;
  revenue: number;
  logoUrl: string | null;
  domain: string | null;
  createdAt: string;
};

const STORE_CATEGORIES = [
  "Mode & Accessoires",
  "Beauté & Cosmétiques",
  "Électronique",
  "Alimentation",
  "Maison & Décoration",
  "Artisanat",
  "Restauration",
  "Services",
  "Autre",
];

const CURRENCIES = [
  { code: "XOF", label: "FCFA (Afrique de l'Ouest)" },
  { code: "XAF", label: "FCFA (Afrique Centrale)" },
  { code: "USD", label: "Dollar US ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "NGN", label: "Naira (₦)" },
  { code: "GHS", label: "Cedi (₵)" },
];

export default function StoresPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = React.useState<Store[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  // New store form
  const [storeName, setStoreName] = React.useState("");
  const [storeCategory, setStoreCategory] = React.useState(STORE_CATEGORIES[0]);
  const [storeCurrency, setStoreCurrency] = React.useState("XOF");

  // Load stores from Supabase
  React.useEffect(() => {
    async function loadStores() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch products count and orders count per store
        // Since we use profiles.boutique_name as store identifier,
        // we'll show the main store + any additional stores
        const { data: products } = await supabase
          .from("products")
          .select("id, name, price")
          .eq("user_id", user.id);

        const { data: orders } = await supabase
          .from("orders")
          .select("id, amount")
          .eq("user_id", user.id);

        const productCount = products?.length || 0;
        const orderCount = orders?.length || 0;
        const revenue = orders?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

        const mainStore: Store = {
          id: "main",
          name: profile?.boutique_name || "Ma Boutique",
          slug: (profile?.boutique_name || "ma-boutique").toLowerCase().replace(/\s/g, "-"),
          category: profile?.plan === "pro" ? "Multi-catégories" : "Mode & Accessoires",
          currency: "XOF",
          plan: profile?.plan || "decouverte",
          status: "active",
          productCount,
          orderCount,
          revenue,
          logoUrl: null,
          domain: null,
          createdAt: new Date().toISOString(),
        };

        setStores([mainStore]);
      } catch (err) {
        console.error("[Stores] Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, [user, profile]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !storeName) return;

    setCreating(true);
    try {
      // Update profile with new boutique name (multi-store would need a stores table)
      // For now, we create a new store entry that the user can switch to
      const slug = storeName.toLowerCase().replace(/\s/g, "-").replace(/[^a-z0-9-]/g, "");

      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: storeName,
        slug,
        category: storeCategory,
        currency: storeCurrency,
        plan: "decouverte",
        status: "active",
        productCount: 0,
        orderCount: 0,
        revenue: 0,
        logoUrl: null,
        domain: null,
        createdAt: new Date().toISOString(),
      };

      setStores([...stores, newStore]);
      setShowModal(false);
      setStoreName("");
      toast({
        title: "Boutique créée ! 🎉",
        description: `"${newStore.name}" est prête. Ajoutez vos premiers produits.`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const stats = [
    { label: "Boutiques actives", value: stores.filter((s) => s.status === "active").length, color: "green" as const, icon: "Store" },
    { label: "Total produits", value: stores.reduce((s, st) => s + st.productCount, 0), color: "orange" as const, icon: "Package" },
    { label: "Total commandes", value: stores.reduce((s, st) => s + st.orderCount, 0), color: "blue" as const, icon: "ShoppingCart" },
    { label: "Revenus totaux", value: stores.reduce((s, st) => s + st.revenue, 0), format: "fcfa" as const, color: "purple" as const, icon: "Wallet" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Mes boutiques"
        subtitle="Gérez toutes vos boutiques depuis un seul compte"
        actions={
          <Button onClick={() => setShowModal(true)} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            <Plus className="w-4 h-4" /> Créer une boutique
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Stores grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store, idx) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-5 hover:shadow-md transition-shadow h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">{store.name}</p>
                    <p className="text-[10px] text-muted-foreground">{store.category}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" /> Renommer
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" /> Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Store URL */}
              <div className="mb-3 p-2 rounded-lg bg-muted/50 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">
                  yaa-commerce.com/b/{store.slug}
                </span>
                <a
                  href={`/b/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yaa-green-600 hover:text-yaa-green-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 flex-1">
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <Package className="w-4 h-4 mx-auto text-yaa-green-500 mb-1" />
                  <p className="text-sm font-bold">{store.productCount}</p>
                  <p className="text-[9px] text-muted-foreground">Produits</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <ShoppingCart className="w-4 h-4 mx-auto text-yaa-orange-500 mb-1" />
                  <p className="text-sm font-bold">{store.orderCount}</p>
                  <p className="text-[9px] text-muted-foreground">Commandes</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/30">
                  <DollarSign className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs font-bold">{store.revenue > 0 ? formatFCFA(store.revenue).replace(" FCFA", "") : "0"}</p>
                  <p className="text-[9px] text-muted-foreground">FCFA</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 mb-3">
                <Badge className={cn(
                  "text-[10px]",
                  store.status === "active"
                    ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {store.status === "active" ? "Active" : "Brouillon"}
                </Badge>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {store.plan}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {store.currency}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
                  <Link href={`/admin/produits`}>
                    <Package className="w-3.5 h-3.5" /> Produits
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                  <Link href={`/b/${store.slug}`}>
                    <ExternalLink className="w-3.5 h-3.5" /> Voir
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Create store card */}
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-yaa-green-500 hover:bg-yaa-green-50/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground min-h-[280px]"
        >
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold">Créer une nouvelle boutique</p>
          <p className="text-[11px] text-center max-w-[200px]">
            Lancez une nouvelle boutique en ligne en quelques minutes
          </p>
        </button>
      </motion.div>

      {/* Modal: Create store */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle boutique</DialogTitle>
            <DialogDescription>
              Lancez une nouvelle boutique en ligne. Vous pourrez gérer plusieurs boutiques depuis le même compte.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStore} className="space-y-4">
            {/* Logo upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-semibold">Logo de la boutique</Label>
                <div className="mt-1 border-2 border-dashed border-slate-200 rounded-lg px-3 py-2 text-center hover:border-yaa-green-400 cursor-pointer">
                  <Upload className="w-4 h-4 mx-auto text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Téléverser (optionnel)</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="store-name" className="text-xs font-semibold">Nom de la boutique *</Label>
              <Input
                id="store-name"
                placeholder="Ex: Fatou Couture Premium"
                required
                className="mt-1"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                URL: yaa-commerce.com/b/{storeName.toLowerCase().replace(/\s/g, "-").replace(/[^a-z0-9-]/g, "") || "ma-boutique"}
              </p>
            </div>

            {/* Category + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Catégorie</Label>
                <Select value={storeCategory} onValueChange={setStoreCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Devise</Label>
                <Select value={storeCurrency} onValueChange={setStoreCurrency}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-yaa-green-700 mb-1">Votre boutique inclut :</p>
                  <ul className="space-y-0.5">
                    <li>✓ Page boutique publique personnalisable</li>
                    <li>✓ Catalogue produits illimité</li>
                    <li>✓ Paiements Mobile Money + COD</li>
                    <li>✓ Livraison Yango + DHL intégrée</li>
                    <li>✓ WhatsApp Business intégré</li>
                    <li>✓ Domaine personnalisé (plan Pro)</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button type="submit" disabled={creating} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : <><Plus className="w-4 h-4" /> Créer la boutique</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

