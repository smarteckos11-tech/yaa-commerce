"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

const PROMO_CODES: Record<string, number> = {
  "BIENVENUE10": 10,
  "TABASKI2026": 20,
  "LIVRAISON500": 0, // fixed, handled differently
};

export default function CartPage() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const promoCode = useCart((s) => s.promoCode);
  const promoDiscount = useCart((s) => s.promoDiscount);
  const applyPromo = useCart((s) => s.applyPromo);
  const removePromo = useCart((s) => s.removePromo);
  const getSubtotal = useCart((s) => s.getSubtotal);
  const getDiscount = useCart((s) => s.getDiscount);

  const [promoInput, setPromoInput] = React.useState("");
  const [promoError, setPromoError] = React.useState("");

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code] !== undefined) {
      applyPromo(code, PROMO_CODES[code]);
      setPromoError("");
      setPromoInput("");
    } else {
      setPromoError("Code promo invalide");
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = subtotal > 50000 ? 0 : 2500; // free shipping over 50K
  const total = subtotal - discount + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/"><YaaLogo size="sm" /></Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-yaa-green flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Continuer mes achats
            </Link>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl mb-2">Votre panier est vide</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Découvrez nos produits africains et ajoutez vos favoris au panier.
            </p>
            <Button asChild className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
              <Link href="/">Parcourir les produits <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><YaaLogo size="sm" /></Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-yaa-green flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Continuer mes achats
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <h1 className="font-display font-bold text-2xl mb-6">Mon panier ({items.length})</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={`${item.productId}-${JSON.stringify(item.variant)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4 flex gap-3">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/b/${item.slug}/p/${item.productId}`} className="font-semibold text-sm hover:text-yaa-green line-clamp-2">
                      {item.name}
                    </Link>
                    {item.variant && (item.variant.size || item.variant.color) && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.variant.size && `Taille: ${item.variant.size}`}
                        {item.variant.size && item.variant.color && " · "}
                        {item.variant.color && `Couleur: ${item.variant.color}`}
                      </p>
                    )}
                    <p className="text-sm font-bold text-yaa-green-600 mt-1">{formatFCFA(item.price)}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => remove(item.productId, item.variant)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatFCFA(item.price * item.quantity)}</p>
                  </div>
                </Card>
              </motion.div>
            ))}

            <button
              onClick={clear}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 ml-auto"
            >
              <X className="w-3 h-3" /> Vider le panier
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Promo code */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-yaa-green-500" /> Code promo
              </h3>
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
                  <div>
                    <p className="text-xs font-bold text-yaa-green-700 font-mono">{promoCode}</p>
                    <p className="text-[10px] text-muted-foreground">-{promoDiscount}% de réduction</p>
                  </div>
                  <button onClick={removePromo} className="text-rose-500 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="BIENVENUE10"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="text-sm font-mono"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  />
                  <Button onClick={handleApplyPromo} variant="outline" size="sm">Appliquer</Button>
                </div>
              )}
              {promoError && <p className="text-[10px] text-rose-600 mt-1">{promoError}</p>}
              <p className="text-[10px] text-muted-foreground mt-2">
                Essayez : BIENVENUE10 (-10%) ou TABASKI2026 (-20%)
              </p>
            </Card>

            {/* Summary */}
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold">{formatFCFA(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-yaa-green-600">
                    <span>Réduction ({promoDiscount}%)</span>
                    <span className="font-semibold">-{formatFCFA(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-yaa-green-600">Gratuite</span>
                  ) : (
                    <span className="font-semibold">{formatFCFA(shipping)}</span>
                  )}
                </div>
                {shipping > 0 && subtotal < 50000 && (
                  <p className="text-[10px] text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                    Plus que {formatFCFA(50000 - subtotal)} pour la livraison gratuite !
                  </p>
                )}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between items-baseline">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-display font-extrabold text-yaa-green-600">{formatFCFA(total)}</span>
              </div>

              <Button asChild size="lg" className="w-full mt-4 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-12">
                <Link href="/checkout">
                  Passer la commande <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-yaa-green-500" />
                  Paiement 100% sécurisé
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-yaa-green-500" />
                  Livraison 24h à Abidjan
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <ShoppingBag className="w-3.5 h-3.5 text-yaa-green-500" />
                  Paiement à la livraison disponible
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
