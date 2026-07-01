"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Truck,
  Wallet,
  Banknote,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatFCFA = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

const SHIPPING_METHODS = [
  { id: "yango", label: "Yango Express", desc: "Livraison 2h à Abidjan", price: 2500, icon: "🛵" },
  { id: "local", label: "Coursier local", desc: "24-48h dans votre ville", price: 1500, icon: "📦" },
  { id: "dhl", label: "DHL Express", desc: "International 2-5 jours", price: 8500, icon: "✈️" },
  { id: "pickup", label: "Retrait en boutique", desc: "Gratuit, disponible sous 2h", price: 0, icon: "🏪" },
];

const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", desc: "Paiement instantané", icon: "W", color: "bg-sky-500" },
  { id: "orange_money", label: "Orange Money", desc: "Paiement Mobile Money", icon: "OM", color: "bg-orange-500" },
  { id: "mtn_momo", label: "MTN MoMo", desc: "Paiement Mobile Money", icon: "MTN", color: "bg-yellow-400 text-slate-900" },
  { id: "cod", label: "Paiement à la livraison", desc: "Payez en cash à réception", icon: "COD", color: "bg-yaa-green-500" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const promoCode = useCart((s) => s.promoCode);
  const promoDiscount = useCart((s) => s.promoDiscount);
  const getSubtotal = useCart((s) => s.getSubtotal());
  const getDiscount = useCart((s) => s.getDiscount());

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [loading, setLoading] = React.useState(false);
  const [shippingMethod, setShippingMethod] = React.useState("yango");
  const [paymentMethod, setPaymentMethod] = React.useState("wave");

  // Customer info
  const [customer, setCustomer] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Côte d'Ivoire",
    notes: "",
  });

  const subtotal = getSubtotal;
  const discount = getDiscount;
  const shipping = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.price || 0;
  const total = subtotal - discount + shipping;

  // Redirect to cart if empty
  React.useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items, router]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create order in Supabase
      const { data: { user } } = await supabase.auth.getUser();

      const orderData = {
        user_id: user?.id || null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        customer_city: customer.city,
        customer_country: customer.country,
        items: JSON.stringify(items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          variant: i.variant,
        }))),
        amount: total,
        payment_method: PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || "Wave",
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

      // Send automatic SMS notification to customer (order_created)
      // This is fire-and-forget — we don't block the order flow on SMS
      if (customer.phone) {
        try {
          await fetch("/api/sms/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "order_created",
              orderId: data.id,
              userId: user?.id,
            }),
          });
        } catch (smsErr) {
          console.warn("[Checkout] SMS notification failed (non-blocking):", smsErr);
        }
      }

      // Clear cart
      clear();

      // Redirect to success page
      router.push(`/checkout/success?id=${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la commande");
      setLoading(false);
    }
  };

  const canProceedStep1 = customer.name && customer.phone && customer.address && customer.city;
  const canProceedStep2 = shippingMethod;
  const canProceedStep3 = paymentMethod;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><YaaLogo size="sm" /></Link>
          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                  step >= s ? "bg-yaa-green-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div className={cn("w-8 h-0.5", step > s ? "bg-yaa-green-500" : "bg-muted")} />}
              </div>
            ))}
          </div>
          <Link href="/cart" className="text-sm text-slate-600 hover:text-yaa-green flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Panier
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Customer info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yaa-green-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-yaa-green-600" />
                    </div>
                    <h2 className="font-display font-semibold">Vos informations</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name" className="text-xs font-semibold">Nom complet *</Label>
                      <Input id="name" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Mariam Sow" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs font-semibold">Téléphone (WhatsApp) *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+225 07 12 34 56" className="pl-9" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="mariam@email.com" className="pl-9" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="text-xs font-semibold">Adresse de livraison *</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="address" required value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Cocody, Rue des Jardins, Villa 12" className="pl-9" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-xs font-semibold">Ville *</Label>
                      <Input id="city" required value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} placeholder="Abidjan" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-xs font-semibold">Pays</Label>
                      <Input id="country" value={customer.country} onChange={(e) => setCustomer({ ...customer, country: e.target.value })} className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="notes" className="text-xs font-semibold">Notes (optionnel)</Label>
                      <Input id="notes" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} placeholder="Instructions de livraison, repère, etc." className="mt-1" />
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full mt-4 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  >
                    Continuer vers la livraison <ArrowRight className="w-4 h-4" />
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yaa-green-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-yaa-green-600" />
                    </div>
                    <h2 className="font-display font-semibold">Mode de livraison</h2>
                  </div>
                  <div className="space-y-2">
                    {SHIPPING_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setShippingMethod(method.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left",
                          shippingMethod === method.id ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20" : "border-slate-200 hover:border-yaa-green-300"
                        )}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{method.label}</p>
                          <p className="text-[11px] text-muted-foreground">{method.desc}</p>
                        </div>
                        <span className="font-bold text-sm">{method.price === 0 ? "Gratuit" : formatFCFA(method.price)}</span>
                        {shippingMethod === method.id && <CheckCircle2 className="w-5 h-5 text-yaa-green-500" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                      Continuer vers le paiement <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yaa-green-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-yaa-green-600" />
                    </div>
                    <h2 className="font-display font-semibold">Mode de paiement</h2>
                  </div>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left",
                          paymentMethod === method.id ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20" : "border-slate-200 hover:border-yaa-green-300"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs", method.color)}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{method.label}</p>
                          <p className="text-[11px] text-muted-foreground">{method.desc}</p>
                        </div>
                        {paymentMethod === method.id && <CheckCircle2 className="w-5 h-5 text-yaa-green-500" />}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="mt-3 p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-start gap-2">
                      <Banknote className="w-4 h-4 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-yaa-green-700">Paiement à la livraison :</span> Vous payez {formatFCFA(total)} en cash au livreur à réception du colis. Aucun paiement en ligne requis.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Retour
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-12"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                      ) : (
                        <>Confirmer la commande — {formatFCFA(total)}</>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-yaa-green-500" />
              Vos données sont sécurisées et chiffrées · Supabase + SSL
            </div>
          </div>

          {/* Right — Summary */}
          <div>
            <Card className="p-5 sticky top-20">
              <h3 className="font-display font-semibold mb-3">Votre commande</h3>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex gap-2">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Store className="w-4 h-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold">{formatFCFA(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-sm border-t pt-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatFCFA(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-yaa-green-600"><span>Réduction ({promoDiscount}%)</span><span>-{formatFCFA(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{shipping === 0 ? "Gratuit" : formatFCFA(shipping)}</span></div>
                <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Total</span><span className="text-yaa-green-600">{formatFCFA(total)}</span></div>
              </div>
              {promoCode && <p className="text-[10px] text-yaa-green-600 mt-2">Code "{promoCode}" appliqué</p>}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
