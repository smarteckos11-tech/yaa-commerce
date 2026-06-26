"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  Wallet,
  MessageCircle,
  Truck,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  Phone,
  KeyRound,
  Loader2,
  User,
} from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLANS = {
  decouverte: { name: "Découverte", price: 2900, color: "bg-slate-100 text-slate-700" },
  business: { name: "Business", price: 4900, color: "bg-yaa-orange-100 text-yaa-orange-700" },
  pro: { name: "Pro", price: 9900, color: "bg-yaa-green-100 text-yaa-green-700" },
};

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = (params.get("plan") || "decouverte") as keyof typeof PLANS;
  const plan = PLANS[planId] || PLANS.decouverte;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Email signup
  const [firstname, setFirstname] = React.useState("");
  const [lastname, setLastname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [boutiqueName, setBoutiqueName] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Phone OTP
  const [otpPhone, setOtpPhone] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);

  // Email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstname} ${lastname}`,
            phone,
            boutique_name: boutiqueName,
            plan: planId,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Update profile
      if (data.user) {
        await supabase.from("profiles").update({
          full_name: `${firstname} ${lastname}`,
          phone,
          boutique_name: boutiqueName,
          plan: planId,
        }).eq("id", data.user.id);
      }

      toast.success("Compte créé ! Redirection...");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleSignup = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin` },
      });
      if (error) setError(error.message);
    } catch {
      setError("Google OAuth non configuré. Activez-le dans Supabase Dashboard.");
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setError(null);
    let formatted = otpPhone.trim();
    if (!formatted.startsWith("+")) formatted = "+" + formatted;

    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formatted,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
        setOtpLoading(false);
        return;
      }
      setOtpSent(true);
      toast.success("Code envoyé !");
      setOtpLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setOtpLoading(false);
    }
  };

  // Verify OTP → creates account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formatted = otpPhone.trim();
    if (!formatted.startsWith("+")) formatted = "+" + formatted;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otpCode,
        type: "sms",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.phone || "",
          full_name: boutiqueName || "Nouveau marchand",
          phone: formatted,
          boutique_name: boutiqueName,
          plan: planId,
        });

        toast.success("Compte créé !");
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" /> Accueil
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
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 bg-white rounded-3xl shadow-premium overflow-hidden"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <span className={cn("inline-block text-xs font-bold px-2.5 py-1 rounded mb-3", plan.color)}>
                Plan {plan.name} · {plan.price.toLocaleString("fr-FR")} FCFA/mois
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
                Créez votre boutique
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Aucune carte bancaire requise. 14 jours d'essai gratuit.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 flex items-start gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Google */}
            <Button
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full gap-2 h-11 mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-muted-foreground">ou</span></div>
            </div>

            <Tabs defaultValue="email">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="email" className="flex-1 gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</TabsTrigger>
                <TabsTrigger value="phone" className="flex-1 gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone</TabsTrigger>
              </TabsList>

              {/* Email signup */}
              <TabsContent value="email">
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstname" className="text-xs font-semibold">Prénom</Label>
                      <Input id="firstname" required className="mt-1" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Moussa" />
                    </div>
                    <div>
                      <Label htmlFor="lastname" className="text-xs font-semibold">Nom</Label>
                      <Input id="lastname" required className="mt-1" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Diallo" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                    <Input id="email" type="email" required className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="moussa@boutique.ci" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold">Téléphone (WhatsApp)</Label>
                    <Input id="phone" type="tel" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 12 34 56" />
                  </div>
                  <div>
                    <Label htmlFor="boutique" className="text-xs font-semibold">Nom de votre boutique</Label>
                    <Input id="boutique" required className="mt-1" value={boutiqueName} onChange={(e) => setBoutiqueName(e.target.value)} placeholder="Moussa Boutique" />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-xs font-semibold">Mot de passe</Label>
                    <Input id="password" type="password" required className="mt-1" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    <p className="text-[10px] text-muted-foreground mt-1">Min. 6 caractères</p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : <>Créer ma boutique <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              {/* Phone OTP signup */}
              <TabsContent value="phone">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="boutique-phone" className="text-xs font-semibold">Nom de votre boutique</Label>
                    <Input id="boutique-phone" className="mt-1" value={boutiqueName} onChange={(e) => setBoutiqueName(e.target.value)} placeholder="Moussa Boutique" />
                  </div>

                  {!otpSent ? (
                    <div>
                      <Label htmlFor="signup-phone" className="text-xs font-semibold">Numéro de téléphone</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          required
                          className="pl-9"
                          placeholder="+225 07 12 34 56"
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Nous vous enverrons un code par SMS</p>
                      <Button
                        onClick={handleSendOtp}
                        disabled={otpLoading || !otpPhone}
                        className="w-full mt-3 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
                      >
                        {otpLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><KeyRound className="w-4 h-4" /> Envoyer le code</>}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-yaa-green-600 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">Code envoyé au <span className="font-semibold">{otpPhone}</span></p>
                      </div>
                      <div>
                        <Label htmlFor="signup-otp" className="text-xs font-semibold">Code de vérification</Label>
                        <Input
                          id="signup-otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          className="mt-1 text-center text-2xl tracking-[0.5em] font-bold"
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <Button type="submit" disabled={loading || otpCode.length !== 6} className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</> : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
                      </Button>
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="w-full text-xs text-slate-500 hover:text-foreground">
                        ← Changer de numéro
                      </button>
                    </form>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <p className="text-[10px] text-center text-muted-foreground mt-4">
              En continuant, vous acceptez nos Conditions et notre Politique de confidentialité.
            </p>
          </div>

          {/* Right side — benefits */}
          <div className="hidden lg:flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 text-white">
            <div>
              <h2 className="font-display font-bold text-xl mb-2">Tout ce dont vous avez besoin</h2>
              <p className="text-sm text-white/80 mb-6">Rejoignez 10 000+ marchands africains.</p>
              <div className="space-y-3">
                {[
                  { icon: Store, t: "Boutique en ligne illimitée", d: "Sans code, prête en 5 min" },
                  { icon: Wallet, t: "Mobile Money intégré", d: "Wave, Orange Money, MTN, Moov" },
                  { icon: MessageCircle, t: "WhatsApp Business", d: "Vendez dans vos chats" },
                  { icon: Truck, t: "Livraison Yango + DHL", d: "Express partout en Afrique" },
                  { icon: Sparkles, t: "IA YaaMind", d: "Marketing et descriptions auto" },
                ].map((item) => (
                  <div key={item.t} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.t}</p>
                      <p className="text-xs text-white/70">{item.d}</p>
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
              <p className="text-[11px] text-white/80">Aucune carte requise. Annulez à tout moment.</p>
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
