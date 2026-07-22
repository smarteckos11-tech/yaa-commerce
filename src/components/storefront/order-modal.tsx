"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Check, User, Phone, MapPin, ShoppingBag, Zap,
  Sparkles, Tag, Truck, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

export type ProductPack = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  original_price: number | null;
  badge: string | null;
  badge_color: string;
  marketing_text: string | null;
  background_color: string | null;
  text_color: string | null;
  is_default: boolean;
};

type OrderModalProps = {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    user_id: string;
  };
  slug: string;
  packs: ProductPack[];
  ctaText?: string;
  ctaBackground?: string;
  ctaColor?: string;
  ctaRadius?: string;
  freeShippingThreshold?: number;
  displayMode?: "modal" | "slide_panel" | "fullscreen";
};

export function OrderModal({
  open, onClose, product, slug, packs,
  ctaText = "Commander maintenant",
  ctaBackground = "#0F8A5F",
  ctaColor = "#ffffff",
  ctaRadius = "12px",
  freeShippingThreshold = 50000,
  displayMode = "modal",
}: OrderModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedPackId, setSelectedPackId] = React.useState<string>("single");
  const [customer, setCustomer] = React.useState({
    full_name: "", phone: "", city: "", district: "", address: "", comment: "",
  });

  // Auto-select default pack
  React.useEffect(() => {
    if (packs.length > 0) {
      const defaultPack = packs.find((p) => p.is_default);
      if (defaultPack) setSelectedPackId(defaultPack.id);
    }
  }, [packs]);

  // Compute selected pack + total
  const selectedPack = packs.find((p) => p.id === selectedPackId);
  const quantity = selectedPack ? selectedPack.quantity : 1;
  const unitPrice = selectedPack ? Math.round(selectedPack.price / selectedPack.quantity) : product.price;
  const totalPrice = selectedPack ? selectedPack.price : product.price;
  const savings = selectedPack?.original_price
    ? selectedPack.original_price - selectedPack.price
    : 0;
  const isFreeShipping = totalPrice >= freeShippingThreshold;
  const shipping = isFreeShipping ? 0 : 2500;
  const grandTotal = totalPrice + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.full_name || !customer.phone || !customer.city || !customer.address) return;

    setSubmitting(true);
    try {
      const orderData: any = {
        user_id: product.user_id,
        customer_name: customer.full_name,
        customer_phone: customer.phone,
        customer_city: customer.city,
        customer_country: "Côte d'Ivoire",
        items: JSON.stringify([{
          productId: product.id,
          name: product.name,
          price: unitPrice,
          quantity,
          pack: selectedPack?.title || null,
        }]),
        amount: grandTotal,
        payment_method: "Paiement à la livraison",
        status: "nouveau",
        cod_enabled: true,
        cod_amount: grandTotal,
        cod_status: "a_collecter",
      };

      const { data, error } = await supabase.from("orders").insert(orderData).select().single();
      if (error) throw error;

      // SMS notification (fire-and-forget)
      if (product.user_id) {
        try {
          await fetch("/api/sms/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "order_created", orderId: data.id, userId: product.user_id }),
          });
        } catch {}
      }

      onClose();
      router.push(`/checkout/success?id=${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = customer.full_name && customer.phone && customer.city && customer.address;

  // Badge colors
  const badgeColors: Record<string, string> = {
    gray: "bg-gray-200 text-gray-700",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    red: "bg-red-100 text-red-700 border-red-300",
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
  };

  // Panel classes based on display mode
  const panelClass = displayMode === "fullscreen"
    ? "w-full h-full rounded-none"
    : displayMode === "slide_panel"
    ? "w-full max-w-md h-full rounded-l-2xl ml-auto"
    : "w-full max-w-lg max-h-[90vh] rounded-2xl";
  const containerClass = displayMode === "fullscreen" || displayMode === "slide_panel"
    ? "items-stretch justify-end"
    : "items-center justify-center";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 z-50 bg-black/60 flex p-0 md:p-4", containerClass)}
          onClick={onClose}
        >
          <motion.div
            initial={displayMode === "slide_panel" ? { x: "100%" } : { scale: 0.95, opacity: 0 }}
            animate={displayMode === "slide_panel" ? { x: 0 } : { scale: 1, opacity: 1 }}
            exit={displayMode === "slide_panel" ? { x: "100%" } : { scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn("bg-white dark:bg-slate-900 overflow-y-auto flex flex-col shadow-2xl", panelClass)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{ctaText}</h3>
                  <p className="text-[10px] text-muted-foreground">Commande rapide · COD</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4">
              {/* Product recap */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 m-auto mt-3.5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFCFA(unitPrice)} / unité</p>
                </div>
              </div>

              {/* Pack selection */}
              {packs.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yaa-orange-500" /> Choisissez votre pack
                  </p>
                  <div className="space-y-2">
                    {/* Single product option */}
                    <button
                      type="button"
                      onClick={() => setSelectedPackId("single")}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        selectedPackId === "single"
                          ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20 shadow-sm"
                          : "border-slate-200 hover:border-yaa-green-300"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold">1 × {product.name}</p>
                        <p className="text-[11px] text-muted-foreground">Pack standard</p>
                      </div>
                      <span className="text-sm font-bold">{formatFCFA(product.price)}</span>
                      {selectedPackId === "single" && <Check className="w-4 h-4 text-yaa-green-500" />}
                    </button>

                    {/* Pack options */}
                    {packs.map((pack) => {
                      const packSavings = pack.original_price ? pack.original_price - pack.price : 0;
                      return (
                        <motion.button
                          key={pack.id}
                          type="button"
                          onClick={() => setSelectedPackId(pack.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden",
                            selectedPackId === pack.id
                              ? "border-yaa-orange-500 bg-yaa-orange-50/50 dark:bg-yaa-orange-950/20 shadow-md"
                              : "border-slate-200 hover:border-yaa-orange-300"
                          )}
                          style={pack.background_color ? {
                            backgroundColor: selectedPackId === pack.id ? pack.background_color : undefined,
                            color: pack.text_color || undefined,
                          } : undefined}
                        >
                          {/* Badge */}
                          {pack.badge && (
                            <span className={cn(
                              "absolute top-0 right-0 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg",
                              badgeColors[pack.badge_color] || badgeColors.gray
                            )}>
                              {pack.badge}
                            </span>
                          )}
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-bold">{pack.title}</p>
                            <p className="text-[11px] opacity-80">{pack.quantity} × {product.name}</p>
                            {packSavings > 0 && (
                              <p className="text-[10px] text-yaa-orange-600 font-semibold mt-0.5">
                                💡 Économie : {formatFCFA(packSavings)}
                              </p>
                            )}
                            {pack.marketing_text && (
                              <p className="text-[10px] opacity-70 mt-0.5">{pack.marketing_text}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatFCFA(pack.price)}</p>
                            {pack.original_price && (
                              <p className="text-[10px] line-through opacity-60">{formatFCFA(pack.original_price)}</p>
                            )}
                          </div>
                          {selectedPackId === pack.id && <Check className="w-4 h-4 text-yaa-orange-500 mt-1" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Price summary */}
              <div className="p-3 rounded-xl bg-muted/50 border space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantité</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix du pack</span>
                  <span className="font-semibold">{formatFCFA(totalPrice)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-yaa-orange-600">
                    <span>💰 Économie</span>
                    <span className="font-bold">-{formatFCFA(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  {isFreeShipping ? (
                    <span className="text-yaa-green-600 font-bold">GRATUITE 🎉</span>
                  ) : (
                    <span>{formatFCFA(shipping)}</span>
                  )}
                </div>
                {!isFreeShipping && freeShippingThreshold > totalPrice && (
                  <p className="text-[10px] text-yaa-orange-600">
                    💡 Plus que {formatFCFA(freeShippingThreshold - totalPrice)} pour la livraison gratuite
                  </p>
                )}
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t">
                  <span>Total à payer</span>
                  <span className="text-yaa-green-600">{formatFCFA(grandTotal)}</span>
                </div>
              </div>

              {/* Customer form */}
              <div className="space-y-3">
                <p className="text-xs font-semibold flex items-center gap-1">
                  <User className="w-3 h-3" /> Vos informations de livraison
                </p>
                <div>
                  <Label className="text-[11px] font-semibold">Nom complet *</Label>
                  <Input
                    required
                    placeholder="Ex: Aminata Touré"
                    value={customer.full_name}
                    onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Téléphone *</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="+225 07 12 34 56"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] font-semibold">Ville *</Label>
                    <Input
                      required
                      placeholder="Abidjan"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Quartier *</Label>
                    <Input
                      required
                      placeholder="Cocody"
                      value={customer.district}
                      onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Adresse complète *</Label>
                  <Input
                    required
                    placeholder="Rue des Jardins, Villa 12"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Commentaire (optionnel)</Label>
                  <Textarea
                    rows={2}
                    placeholder="Instructions de livraison, repère, etc."
                    value={customer.comment}
                    onChange={(e) => setCustomer({ ...customer, comment: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-around p-2 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/20">
                <div className="flex items-center gap-1 text-[10px] text-yaa-green-700">
                  <Truck className="w-3 h-3" /> Livraison 24h
                </div>
                <div className="flex items-center gap-1 text-[10px] text-yaa-green-700">
                  <ShieldCheck className="w-3 h-3" /> Paiement à la livraison
                </div>
                <div className="flex items-center gap-1 text-[10px] text-yaa-green-700">
                  <Check className="w-3 h-3" /> Retour gratuit 7j
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={submitting || !canSubmit}
                className="w-full h-12 text-base font-bold gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: ctaBackground,
                  color: ctaColor,
                  borderRadius: ctaRadius,
                  border: `2px solid ${ctaBackground}`,
                }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                ) : (
                  <><Zap className="w-4 h-4" /> {ctaText} — {formatFCFA(grandTotal)}</>
                )}
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                🔒 Vos données sont sécurisées · Confirmation immédiate
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
