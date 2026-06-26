"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  Download,
  Plus,
  Sparkles,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Package,
  Loader2,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/admin/ui-bits";
import { supabase } from "@/lib/supabase-client";
import { PRODUCT_CATEGORIES } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  type: string;
  price: number;
  stock: number | null;
  sold: number;
  status: string;
  description: string | null;
  image_url: string | null;
};

export default function ProduitsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("tous");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  // Charger les VRAIS produits depuis Supabase
  const loadProducts = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (err) {
      console.error("[Produits] Erreur:", err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos produits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtrer
  const filtered = React.useMemo(() => {
    let list = products;
    if (tab === "physiques") list = list.filter((p) => p.type === "physique");
    if (tab === "numeriques") list = list.filter((p) => p.type === "digital");
    if (tab === "stock-faible") list = list.filter((p) => p.stock !== null && p.stock <= 10);
    if (category !== "all") list = list.filter((p) => p.category?.toLowerCase().replace(/\s/g, "-") === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [products, tab, category, search]);

  // Stats calculées depuis les vraies données
  const stats = [
    { label: "Total", value: products.length, color: "green" as const, icon: "Package" },
    { label: "Actifs", value: products.filter((p) => p.status === "actif").length, color: "orange" as const, icon: "CheckCircle2" },
    { label: "Stock Faible", value: products.filter((p) => p.stock !== null && p.stock <= 10).length, color: "red" as const, icon: "AlertTriangle" },
    { label: "Digitals", value: products.filter((p) => p.type === "digital").length, color: "purple" as const, icon: "Download" },
  ];

  // Supprimer un produit
  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Supprimer "${productName}" ? Cette action est irréversible.`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;

      setProducts(products.filter((p) => p.id !== productId));
      toast({ title: "Produit supprimé", description: productName });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Suppression impossible",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Produits"
        subtitle="Gérez votre catalogue produits en quelques clics"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Bientôt disponible", description: "Import CSV en cours de développement" })}>
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Bientôt disponible", description: "Export en cours de développement" })}>
              <Download className="h-4 w-4" /> Exporter
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"
              onClick={() => router.push("/admin/produits/nouveau")}
            >
              <Plus className="h-4 w-4" /> Ajouter un produit
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 lg:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                s.color === "green" && "bg-yaa-green-50 dark:bg-yaa-green-950/50 text-yaa-green-600",
                s.color === "orange" && "bg-yaa-orange-50 dark:bg-yaa-orange-950/50 text-yaa-orange-600",
                s.color === "red" && "bg-rose-50 dark:bg-rose-950/50 text-rose-600",
                s.color === "purple" && "bg-purple-50 dark:bg-purple-950/50 text-purple-600",
              )}>
                {s.icon === "Package" && <Package className="h-5 w-5" />}
                {s.icon === "CheckCircle2" && <Package className="h-5 w-5" />}
                {s.icon === "AlertTriangle" && <AlertTriangle className="h-5 w-5" />}
                {s.icon === "Download" && <Package className="h-5 w-5" />}
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-display font-bold tracking-tight">{s.value}</p>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters + Table */}
      <Card className="p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((c) => {
                const v = c === "Toutes" ? "all" : c.toLowerCase().replace(/\s/g, "-");
                return <SelectItem key={c} value={v}>{c}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="tous">Tous ({products.length})</TabsTrigger>
            <TabsTrigger value="physiques">Physiques ({products.filter(p => p.type === "physique").length})</TabsTrigger>
            <TabsTrigger value="numeriques">Numériques ({products.filter(p => p.type === "digital").length})</TabsTrigger>
            <TabsTrigger value="stock-faible">Stock faible ({products.filter(p => p.stock !== null && p.stock <= 10).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
              </div>
            ) : filtered.length === 0 ? (
              /* === EMPTY STATE — NO PRODUCTS === */
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1">
                  {products.length === 0 ? "Aucun produit pour le moment" : "Aucun produit trouvé"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {products.length === 0
                    ? "Créez votre premier produit pour lancer votre boutique. Ajoutez photos, description, prix — comme sur Shopify."
                    : "Essayez de modifier vos filtres ou votre recherche."}
                </p>
                {products.length === 0 && (
                  <Button
                    onClick={() => router.push("/admin/produits/nouveau")}
                    className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Créer mon premier produit
                  </Button>
                )}
              </div>
            ) : (
              /* === PRODUCT TABLE === */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Produit</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Catégorie</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Type</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Prix</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Stock</th>
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
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Store className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{p.sku || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          {p.category ? (
                            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                              {p.category}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded",
                            p.type === "digital" ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                          )}>
                            {p.type === "digital" ? "Digital" : "Physique"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">{formatFCFA(p.price)}</td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          {p.stock === null ? (
                            <span className="text-muted-foreground">∞</span>
                          ) : p.stock <= 10 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <AlertTriangle className="w-3 h-3" /> {p.stock}
                            </span>
                          ) : (
                            <span className="text-sm">{p.stock}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded",
                            p.status === "actif" ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground"
                          )}>
                            {p.status === "actif" ? "Actif" : p.status === "brouillon" ? "Brouillon" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                const slug = user?.email?.split("@")[0] || "boutique";
                                window.open(`/b/${slug}/p/${p.id}`, "_blank");
                              }}>
                                <Eye className="h-4 w-4 mr-2" /> Voir la fiche
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: "Bientôt disponible", description: "Édition de produit en cours de développement" })}>
                                <Pencil className="h-4 w-4 mr-2" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(p.id, p.name)} className="text-rose-600">
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
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
