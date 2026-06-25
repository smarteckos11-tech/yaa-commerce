"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/admin"), 1200);
  };

  return (
    <div className="min-h-screen bg-mesh-light flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" />
            Accueil
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="moussa@boutique.ci" required className="pl-9" />
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
                <Input id="password" type="password" placeholder="••••••••" required className="pl-9" minLength={8} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11"
            >
              {loading ? "Connexion..." : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-muted-foreground">ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2">
              <span className="w-4 h-4 rounded bg-gradient-to-br from-red-500 via-yellow-400 to-green-500" />
              Google
            </Button>
            <Button variant="outline" className="gap-2">
              <span className="w-4 h-4 rounded bg-[#25D366] flex items-center justify-center text-white text-[8px] font-bold">W</span>
              WhatsApp
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-semibold text-yaa-green hover:underline">
              Créez votre boutique gratuitement
            </Link>
          </p>

          <div className="mt-6 p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yaa-green flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-yaa-green-700">Démo :</span> cliquez sur "Se connecter" pour explorer le dashboard sans inscription.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
