"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  MessageCircle,
  Share2,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Star,
  Minus,
  Plus,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/lib/cart-store";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number | null;
  type: string;
  user_id: string;
};

type Boutique = {
  boutique_name: string;
  plan: string;
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productId = params.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [boutique, setBoutique] = React.useState<Boutique | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [justAdded, setJustAdded] = React.useState(false);
  const add = useCart((s) => s.add);

  React.useEffect(() => {
    async function load() {
      try {
        const { data: prod, error: prodErr } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq("status", "actif")
          .single();

        if (prodErr || !prod) {
          setLoading(false);
          return;
        }
        setProduct(prod as Product);

        const { data: profile } = await supabase
          .from("profiles")
          .select("boutique_name, plan")
          .eq("id", (prod as Product).user_id)
          .single();
        if (profile) setBoutique(profile as Boutique);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted" />
          <p className="text-sm text-muted-foreground mt-3 text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="font-display font-bold text-2xl mb-2">Produit introuvable</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Ce produit n'existe pas ou n'est plus disponible.
        </p>
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";
  const boutiqueName = boutique?.boutique_name || "Boutique YAA";
  const images = product.image_url ? [product.image_url] : [];
  const inStock = product.type === "digital" || product.stock === null || product.stock > 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/b/${slug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">{boutiqueName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Partager">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Panier">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href={`/b/${slug}`} className="hover:text-foreground">{boutiqueName}</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <span>{product.category}</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-slate-200">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Pas d&apos;image</p>
                  </div>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-yaa-green-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Infos produit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-2">{product.category}</Badge>
              )}
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">(12 avis)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-extrabold text-yaa-green-600">
                {formatFCFA(product.price)}
              </span>
              {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                <Badge className="bg-rose-100 text-rose-700">Plus que {product.stock} en stock !</Badge>
              )}
            </div>

            {product.description && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-yaa-green-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-lg [&_a]:text-yaa-green-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Quantité :</span>
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted"
                    aria-label="Diminuer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted"
                    aria-label="Augmenter"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  size="lg"
                  disabled={!inStock}
                  onClick={() => {
                    add({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url,
                      slug,
                    }, quantity);
                    // Show feedback
                    setJustAdded(true);
                    setTimeout(() => setJustAdded(false), 2000);
                  }}
                  className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-2 h-12"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {justAdded ? "✓ Ajouté !" : inStock ? "Ajouter au panier" : "Rupture de stock"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10 gap-2 h-12"
                  asChild
                >
                  <a
                    href={`https://wa.me/?text=Bonjour, je suis intéressé par ${encodeURIComponent(product.name)} à ${formatFCFA(product.price)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Commander sur WhatsApp
                  </a>
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2">
                <Truck className="w-4 h-4 text-yaa-green-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-yaa-green-700">Paiement à la livraison disponible</span> — Payez en cash quand vous recevez votre colis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200">
              <div className="text-center p-2">
                <Truck className="w-5 h-5 mx-auto text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Livraison 24h</p>
                <p className="text-[9px] text-muted-foreground">Abidjan & grandes villes</p>
              </div>
              <div className="text-center p-2">
                <ShieldCheck className="w-5 h-5 mx-auto text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Paiement sécurisé</p>
                <p className="text-[9px] text-muted-foreground">Wave, OM, MTN, Moov</p>
              </div>
              <div className="text-center p-2">
                <RefreshCw className="w-5 h-5 mx-auto text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Retour gratuit</p>
                <p className="text-[9px] text-muted-foreground">Sous 7 jours</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="font-display font-bold text-lg mb-4">Produits similaires</h2>
          <p className="text-sm text-muted-foreground">
            Bientôt : recommandations IA basées sur ce produit.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            Propulsé par{" "}
            <Link href="/" className="font-semibold text-yaa-green-600 hover:underline">
              YAA Commerce
            </Link>{" "}
            — Plateforme e-commerce pour l&apos;Afrique
          </p>
        </div>
      </footer>
    </div>
  );
}
