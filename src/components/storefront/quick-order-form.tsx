"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Check,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  X,
  Sparkles,
  ShieldCheck,
  Truck,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

const BADGE_COLORS: Record<string, string> = {
  gray: "bg-slate-100 text-slate-600",
  orange: "bg-yaa-orange-100 text-yaa-orange-700",
  red: "bg-rose-100 text-rose-700",
  green: "bg-yaa-green-100 text-yaa-green-700",
};

export type ProductPack = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  badge?: string;
  badge_color?: string;
  marketing_text?: string;
  is_default?: boolean;
};

type OrderFormProps = {
  /** Produit à commander */
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    user_id: string;
  };
  /** Slug de la boutique */
  slug: string;
  /** Packs disponibles (optionnel) */
  packs?: ProductPack[];
  /** Mode d'affichage */
  displayMode?: "modal" | "slide_panel" | "fullscreen" | "inline";
  /** CTA custom (texte, couleur, etc.) */
  ctaText?: string;
  ctaColor?: string;
  ctaRadius?: number;
  /** Callback quand la commande est créée */
  onSuccess?: (orderId: string) => void;
};

export function QuickOrderForm({
  product,
  slug,
  packs = [],
  displayMode = "modal",
  ctaText = "Commander maintenant",
  ctaColor = "#0F8A5F",
  ctaRadius = 12,
  onSuccess,
}: OrderFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedPackId, setSelectedPackId] = React.useState<string>(
    packs.find((p) => p.is_default)?.id || packs[0]?.id || ""
  );

  // Determine selected pack + quantity + price
  const selectedPack = packs.find((p) => p.id === selectedPackId);
  const quantity = selectedPack?.quantity || 1;
  const unitPrice = selectedPack ? Math.round(selectedPack.price / selectedPack.quantity) : product.price;
  const totalPrice = selectedPack?.price || product.price;

  // Calculate savings (vs buying individually)
  const individualPrice = product.price * quantity;
  const savings = individualPrice - totalPrice;
  const savingsPercent = individualPrice > 0 ? Math.round((savings / individualPrice) * 100) : 0;

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 50000;
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : 2500;
  const grandTotal = totalPrice + shipping;

  // Form fields
  const [form, setForm] = React.useState({
    full_name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.city || !form.address) return;

    setSubmitting(true);
    try {
      const orderData = {
        user_id: product.user_id,
        customer_name: form.full_name,
        customer_phone: form.phone,
        customer_city: form.city,
        customer_country: "Côte d'Ivoire",
        items: JSON.stringify([
          {
            productId: product.id,
            name: `${product.name}${selectedPack ? ` (${selectedPack.title})` : ""}`,
            price: totalPrice,
            quantity,
          },
        ]),
        amount: grandTotal,
        payment_method: "Paiement à la livraison",
        status: "nouveau",
        cod_enabled: true,
        cod_amount: grandTotal,
        cod_status: "a_collecter",
      };

      const { data, error } = await supabase.from("orders").insert(orderData).select().single();
      if (error) throw error;

      // SMS notification
      try {
        await fetch("/api/sms/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "order_created", orderId: data.id, userId: product.user_id }),
        });
      } catch {}

      setIsOpen(false);
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        router.push(`/checkout/success?id=${data.id}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = form.full_name && form.phone && form.city && form.address;

  // CTA button
  const ctaButton = (
    <Button
      size="lg"
      onClick={() => setIsOpen(true)}
      className="w-full gap-2 h-14 text-base font-bold shadow-lg hover:scale-[1.02] transition-transform"
      style={{
        backgroundColor: ctaColor,
        borderColor: ctaColor,
        borderRadius: `${ctaRadius}px`,
      }}
    >
      <ShoppingCart className="w-5 h-5" />
      {ctaText}
      <span className="ml-1 opacity-90">— {formatFCFA(totalPrice)}</span>
    </Button>
  );

  // Render different display modes
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Pack selector */}
      {packs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yaa-orange-500" /> Choisissez votre pack
          </p>
          <div className="space-y-1.5">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              const packSavings = product.price * pack.quantity - pack.price;
              const packSavingsPercent = product.price * pack.quantity > 0
                ? Math.round((packSavings / (product.price * pack.quantity)) * 100) : 0;

              return (
                <motion.button
                  key={pack.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left relative",
                    isSelected
                      ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20 shadow-md"
                      : "border-slate-200 hover:border-yaa-green-300"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold">{pack.title}</p>
                      {pack.badge && (
                        <Badge className={cn("text-[9px] font-bold", BADGE_COLORS[pack.badge_color || "gray"])}>
                          {pack.badge}
                        </Badge>
                      )}
                    </div>
                    {pack.marketing_text && (
                      <p className="text-[10px] text-muted-foreground">{pack.marketing_text}</p>
                    )}
                    {packSavings > 0 && (
                      <p className="text-[10px] text-yaa-orange-600 font-semibold mt-0.5">
                        💰 Économisez {formatFCFA(packSavings)} ({packSavingsPercent}%)
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(pack.price)}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {formatFCFA(Math.round(pack.price / pack.quantity))}/unité
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-yaa-green-500" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="p-3 rounded-lg bg-muted/50 border">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{product.name} ×{quantity}</span>
          <span className="font-semibold">{formatFCFA(totalPrice)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-xs text-yaa-green-600 mb-1">
            <span>💰 Économie</span>
            <span>-{formatFCFA(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">🚚 Livraison</span>
          {isFreeShipping ? (
            <span className="text-yaa-green-600 font-bold">GRATUITE 🎉</span>
          ) : (
            <span>{formatFCFA(shipping)}</span>
          )}
        </div>
        {!isFreeShipping && (
          <p className="text-[10px] text-yaa-orange-600 mb-1">
            💡 Plus que {formatFCFA(FREE_SHIPPING_THRESHOLD - totalPrice)} pour la livraison gratuite
          </p>
        )}
        <div className="flex justify-between font-bold text-sm pt-1 border-t">
          <span>Total à payer</span>
          <span className="text-yaa-green-600">{formatFCFA(grandTotal)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Banknote className="w-3 h-3" /> Paiement à la livraison (cash)
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-2">
        <div>
          <Label className="text-xs font-semibold">Nom complet *</Label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              required
              placeholder="Ex: Aminata Touré"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="pl-9 h-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold">Téléphone *</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              required
              type="tel"
              placeholder="+225 07 12 34 56"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="pl-9 h-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-semibold">Ville *</Label>
            <Input
              required
              placeholder="Abidjan"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Quartier</Label>
            <Input
              placeholder="Cocody"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold">Adresse complète *</Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              required
              placeholder="Rue des Jardins, Villa 12"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="pl-9 h-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold">Commentaire (optionnel)</Label>
          <Textarea
            placeholder="Instructions de livraison, repère, etc."
            rows={2}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="text-sm"
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting || !canSubmit}
        className="w-full h-12 text-base font-bold gap-2"
        style={{
          backgroundColor: ctaColor,
          borderColor: ctaColor,
          borderRadius: `${ctaRadius}px`,
        }}
      >
        {submitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
        ) : (
          <>✅ Confirmer ma commande — {formatFCFA(grandTotal)}</>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Sécurisé</span>
        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Livraison 24h</span>
        <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> Cash à la livraison</span>
      </div>
    </form>
  );

  // Inline mode (no modal)
  if (displayMode === "inline") {
    return <div className="space-y-3">{renderForm()}</div>;
  }

  // Modal / slide_panel / fullscreen
  return (
    <>
      {/* CTA button */}
      {ctaButton}

      {/* Form display */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
              className={cn(
                displayMode === "fullscreen" && "max-w-full w-full h-full max-h-full rounded-none",
                displayMode === "slide_panel" && "max-w-md ml-auto mr-0 h-full max-h-full rounded-l-2xl",
                displayMode === "modal" && "max-w-lg max-h-[90vh] overflow-y-auto"
              )}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" style={{ color: ctaColor }} />
                    Commander maintenant
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {renderForm()}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
