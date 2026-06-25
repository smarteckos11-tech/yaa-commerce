"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Store, Wallet, MessageCircle, Truck, Sparkles, ShieldCheck } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PLANS = {
  decouverte: { name: "Découverte", price: 2900, color: "bg-slate-100 text-slate-700" },
  business: { name: "Business", price: 4900, color: "bg-yaa-orange-100 text-yaa-orange-700" },
  pro: { name: "Pro", price: 9900, color: "bg-yaa-green-100 text-yaa-green-700" },
};

const FEATURES = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp Business", desc: "Catalogue, réponses auto, paiements dans le chat" },
  livraison: { icon: Truck, label: "Livraison Yango + DHL", desc: "Express Abidjan, intérieur du pays, international" },
  ia: { icon: Sparkles, label: "IA YaaMind", desc: "Descriptions produits, prévisions, marketing auto" },
};

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = (params.get("plan") || "decouverte") as keyof typeof PLANS;
  const featureId = params.get("feature") as keyof typeof FEATURES | null;
  const plan = PLANS[planId] || PLANS.decouverte;
  const feature = featureId ? FEATURES[featureId] : null;

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/admin"), 1500);
  };

  return (
    <div className="min-h-screen bg-mesh-light flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <YaaLogo size="md" />
          <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-yaa-green">
            Se connecter
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 bg-white rounded-3xl shadow-premium overflow-hidden"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded mb-3", plan.color)}>
                Plan {plan.name} · {plan.price.toLocaleString("fr-FR")} FCFA/mois
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                Créez votre boutique en 5 minutes
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Aucune carte bancaire requise. 14 jours d'essai gratuit.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstname" className="text-xs font-semibold">Prénom</Label>
                  <Input id="firstname" name="firstname" placeholder="Moussa" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastname" className="text-xs font-semibold">Nom</Label>
                  <Input id="lastname" name="lastname" placeholder="Diallo" required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-semibold">Email professionnel</Label>
                <Input id="email" name="email" type="email" placeholder="moussa@boutique.ci" required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-semibold">Téléphone (WhatsApp)</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+225 07 12 34 56" required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="boutique" className="text-xs font-semibold">Nom de votre boutique</Label>
                <Input id="boutique" name="boutique" placeholder="Moussa Boutique" required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="password" className="text-xs font-semibold">Mot de passe</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required className="mt-1" minLength={8} />
                <p className="text-[10px] text-muted-foreground mt-1">Min. 8 caractères</p>
              </div>

              {feature && (
                <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-start gap-2.5">
                  <feature.icon className="w-5 h-5 text-yaa-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-yaa-green-700">{feature.label}</p>
                    <p className="text-[11px] text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
              >
                {loading ? "Création en cours..." : (
                  <>
                    Créer ma boutique gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                En continuant, vous acceptez nos{" "}
                <Link href="/legal/terms" className="underline hover:text-foreground">Conditions</Link> et{" "}
                <Link href="/legal/privacy" className="underline hover:text-foreground">Politique de confidentialité</Link>.
              </p>
            </form>
          </div>

          <div className="hidden lg:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 text-white">
            <div>
              <h2 className="font-display font-bold text-xl mb-2">
                Tout ce dont vous avez besoin pour démarrer
              </h2>
              <p className="text-sm text-white/80 mb-6">
                Rejoignez plus de 10 000 marchands africains qui transforment leur business avec YAA.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Store, title: "Boutique en ligne illimitée", desc: "Sans code, prête en 5 minutes" },
                  { icon: Wallet, title: "Mobile Money intégré", desc: "Wave, Orange Money, MTN MoMo, Moov" },
                  { icon: MessageCircle, title: "WhatsApp Business", desc: "Vendez directement dans vos chats" },
                  { icon: Truck, title: "Livraison Yango + DHL", desc: "Express à Abidjan, partout en Afrique" },
                  { icon: Sparkles, title: "IA YaaMind incluse", desc: "Descriptions produits, marketing auto" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-white/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold">Essai gratuit 14 jours</span>
              </div>
              <p className="text-[11px] text-white/80">
                Aucune carte bancaire requise. Annulez à tout moment.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen" />}>
      <SignupForm />
    </React.Suspense>
  );
}
