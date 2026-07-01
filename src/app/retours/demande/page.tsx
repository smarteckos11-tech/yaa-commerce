"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Send,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REASONS = [
  { value: "defect", label: "🔧 Produit défectueux", desc: "Le produit ne fonctionne pas correctement" },
  { value: "wrong_item", label: "📦 Mauvais article reçu", desc: "Vous avez reçu un autre produit que celui commandé" },
  { value: "not_as_described", label: "❌ Non conforme à la description", desc: "Le produit ne correspond pas à ce qui était annoncé" },
  { value: "damaged_shipping", label: "💥 Endommagé pendant le transport", desc: "Le colis est arrivé cassé ou abîmé" },
  { value: "changed_mind", label: "🔄 Changement d'avis", desc: "Vous ne voulez plus du produit (sous 14 jours)" },
  { value: "late_delivery", label: "⏰ Livraison tardive", desc: "Le colis est arrivé bien après la date prévue" },
  { value: "other", label: "❓ Autre raison", desc: "Expliquez dans les détails ci-dessous" },
];

const REFUND_METHODS = [
  { value: "original", label: "Méthode originale (Mobile Money / Carte)" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "moov", label: "Moov Money" },
  { value: "cash", label: "Espèces (à récupérer en boutique)" },
  { value: "store_credit", label: "Avoir boutique (crédit pour prochaine commande)" },
];

export default function RetourDemandePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-muted/30" />}>
      <RetourDemandeContent />
    </React.Suspense>
  );
}

function RetourDemandeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("order");

  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [returnId, setReturnId] = React.useState<string | null>(null);
  const [verifyingOrder, setVerifyingOrder] = React.useState(false);
  const [orderVerified, setOrderVerified] = React.useState(false);
  const [orderInfo, setOrderInfo] = React.useState<{ amount: number; customerName: string } | null>(null);

  const [form, setForm] = React.useState({
    orderId: orderIdFromUrl || "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    reason: "",
    reasonDetails: "",
    requestedRefundAmount: 0,
    itemsCount: 1,
    refundMethod: "original",
  });

  // If orderId from URL, try to verify
  React.useEffect(() => {
    if (orderIdFromUrl) {
      verifyOrder(orderIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl]);

  async function verifyOrder(id: string) {
    if (!id) return;
    setVerifyingOrder(true);
    setOrderVerified(false);
    try {
      // We can't query orders directly without auth (RLS).
      // The customer just enters the order ID — verification happens on submit.
      setOrderVerified(true);
    } catch {
      setOrderVerified(false);
    } finally {
      setVerifyingOrder(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.customerName || !form.reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setReturnId(data.returnId);
      setSubmitted(true);
      toast.success("Demande de retour envoyée ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-yaa-green-600" />
            </div>
            <h1 className="font-display font-bold text-xl mb-2">Demande envoyée ✓</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Votre demande de retour a bien été reçue. La boutique va l&apos;examiner et vous contacter sous 24-48h.
            </p>

            <div className="p-3 rounded-lg bg-muted/50 mb-4 text-left">
              <p className="text-[10px] text-muted-foreground">Numéro de retour</p>
              <p className="font-mono font-bold text-sm">{returnId?.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="space-y-2 text-left text-xs text-muted-foreground mb-6">
              <p className="font-semibold text-foreground">Prochaines étapes :</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>La boutique examine votre demande (24-48h)</li>
                <li>Vous recevez un SMS avec la décision</li>
                <li>Si approuvé, suivez les instructions pour retourner le produit</li>
                <li>Remboursement sous 5-7 jours ouvrés</li>
              </ol>
            </div>

            <Button onClick={() => router.push("/")} variant="outline" className="w-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><YaaLogo size="sm" /></Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-yaa-green flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-yaa-orange-500 to-rose-500 flex items-center justify-center mb-3">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl mb-1">Demande de retour</h1>
            <p className="text-sm text-muted-foreground">
              Remplissez ce formulaire pour demander un retour ou remboursement
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order info */}
            <Card className="p-5 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-yaa-green-600" />
                <h2 className="font-display font-semibold">Informations de commande</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="orderId" className="text-xs font-semibold">Numéro de commande *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="orderId"
                      placeholder="Ex: a1b2c3d4 (8 premiers caractères)"
                      required
                      value={form.orderId}
                      onChange={(e) => {
                        setForm({ ...form, orderId: e.target.value });
                        if (e.target.value.length >= 8) verifyOrder(e.target.value);
                      }}
                      className={cn(
                        "font-mono",
                        orderVerified && "border-yaa-green-500"
                      )}
                    />
                    {verifyingOrder && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {orderVerified && form.orderId && !verifyingOrder && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yaa-green-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Vous trouverez ce numéro dans votre email de confirmation ou sur votre reçu.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="customerName" className="text-xs font-semibold">Nom complet *</Label>
                    <Input
                      id="customerName"
                      placeholder="Ex: Aminata Touré"
                      required
                      className="mt-1"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-xs font-semibold">Téléphone *</Label>
                    <Input
                      id="customerPhone"
                      placeholder="+225 07 12 34 56"
                      required
                      className="mt-1"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail" className="text-xs font-semibold">Email (optionnel)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="aminata@email.com"
                    className="mt-1"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Reason */}
            <Card className="p-5 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-yaa-orange-500" />
                <h2 className="font-display font-semibold">Raison du retour</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">Pourquoi demandez-vous un retour ? *</Label>
                  <div className="mt-2 space-y-2">
                    {REASONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm({ ...form, reason: r.value })}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-colors text-left",
                          form.reason === r.value
                            ? "border-yaa-green-500 bg-yaa-green-50/50 dark:bg-yaa-green-950/20"
                            : "border-slate-200 hover:border-yaa-green-300"
                        )}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{r.label}</p>
                          <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                        </div>
                        {form.reason === r.value && <CheckCircle2 className="w-5 h-5 text-yaa-green-500 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reasonDetails" className="text-xs font-semibold">
                    Détails (plus il y a d&apos;infos, plus c&apos;est rapide)
                  </Label>
                  <Textarea
                    id="reasonDetails"
                    rows={4}
                    placeholder="Expliquez ce qui s'est passé, l'état du produit, ce qui ne va pas..."
                    className="mt-1"
                    value={form.reasonDetails}
                    onChange={(e) => setForm({ ...form, reasonDetails: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="itemsCount" className="text-xs font-semibold">Nombre d&apos;articles concernés</Label>
                    <Input
                      id="itemsCount"
                      type="number"
                      min="1"
                      className="mt-1"
                      value={form.itemsCount}
                      onChange={(e) => setForm({ ...form, itemsCount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="refundAmount" className="text-xs font-semibold">Montant à rembourser (FCFA)</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      min="0"
                      className="mt-1"
                      value={form.requestedRefundAmount}
                      onChange={(e) => setForm({ ...form, requestedRefundAmount: Number(e.target.value) })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Laissez 0 si vous demandez le remboursement total
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Refund method */}
            <Card className="p-5 lg:p-6">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-purple-500" />
                <h2 className="font-display font-semibold">Méthode de remboursement</h2>
              </div>

              <div>
                <Label className="text-xs font-semibold">Comment souhaitez-vous être remboursé ?</Label>
                <Select
                  value={form.refundMethod}
                  onValueChange={(v) => setForm({ ...form, refundMethod: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REFUND_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Submit */}
            <Card className="p-5 lg:p-6 bg-gradient-to-br from-yaa-green-50/50 to-yaa-orange-50/50 dark:from-yaa-green-950/20 dark:to-yaa-orange-950/20">
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Politique de retour</p>
                  <ul className="space-y-1">
                    <li>• Délai : 14 jours après réception</li>
                    <li>• Le produit doit être dans son état d&apos;origine</li>
                    <li>• Remboursement sous 5-7 jours ouvrés après réception du retour</li>
                    <li>• Les frais de retour sont à la charge du client (sauf produit défectueux)</li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !form.orderId || !form.customerName || !form.reason}
                className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-12"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="w-4 h-4" /> Envoyer la demande</>
                )}
              </Button>
            </Card>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
