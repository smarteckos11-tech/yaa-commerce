"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Loader2,
} from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Email login
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Phone OTP login
  const [phone, setPhone] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);

  // Email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Connexion réussie !");
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      setLoading(false);
    }
  };

  // Send OTP code to phone
  const handleSendOtp = async () => {
    setError(null);

    // Format phone: ensure it starts with +
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { shouldCreateUser: true },
      });

      if (error) {
        setError(error.message);
        setOtpLoading(false);
        return;
      }

      setOtpSent(true);
      toast.success("Code envoyé ! Vérifiez votre téléphone.");
      setOtpLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setOtpLoading(false);
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: "sms",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Connexion réussie !");
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Google OAuth non configuré. Activez Google dans Supabase Dashboard → Authentication → Providers.");
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
          <Link href="/signup" className="text-sm font-semibold text-slate-700 hover:text-yaa-green">
            Créer un compte
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-premium p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h1 className="font-display font-extrabold text-2xl tracking-tight">Bon retour 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connectez-vous à votre tableau de bord YAA
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 flex items-start gap-2 text-rose-700 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Google OAuth button — always visible */}
          <Button
            onClick={handleGoogleLogin}
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

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Tabs: Email vs Phone */}
          <Tabs defaultValue="email">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="email" className="flex-1 gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex-1 gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Téléphone
              </TabsTrigger>
            </TabsList>

            {/* Email login */}
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="moussa@boutique.ci"
                      required
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">Mot de passe</Label>
                    <Link href="/forgot-password" className="text-xs text-yaa-green hover:underline">
                      Oublié ?
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-9"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</>
                  ) : (
                    <>Se connecter <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Phone OTP login */}
            <TabsContent value="phone">
              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold">Numéro de téléphone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+225 07 12 34 56"
                        required
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Format international avec indicatif pays (ex: +225, +221, +233)
                    </p>
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={otpLoading || !phone}
                    className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
                  >
                    {otpLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
                    ) : (
                      <><KeyRound className="w-4 h-4" /> Envoyer le code</>
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-yaa-green-600 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Code envoyé au <span className="font-semibold">{phone}</span>.
                      Saisissez le code à 6 chiffres.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="otp" className="text-xs font-semibold">Code de vérification</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      required
                      className="mt-1 text-center text-2xl tracking-[0.5em] font-bold"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
                    ) : (
                      <>Vérifier & se connecter <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(""); setError(null); }}
                    className="w-full text-xs text-slate-500 hover:text-foreground"
                  >
                    ← Changer de numéro
                  </button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-semibold text-yaa-green hover:underline">
              Créez votre boutique gratuitement
            </Link>
          </p>

          <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-amber-700">⚠️ Configuration Supabase requise :</span>
              <p className="mt-0.5">Pour Google : Dashboard → Authentication → Providers → Google → Enable</p>
              <p>Pour Téléphone : Dashboard → Authentication → Providers → Phone → Enable + configurer SMS provider (Twilio/MessageBird)</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
