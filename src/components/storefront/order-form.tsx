"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Check,
  User,
  Phone,
  MapPin,
  Mail,
  Wallet,
  Banknote,
  CreditCard,
  ShoppingCart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", desc: "Paiement instantané", icon: "W", color: "bg-sky-500" },
  { id: "orange_money", label: "Orange Money", desc: "Mobile Money", icon: "OM", color: "bg-orange-500" },
  { id: "mtn_momo", label: "MTN MoMo", desc: "Mobile Money", icon: "MTN", color: "bg-yellow-400 text-slate-900" },
  { id: "moov", label: "Moov Money", desc: "Mobile Money", icon: "M", color: "bg-blue-600" },
  { id: "cod", label: "Paiement à la livraison", desc: "Cash à réception", icon: "COD", color: "bg-yaa-green-500" },
];

type OrderFormProps = {
  /** Produits à commander — peut être un seul produit ou les items d'un bundle */
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  /** Boutique user_id (pour lier la commande au marchand) */
  userId?: string;
  /** Slug de la boutique (pour rediriger vers la page succès) */
  slug: string;
  /** Titre affiché en haut du formulaire */
  title?: string;
  /** Prix total (si bundle, c'est le prix du bundle; sinon calcul auto) */
  fixedTotal?: number;
  /** Promo code appliqué (optionnel) */
  promoCode?: string | null;
  /** Réduction en % (optionnel) */
  promoDiscount?: number;
  /** Callback quand la commande est créée */
  onSuccess?: (orderId: string) => void;
  /** Classe CSS supplémentaire */
  className?: string;
};

export function OrderForm({
  items,
  userId,
  slug,
  title = "Commander maintenant",
  fixedTotal,
  promoCode,
  promoDiscount = 0,
  onSuccess,
  className,
}: OrderFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("cod");
  const [customer, setCustomer] = React.useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Côte d'Ivoire",
    notes: "",
  });

  // Calculer le total
  const subtotal = fixedTotal ?? items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round((subtotal * promoDiscount) / 100);
  const shipping = 2500; // frais de livraison par défaut (Yango)
  const total = subtotal - discount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      return;
    }

    setSubmitting(true);
    try {
      const paymentLabel =
        PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || "Paiement à la livraison";

      const orderData: any = {
        user_id: userId || null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || null,
        customer_city: customer.city,
        customer_country: customer.country,
        items: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          }))
        ),
        amount: total,
        payment_method: paymentLabel,
        status: "nouveau",
        cod_enabled: paymentMethod === "cod",
        cod_amount: paymentMethod === "cod" ? total : null,
        cod_status: paymentMethod === "cod" ? "a_collecter" : null,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // SMS notification (fire and forget)
      if (customer.phone && userId) {
        try {
          await fetch("/api/sms/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "order_created",
              orderId: data.id,
              userId,
            }),
          });
        } catch {}
      }

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

  const canSubmit = customer.name && customer.phone && customer.address && customer.city;

  return (
    <Card className={cn("p-5 lg:p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-display font-bold text-base">{title}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Récapitulatif */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs font-semibold mb-2">Récapitulatif</p>
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1">{item.name} ×{item.quantity}</span>
                <span className="font-semibold ml-2">{formatFCFA(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-2 pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-yaa-green-600">
                <span>Réduction ({promoDiscount}%)</span>
                <span>-{formatFCFA(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison (Yango)</span>
              <span>{formatFCFA(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t">
              <span>Total</span>
              <span className="text-yaa-green-600">{formatFCFA(total)}</span>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1">
            <User className="w-3 h-3" /> Vos informations
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              placeholder="Nom complet *"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="text-sm h-9"
            />
            <Input
              required
              placeholder="Téléphone *"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <Input
            type="email"
            placeholder="Email (optionnel)"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className="text-sm h-9"
          />
        </div>

        {/* Adresse de livraison */}
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Livraison
          </p>
          <Input
            required
            placeholder="Adresse complète *"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            className="text-sm h-9"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              placeholder="Ville *"
              value={customer.city}
              onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
              className="text-sm h-9"
            />
            <Input
              placeholder="Pays"
              value={customer.country}
              onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <Textarea
            placeholder="Notes de livraison (optionnel)"
            rows={2}
            value={customer.notes}
            onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
            className="text-sm"
          />
        </div>

        {/* Mode de paiement */}
        <div className="space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Paiement
          </p>
          <div className="space-y-1.5">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "w-full flex items-center gap-2 p-2.5 rounded-lg border-2 transition-colors text-left",
                  paymentMethod === method.id
                    ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20"
                    : "border-slate-200 hover:border-yaa-green-300"
                )}
              >
                <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0", method.color)}>
                  {method.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{method.label}</p>
                  <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                </div>
                {paymentMethod === method.id && (
                  <Check className="w-4 h-4 text-yaa-green-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting || !canSubmit}
          className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-2 h-11"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
          ) : (
            <>Commander — {formatFCFA(total)}</>
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          🔒 Vos données sont sécurisées · Confirmation immédiate
        </p>
      </form>
    </Card>
  );
}
