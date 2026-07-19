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
  Sparkles,
  Zap,
  Play,
  Video,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/lib/cart-store";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { OrderForm } from "@/components/storefront/order-form";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null; // JSONB array of image URLs
  video_url: string | null;
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

type Bundle = {
  id: string;
  name: string;
  description: string | null;
  bundle_price: number;
  original_price: number;
  products: { id?: string; name: string; price: number; emoji?: string }[];
  sold_count: number;
};

type PromoCode = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order: number;
  end_date: string | null;
  description: string | null;
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

// Error Boundary to catch any rendering errors
class ProductErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="font-display font-bold text-xl mb-2">Oups !</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Une erreur est survenue lors du chargement de ce produit.
          </p>
          <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted p-2 rounded">
            {this.state.error || "Erreur inconnue"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yaa-green-500 text-white rounded-lg text-sm font-semibold"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

// Smart video player — detects URL type and uses the right player
function VideoPlayer({ url }: { url: string }) {
  // Check if YouTube URL
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([\w-]+)/,
      /youtube\.com\/shorts\/([\w-]+)/,
      /youtu\.be\/([\w-]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  };

  // Check if TikTok URL
  const getTikTokId = (url: string): string | null => {
    const m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    return m ? m[1] : null;
  };

  const youtubeId = getYouTubeId(url);
  const tiktokId = getTikTokId(url);
  const isDirectVideo = url.match(/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i);

  // YouTube embed
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    );
  }

  // TikTok embed
  if (tiktokId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
        className="w-full h-full"
        allow="encrypted-media;"
        allowFullScreen
        frameBorder="0"
      />
    );
  }

  // Direct video file (MP4, WebM, etc.)
  if (isDirectVideo) {
    return (
      <video
        src={url}
        controls
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    );
  }

  // Fallback: try to play as video, show link if it fails
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
      <video
        src={url}
        controls
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        onError={(e) => {
          // Hide the video element and show a link instead
          (e.target as HTMLVideoElement).style.display = "none";
          const fallback = document.getElementById("video-fallback-link");
          if (fallback) fallback.style.display = "block";
        }}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
      <div id="video-fallback-link" style={{ display: "none" }} className="text-center">
        <p className="text-white text-xs mb-2">Impossible de lire la vidéo directement</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-yaa-green-400 text-xs underline"
        >
          <ExternalLink className="w-3 h-3" /> Ouvrir la vidéo
        </a>
      </div>
    </div>
  );
}

export default function ProductPageWrapper() {
  return (
    <ProductErrorBoundary>
      <ProductPage />
    </ProductErrorBoundary>
  );
}

