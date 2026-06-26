"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Si cet email existe, un lien de réinitialisation a été envoyé.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-mesh-light flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
          </Link>
          <YaaLogo size="md" />
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-premium p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="font-display font-extrabold text-2xl">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-yaa-green-100 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-yaa-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Si un compte existe avec cet email, vous recevrez un lien sous peu.
              </p>
              <Button asChild variant="outline">
                <Link href="/login">Retour à la connexion</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="moussa@boutique.ci" required className="pl-9" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 h-11">
                {loading ? "Envoi..." : (
                  <>
                    Envoyer le lien
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
