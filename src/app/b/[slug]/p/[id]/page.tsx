"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ZoomIn,
  Heart,
  Check,
  X,
  Clock,
  Package,
  ThumbsUp,
  ChevronDown,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

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

type RelatedProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
};

type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
};

type FAQ = { q: string; a: string };

const MOCK_REVIEWS: Review[] = [
  { id: "1", author: "Aminata T.", rating: 5, date: "12 Jun 2026", comment: "Produit de très bonne qualité, exactement comme sur la photo. Livraison rapide à Abidjan en 2h avec Yango !", helpful: 12 },
  { id: "2", author: "Ibrahim K.", rating: 4, date: "08 Jun 2026", comment: "Bon rapport qualité-prix. Le produit correspond à la description. Je recommande.", helpful: 5 },
  { id: "3", author: "Fatou D.", rating: 5, date: "01 Jun 2026", comment: "Excellente qualité, fait main avec soin. J'ai déjà commandé 3 fois chez cette boutique. Toujours satisfaite !", helpful: 8 },
];

const MOCK_FAQS: FAQ[] = [
  { q: "Quels sont les délais de livraison ?", a: "Livraison express à Abidjan en 2h via Yango. Pour le reste de la Côte d'Ivoire : 24-48h. International : 3-5 jours via DHL." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money, et le paiement à la livraison (cash à réception du colis)." },
  { q: "Puis-je retourner un produit ?", a: "Oui, vous disposez de 7 jours après réception pour retourner un produit non satisfaisant. Le remboursement est effectué sous 48h." },
  { q: "Le produit est-il en stock ?", a: "Les produits affichés comme disponibles sont en stock. En cas de rupture, nous vous notifions immédiatement par WhatsApp." },
  { q: "Proposez-vous la livraison internationale ?", a: "Oui, nous livrons dans 15+ pays africains et à l'international via DHL. Les frais sont calculés au checkout." },
];

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productId = params.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<RelatedProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [justAdded, setJustAdded] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [zoomActive, setZoomActive] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = React.useState(false);

  const add = useCart((s) => s.add);

  const imageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const { data: prod, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq("status", "actif")
          .single();

        if (error || !prod) {
          setLoading(false);
          return;
        }
        setProduct(prod as Product);

        // Load related products (same category, different product)
        const { data: related } = await supabase
          .from("products")
          .select("id, name, price, image_url, category")
          .eq("status", "actif")
          .neq("id", productId)
          .limit(4);

        setRelatedProducts((related || []) as RelatedProduct[]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  // Sticky bar on scroll
  React.useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Recently viewed in localStorage
  React.useEffect(() => {
    if (!product) return;
    try {
      const viewed = JSON.parse(localStorage.getItem("yaa-recently-viewed") || "[]");
      const filtered = viewed.filter((p: { id: string }) => p.id !== product.id);
      const updated = [{ id: product.id, name: product.name, price: product.price, image: product.image_url, slug }, ...filtered].slice(0, 6);
      localStorage.setItem("yaa-recently-viewed", JSON.stringify(updated));
    } catch {}
  }, [product, slug]);

  // Image zoom on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      slug,
    }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="font-display font-bold text-2xl mb-2">Produit introuvable</h1>
        <p className="text-sm text-muted-foreground mb-4">Ce produit n'existe pas ou n'est plus disponible.</p>
        <Button asChild><Link href="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  const images = product.image_url ? [product.image_url] : [];
  const inStock = product.type === "digital" || product.stock === null || (product.stock ?? 0) > 0;
  const avgRating = 4.8;
  const reviewCount = MOCK_REVIEWS.length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/b/${slug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">Boutique YAA</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsWishlisted(!isWishlisted)} aria-label="Favoris">
              <Heart className={cn("w-4 h-4", isWishlisted && "fill-rose-500 text-rose-500")} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Partager">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/cart"><ShoppingCart className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href={`/b/${slug}`} className="hover:text-foreground">Boutique</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (<><span>{product.category}</span><ChevronRight className="w-3 h-3" /></>)}
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        {/* === MAIN PRODUCT SECTION === */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* === GALLERY with ZOOM === */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <div
              ref={imageRef}
              className="aspect-square rounded-2xl overflow-hidden bg-muted border border-slate-200 relative cursor-zoom-in"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleMouseMove}
            >
              {images.length > 0 ? (
                <div
                  className="w-full h-full transition-transform duration-200"
                  style={zoomActive ? {
                    transform: `scale(2)`,
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  } : undefined}
                >
                  <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              {/* Zoom indicator */}
              <div className="absolute top-3 right-3 bg-black/60 text-white rounded-lg px-2 py-1 text-[10px] flex items-center gap-1 pointer-events-none">
                <ZoomIn className="w-3 h-3" /> Survolez pour zoomer
              </div>
              {/* Discount badge */}
              <div className="absolute top-3 left-3 bg-rose-500 text-white rounded-lg px-2 py-1 text-[10px] font-bold">
                -20%
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={cn("aspect-square rounded-lg overflow-hidden border-2 transition-colors", selectedImage === i ? "border-yaa-green-500" : "border-transparent")}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges under image */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100">
                <Truck className="w-5 h-5 text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Livraison 24h</p>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Paiement sécurisé</p>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-white border border-slate-100">
                <RefreshCw className="w-5 h-5 text-yaa-green-600 mb-1" />
                <p className="text-[10px] font-semibold">Retour 7 jours</p>
              </div>
            </div>
          </motion.div>

          {/* === PRODUCT INFO === */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Category + Rating */}
            <div className="flex items-center justify-between">
              {product.category && <Badge variant="outline">{product.category}</Badge>}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={cn("w-4 h-4", i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                  ))}
                </div>
                <span className="text-xs font-semibold">{avgRating}</span>
                <span className="text-xs text-muted-foreground">({reviewCount} avis)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-display font-extrabold text-yaa-green-600">{formatFCFA(product.price)}</span>
              <span className="text-lg line-through text-muted-foreground">{formatFCFA(Math.round(product.price * 1.25))}</span>
              <Badge className="bg-rose-100 text-rose-700">Économisez {formatFCFA(Math.round(product.price * 0.25))}</Badge>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <><span className="w-2 h-2 rounded-full bg-yaa-green-500 animate-pulse" /><span className="text-sm font-semibold text-yaa-green-600">En stock</span></>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-sm font-semibold text-rose-600">Rupture de stock</span></>
              )}
              {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-rose-600 font-semibold">Plus que {product.stock} en stock !</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-yaa-green-500 [&_blockquote]:pl-4 [&_img]:rounded-lg [&_a]:text-yaa-green-600 [&_a]:underline" dangerouslySetInnerHTML={{ __html: product.description }} />
            )}

            {/* Quantity + Add to cart */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Quantité :</span>
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-muted" aria-label="Diminuer"><Minus className="w-3 h-3" /></button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-muted" aria-label="Augmenter"><Plus className="w-3 h-3" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button size="lg" disabled={!inStock} onClick={handleAddToCart} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-2 h-12">
                  <ShoppingCart className="w-4 h-4" />
                  {justAdded ? "✓ Ajouté au panier !" : inStock ? "Ajouter au panier" : "Rupture de stock"}
                </Button>
                <Button size="lg" variant="outline" className="border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10 gap-2 h-12" asChild>
                  <a href={`https://wa.me/?text=Bonjour, je suis intéressé par ${encodeURIComponent(product.name)} à ${formatFCFA(product.price)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> Commander sur WhatsApp
                  </a>
                </Button>
              </div>

              {/* COD badge */}
              <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-yaa-green-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-yaa-green-700">Paiement à la livraison</span> — Payez en cash à réception. Disponible partout en Afrique.
                </p>
              </div>
            </div>

            {/* Shipping info */}
            <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-yaa-green-600" />
                <span className="font-semibold">Livraison :</span>
                <span className="text-muted-foreground">Abidjan 2h · Côte d'Ivoire 24h · International 3-5j</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-yaa-green-600" />
                <span className="font-semibold">Paiement :</span>
                <span className="text-muted-foreground">Wave, Orange Money, MTN, Moov, Cash à la livraison</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 text-yaa-green-600" />
                <span className="font-semibold">Retour :</span>
                <span className="text-muted-foreground">Retour gratuit sous 7 jours, remboursement 48h</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === FAQ SECTION === */}
        <section className="mb-12">
          <h2 className="font-display font-bold text-xl mb-4">Questions fréquentes</h2>
          <div className="space-y-2 max-w-3xl">
            {MOCK_FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform flex-shrink-0", openFAQ === i && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openFAQ === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* === REVIEWS SECTION === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl">Avis clients ({reviewCount})</h2>
            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <span className="text-sm font-bold">{avgRating}/5</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {MOCK_REVIEWS.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yaa-green-100 flex items-center justify-center text-xs font-bold text-yaa-green-700">
                        {review.author[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{review.author}</p>
                        <p className="text-[10px] text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex">{[1,2,3,4,5].map((j) => <Star key={j} className={cn("w-3 h-3", j <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{review.comment}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" /> Utile ({review.helpful})
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === RELATED PRODUCTS (UPSELL) === */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display font-bold text-xl mb-4">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rp, i) => (
                <motion.div key={rp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/b/${slug}/p/${rp.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
                      <div className="aspect-square bg-muted overflow-hidden">
                        {rp.image_url ? (
                          <img src={rp.image_url} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold line-clamp-2 mb-1">{rp.name}</p>
                        <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(rp.price)}</p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* === RECENTLY VIEWED === */}
        <RecentlyViewed slug={slug} />
      </main>

      {/* === STICKY ADD TO CART BAR === */}
      <AnimatePresence>
        {showStickyBar && product && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 hidden sm:block">
                {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-muted-foreground/30 m-auto mt-2.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{product.name}</p>
                <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(product.price)}</p>
              </div>
              <div className="flex items-center border border-slate-200 rounded-lg flex-shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
              </div>
              <Button onClick={handleAddToCart} disabled={!inStock} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 flex-shrink-0">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{justAdded ? "✓ Ajouté" : "Ajouter"}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">Propulsé par <Link href="/" className="font-semibold text-yaa-green-600 hover:underline">YAA Commerce</Link></p>
        </div>
      </footer>
    </div>
  );
}

/* === Recently Viewed Component === */
function RecentlyViewed({ slug }: { slug: string }) {
  const [products, setProducts] = React.useState<{ id: string; name: string; price: number; image: string | null }[]>([]);

  React.useEffect(() => {
    try {
      const viewed = JSON.parse(localStorage.getItem("yaa-recently-viewed") || "[]");
      setProducts(viewed.slice(1, 5)); // Skip current product (first item)
    } catch {}
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-muted-foreground" /> Vus récemment
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p, i) => (
          <Link key={i} href={`/b/${slug}/p/${p.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full">
              <div className="aspect-square bg-muted overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(p.price)}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