function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productId = params.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<RelatedProduct[]>([]);
  const [bundles, setBundles] = React.useState<Bundle[]>([]);
  const [promoCodes, setPromoCodes] = React.useState<PromoCode[]>([]);
  const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
  const [promoInput, setPromoInput] = React.useState("");
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [justAdded, setJustAdded] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [zoomActive, setZoomActive] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = React.useState(false);
  const [showBundleOrderForm, setShowBundleOrderForm] = React.useState<string | null>(null);
  const [showVideo, setShowVideo] = React.useState(false);

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

        // Load bundles that include this product
        const { data: allBundles } = await supabase
          .from("bundles")
          .select("*")
          .eq("user_id", prod.user_id)
          .eq("status", "active");

        if (allBundles) {
          // Filter bundles containing this product (parse JSON if needed)
          const matching = (allBundles as Bundle[]).filter((b) => {
            try {
              let prods = b.products;
              if (typeof prods === "string") {
                try { prods = JSON.parse(prods); } catch { prods = []; }
              }
              if (!Array.isArray(prods)) return false;
              return prods.some((p: any) => p && p.id === productId);
            } catch {
              return false;
            }
          });
          setBundles(matching);
        }

        // Load active promo codes for this boutique
        const { data: promos } = await supabase
          .from("promo_codes")
          .select("id, code, type, value, min_order, end_date, description")
          .eq("user_id", prod.user_id)
          .eq("status", "active");

        if (promos) {
          // Filter: not expired + min_order <= product price
          const now = new Date();
          const valid = (promos as PromoCode[]).filter((p) => {
            const notExpired = !p.end_date || new Date(p.end_date) > now;
            const minOk = !p.min_order || p.min_order <= (prod.price * 1);
            return notExpired && minOk;
          });
          setPromoCodes(valid);
        }
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

  // Add a bundle to cart (each product in the bundle)
  const handleAddBundle = (bundle: Bundle) => {
    bundle.products.forEach((p) => {
      add({
        productId: p.id || `bundle-${bundle.id}-${p.name}`,
        name: p.name,
        price: p.price, // original price; discount applied via promo
        image: null,
        slug,
      }, 1);
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  // Apply a promo code on the product page
  const applyPromoCode = (code: string) => {
    const promo = promoCodes.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (!promo) {
      setPromoError("Code promo invalide ou expiré");
      setAppliedPromo(null);
      return;
    }
    setPromoError(null);
    setAppliedPromo(promo.code);
  };

  const applyPromo = useCart((s) => s.applyPromo);

  // Build images array: use 'images' JSONB column if available, fallback to image_url
  // MUST be called BEFORE any conditional return (Rules of Hooks)
  const images = React.useMemo(() => {
    if (!product) return [];
    try {
      // Handle string JSON, array, or null/undefined
      let rawImages = product.images;
      if (typeof rawImages === "string") {
        try { rawImages = JSON.parse(rawImages); } catch { rawImages = []; }
      }
      const allImages = Array.isArray(rawImages) && rawImages.length > 0
        ? rawImages
        : product.image_url
        ? [product.image_url]
        : [];
      return allImages;
    } catch {
      return product.image_url ? [product.image_url] : [];
    }
  }, [product]);

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

            {/* Thumbnails + Video thumbnail */}
            {(images.length > 1 || product.video_url) && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => { setSelectedImage(i); setShowVideo(false); }}
                    className={cn("aspect-square rounded-lg overflow-hidden border-2 transition-colors relative", !showVideo && selectedImage === i ? "border-yaa-green-500" : "border-transparent")}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {product.video_url && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-colors relative bg-black flex items-center justify-center",
                      showVideo ? "border-yaa-orange-500" : "border-transparent"
                    )}
                  >
                    {images[0] && (
                      <img src={images[0]} alt="" className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-yaa-orange-500 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Video player (vertical TikTok-style) */}
            {showVideo && product.video_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[9/16] max-w-[400px] mx-auto rounded-2xl overflow-hidden bg-black relative"
              >
                <VideoPlayer url={product.video_url} />
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded z-10">
                  🎬 Vidéo du produit
                </div>
              </motion.div>
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

              {/* Boutons secondaires */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" disabled={!inStock} onClick={handleAddToCart} variant="outline" className="gap-2 h-11">
                  <ShoppingCart className="w-4 h-4" />
                  {justAdded ? "✓ Ajouté !" : "Ajouter au panier"}
                </Button>
                <Button size="lg" variant="outline" className="border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10 gap-2 h-11" asChild>
                  <a href={`https://wa.me/?text=Bonjour, je suis intéressé par ${encodeURIComponent(product.name)} à ${formatFCFA(product.price)}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              </div>

              {/* Formulaire de commande direct — TOUJOURS VISIBLE */}
              {inStock && (
                <OrderForm
                  items={[{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity,
                  }]}
                  userId={product.user_id}
                  slug={slug}
                  title="Commander maintenant"
                  bundles={bundles.map((b) => ({
                    id: b.id,
                    name: b.name,
                    bundle_price: b.bundle_price,
                    original_price: b.original_price,
                    products: Array.isArray(b.products) ? b.products : [],
                  }))}
                  promoCode={appliedPromo}
                  promoDiscount={(() => {
                    try {
                      const p = promoCodes.find((p) => p.code === appliedPromo);
                      return p && p.type === "percentage" ? p.value : 0;
                    } catch { return 0; }
                  })()}
                />
              )}

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

        {/* === BUNDLES SECTION === */}
        {bundles.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display font-bold text-xl mb-1">🎉 Offres groupées</h2>
            <p className="text-sm text-muted-foreground mb-4">Économisez en achetant ce produit en bundle</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {bundles.map((bundle) => {
                const savings = bundle.original_price - bundle.bundle_price;
                const discountPercent = bundle.original_price > 0 ? Math.round((savings / bundle.original_price) * 100) : 0;
                return (
                  <Card key={bundle.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display font-bold text-base">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{bundle.description}</p>
                        )}
                      </div>
                      <Badge className="bg-yaa-orange-100 text-yaa-orange-700">-{discountPercent}%</Badge>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      {bundle.products.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <span className="text-lg">{p.emoji || "📦"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.price.toLocaleString("fr-FR")} FCFA</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-display font-extrabold text-yaa-green-600">
                        {bundle.bundle_price.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {bundle.original_price.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-yaa-orange-600">
                        <Sparkles className="w-3 h-3" />
                        Économie : {savings.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="text-[10px] text-muted-foreground">{bundle.sold_count || 0} vendus</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleAddBundle(bundle)}
                      >
                        <ShoppingCart className="w-4 h-4" /> Panier
                      </Button>
                      <Button
                        className={cn(
                          "gap-1.5",
                          showBundleOrderForm === bundle.id
                            ? "bg-yaa-orange-500 hover:bg-yaa-orange-600"
                            : "bg-yaa-green-500 hover:bg-yaa-green-600"
                        )}
                        onClick={() =>
                          setShowBundleOrderForm(showBundleOrderForm === bundle.id ? null : bundle.id)
                        }
                      >
                        {showBundleOrderForm === bundle.id ? (
                          <><X className="w-4 h-4" /> Annuler</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Commander</>
                        )}
                      </Button>
                    </div>

                    {/* Formulaire de commande direct pour le bundle */}
                    {showBundleOrderForm === bundle.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-3"
                      >
                        <OrderForm
                          items={bundle.products.map((p) => ({
                            productId: p.id || `bundle-${bundle.id}-${p.name}`,
                            name: p.name,
                            price: p.price,
                            quantity: 1,
                          }))}
                          userId={product.user_id}
                          slug={slug}
                          title={`Commander "${bundle.name}"`}
                          fixedTotal={bundle.bundle_price}
                        />
                      </motion.div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* === PROMO CODES SECTION === */}
        {promoCodes.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display font-bold text-xl mb-1">🎟️ Codes promo disponibles</h2>
            <p className="text-sm text-muted-foreground mb-4">Appliquez un code pour réduire votre prix</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              {promoCodes.map((promo) => {
                const isApplied = appliedPromo === promo.code;
                return (
                  <Card key={promo.id} className={cn("p-4 transition-all", isApplied ? "ring-2 ring-yaa-green-500 bg-yaa-green-50/50" : "")}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <code className="font-mono font-bold text-base bg-yaa-green-100 text-yaa-green-700 px-2 py-1 rounded">
                          {promo.code}
                        </code>
                        {promo.description && (
                          <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>
                        )}
                      </div>
                      <Badge className="bg-yaa-orange-100 text-yaa-orange-700">
                        {promo.type === "percentage" ? `-${promo.value}%` : `-${promo.value.toLocaleString("fr-FR")} FCFA`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                      {promo.min_order > 0 && (
                        <span>Min. {promo.min_order.toLocaleString("fr-FR")} FCFA</span>
                      )}
                      {promo.end_date && (
                        <span>· Expire le {new Date(promo.end_date).toLocaleDateString("fr-FR")}</span>
                      )}
                    </div>
                    {isApplied ? (
                      <Button className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5" disabled>
                        <Check className="w-4 h-4" /> Code appliqué
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full gap-1.5"
                        onClick={() => applyPromoCode(promo.code)}
                      >
                        Appliquer ce code
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Manual promo input */}
            <Card className="p-4 mt-3 max-w-3xl">
              <p className="text-xs font-semibold mb-2">Vous avez un autre code ?</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez votre code..."
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError(null);
                  }}
                  className="flex-1 font-mono"
                />
                <Button
                  className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  onClick={() => {
                    applyPromoCode(promoInput);
                    if (promoCodes.find((p) => p.code.toLowerCase() === promoInput.toLowerCase())) {
                      const promo = promoCodes.find((p) => p.code.toLowerCase() === promoInput.toLowerCase())!;
                      if (promo.type === "percentage") {
                        applyPromo(promo.code, promo.value);
                      }
                      setPromoInput("");
                    }
                  }}
                  disabled={!promoInput.trim()}
                >
                  Appliquer
                </Button>
              </div>
              {promoError && (
                <p className="text-xs text-rose-600 mt-2">{promoError}</p>
              )}
              {appliedPromo && (
                <p className="text-xs text-yaa-green-600 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Code "{appliedPromo}" appliqué — la réduction sera calculée au panier
                </p>
              )}
            </Card>
          </section>
        )}

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

        {/* === REVIEWS SECTION (real Supabase) === */}
        <section className="mb-12">
          <ProductReviews productId={product.id} />
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
                {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-muted-foreground/30 m-auto mt-2.5" />}
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
