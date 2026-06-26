"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YaaLogo } from "@/components/landing/YaaLogo";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("id");

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
          <YaaLogo size="sm" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto rounded-full bg-yaa-green-100 flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-yaa-green-600" />
            </motion.div>

            <h1 className="font-display font-extrabold text-2xl mb-2">Commande confirmée ! 🎉</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Merci pour votre confiance. Votre commande a bien été enregistrée.
            </p>

            {orderId && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-xs text-muted-foreground">Numéro de commande</p>
                <p className="font-mono font-bold text-sm">{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Préparation</p>
                  <p className="text-xs text-muted-foreground">Le marchand prépare votre commande. Vous recevrez une notification WhatsApp.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                <Truck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Livraison</p>
                  <p className="text-xs text-muted-foreground">Livraison estimée sous 24h à Abidjan, 2-5 jours ailleurs en Afrique.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
                <MessageCircle className="w-5 h-5 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yaa-green-700 dark:text-yaa-green-400">Suivi WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Vous recevrez le suivi de votre commande directement sur WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" className="gap-1.5 flex-1">
                <Link href="/"><Home className="w-4 h-4" /> Accueil</Link>
              </Button>
              <Button asChild className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 flex-1">
                <Link href="/">Continuer mes achats <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen" />}>
      <SuccessContent />
    </React.Suspense>
  );
}
