"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Store, ShoppingBag, Search, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/lib/cart-store";
import { LiveChatWidget } from "@/components/storefront/live-chat/live-chat-widget";
import { PixelTracker } from "@/components/storefront/pixels/pixel-tracker";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number | null;
  type: string;
};

type Profile = {
  boutique_name: string;
  plan: string;
  user_id?: string;
};

type ProfileWithId = {
  id: string;
  boutique_name: string;
  plan: string;
};

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const add = useCart((s) => s.add);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [boutiqueUserId, setBoutiqueUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState("recent");

  React.useEffect(() => {
    async function load() {
      try {
        // Search profiles by boutique name (slugified)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, boutique_name, plan")
          .ilike("boutique_name", slug.replace(/-/g, " "));

        if (!profiles || profiles.length === 0) {
          setLoading(false);
          return;
        }

        const p = profiles[0] as ProfileWithId;
        setProfile(p);
        setBoutiqueUserId(p.id);

        // Get products for this boutique
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", p.id)
          .eq("status", "actif")
          .order("created_at", { ascending: false });

        setProducts((prods || []) as Product[]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Filter + sort
  const filtered = React.useMemo(() => {
    let list = products;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, search, category, sort]);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]];

  const handleAddToCart = (product: Product) => {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      slug,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted" />
          <p className="text-sm text-muted-foreground mt-3">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="font-display font-bold text-2xl mb-2">Boutique introuvable</h1>
        <p className="text-sm text-muted-foreground mb-4">Cette boutique n'existe pas ou n'est plus disponible.</p>
        <Button asChild><Link href="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  const boutiqueName = profile.boutique_name || "Boutique YAA";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/b/${slug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">{boutiqueName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link href="/cart"><ShoppingBag className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-yaa-green-500 to-yaa-green-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl">{boutiqueName}</h1>
            <p className="text-sm text-white/80 mt-1">Bienvenue dans notre boutique en ligne</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Livraison 24h</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Paiement sécurisé</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Retour gratuit 7j</span>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c === "all" ? "Toutes" : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products grid */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold">Aucun produit pour le moment</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cette boutique n'a pas encore de produits disponibles.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                  <Link href={`/b/${slug}/p/${product.id}`} className="block">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 flex flex-col flex-1">
                    <Link href={`/b/${slug}/p/${product.id}`}>
                      <p className="text-sm font-semibold line-clamp-2 mb-1 hover:text-yaa-green">{product.name}</p>
                    </Link>
                    {product.category && (
                      <Badge variant="outline" className="text-[9px] w-fit mb-1">{product.category}</Badge>
                    )}
                    <p className="text-base font-bold text-yaa-green-600 mb-2">{formatFCFA(product.price)}</p>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1 mt-auto"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            Propulsé par{" "}
            <Link href="/" className="font-semibold text-yaa-green-600 hover:underline">YAA Commerce</Link>
          </p>
        </div>
      </footer>

      {/* Live Chat Widget + Pixel Tracker */}
      {boutiqueUserId && (
        <>
          <LiveChatWidget userId={boutiqueUserId} />
          <PixelTracker userId={boutiqueUserId} />
        </>
      )}
    </div>
  );
}
