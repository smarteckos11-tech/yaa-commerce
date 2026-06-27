"use client";

import * as React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Store, ShoppingCart, Package } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-mesh-light flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
          <YaaLogo size="md" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <WifiOff className="w-12 h-12 text-amber-500" />
          </div>

          <h1 className="font-display font-extrabold text-2xl mb-2">
            Vous êtes hors ligne
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Pas de panique ! Certaines pages sont disponibles en cache.
            Reconnectez-vous pour accéder à toutes les fonctionnalités.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <Link href="/admin" className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <Store className="w-6 h-6 text-yaa-green-500 mb-1" />
              <span className="text-[10px] font-semibold">Dashboard</span>
            </Link>
            <Link href="/admin/produits" className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <Package className="w-6 h-6 text-yaa-orange-500 mb-1" />
              <span className="text-[10px] font-semibold">Produits</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
              <ShoppingCart className="w-6 h-6 text-purple-500 mb-1" />
              <span className="text-[10px] font-semibold">Panier</span>
            </Link>
          </div>

          <Button
            onClick={() => window.location.reload()}
            className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </Button>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            YAA Commerce — Mode hors ligne activé
          </p>
        </div>
      </footer>
    </div>
  );
}
