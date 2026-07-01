"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star, Check, Clock, Sparkles, Loader2, Code2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { MARKETPLACE_CATEGORIES, FEATURED_EXTENSIONS, ALL_EXTENSIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = React.useState("Toutes");
  const [search, setSearch] = React.useState("");
  const [installed, setInstalled] = React.useState<Set<string>>(new Set());
  const [installing, setInstalling] = React.useState<string | null>(null);
  const [waitlist, setWaitlist] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [showDevModal, setShowDevModal] = React.useState(false);
  const [devForm, setDevForm] = React.useState({ name: "", description: "", category: "Paiement", contact: "" });

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadInstalled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadInstalled() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("marketplace_extensions")
        .select("extension_name")
        .eq("user_id", user.id);
      if (error) throw error;
      setInstalled(new Set((data || []).map((d: any) => d.extension_name)));
    } catch (err) {
      console.warn("[Marketplace] load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleInstall = async (name: string, status: string, ext: any) => {
    if (status === "coming_soon") {
      // Waitlist — stored locally
      setWaitlist((prev) => new Set([...prev, name]));
      toast({ title: "Ajouté à la liste d'attente", description: `Vous serez notifié quand ${name} sera disponible.` });
      return;
    }

    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    setInstalling(name);
    try {
      if (installed.has(name)) {
        // Uninstall
        const { error } = await supabase
          .from("marketplace_extensions")
          .delete()
          .eq("user_id", user.id)
          .eq("extension_name", name);
        if (error) throw error;
        setInstalled((prev) => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
        toast({ title: "Extension désinstallée", description: name });
      } else {
        // Install
        const { error } = await supabase
          .from("marketplace_extensions")
          .insert({
            user_id: user.id,
            extension_name: name,
            extension_category: ext.category,
            developer: ext.developer,
            price: ext.price,
            status: "active",
          });
        if (error) throw error;
        setInstalled((prev) => new Set([...prev, name]));
        toast({ title: "Extension installée ✓", description: `${name} est maintenant actif sur votre boutique.` });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Action impossible",
        variant: "destructive",
      });
    } finally {
      setInstalling(null);
    }
  };

  const filtered = ALL_EXTENSIONS.filter((e) => {
    if (activeCategory !== "Toutes" && e.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.developer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande envoyée ✓",
      description: "Notre équipe vous contactera sous 48h pour discuter de votre extension.",
    });
    setShowDevModal(false);
    setDevForm({ name: "", description: "", category: "Paiement", contact: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketplace"
        subtitle={`${installed.size} extension${installed.size > 1 ? "s" : ""} installée${installed.size > 1 ? "s" : ""} · Persistance Supabase`}
        actions={
          <>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 rounded">
              {installed.size} installée{installed.size > 1 ? "s" : ""}
            </span>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600" onClick={() => setShowDevModal(true)}>
              <Plus className="w-4 h-4" /> Développer une extension
            </Button>
          </>
        }
      />

      {/* Categories */}
      <motion.div variants={item} className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {MARKETPLACE_CATEGORIES.map((c) => {
          const active = activeCategory === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setActiveCategory(active ? "Toutes" : c.name)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all hover:shadow-md",
                active ? "border-yaa-green-500 ring-2 ring-yaa-green-500/30 bg-yaa-green-50/50" : "border-border bg-card hover:border-yaa-green-300"
              )}
            >
              <div className="text-2xl mb-1">{c.emoji}</div>
              <p className="text-xs font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.count} extensions</p>
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une extension..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Featured */}
      <motion.div variants={item} className="mb-6">
        <h2 className="font-display font-semibold text-lg mb-3">⭐ Extensions à la une</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {FEATURED_EXTENSIONS.map((e, idx) => {
            const isComingSoon = e.status === "coming_soon";
            const isInstalled = installed.has(e.name);
            const isInstalling = installing === e.name;
            const isWaitlisted = waitlist.has(e.name);
            return (
              <motion.div key={e.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className={cn("p-4 hover:shadow-md transition-shadow h-full flex flex-col", isComingSoon && "opacity-90")}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yaa-orange-100 text-yaa-orange-700">{e.category}</span>
                    {isInstalled ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 px-1.5 py-0.5 rounded">
                        <Check className="h-2.5 w-2.5" /> Installée
                      </span>
                    ) : isComingSoon ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        <Clock className="h-2.5 w-2.5" /> Bientôt
                      </span>
                    ) : null}
                  </div>
                  <p className="font-semibold mb-0.5">{e.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-2">par {e.developer}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{e.description}</p>

                  {isComingSoon && (e as any).projectDescription && (
                    <div className="mb-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                      <p className="text-[10px] font-bold text-amber-700 mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Projet YAA
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{(e as any).projectDescription}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{e.rating}</span>
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{e.installs} installs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-yaa-green-600">{e.price}</span>
                    {isComingSoon ? (
                      <Button size="sm" variant="outline" disabled={isWaitlisted} onClick={() => toggleInstall(e.name, e.status, e)} className="gap-1">
                        {isWaitlisted ? <><Check className="w-3 h-3" /> En attente</> : <><Clock className="w-3 h-3" /> Liste d'attente</>}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={isInstalled ? "outline" : "default"}
                        disabled={isInstalling}
                        onClick={() => toggleInstall(e.name, e.status, e)}
                        className={cn(!isInstalled && "bg-yaa-green-500 hover:bg-yaa-green-600")}
                      >
                        {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : isInstalled ? "Configurer" : "Installer"}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* All extensions */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-3">Toutes les extensions ({filtered.length})</h2>
        <Card className="p-2">
          {filtered.map((e, idx) => {
            const isInstalled = installed.has(e.name);
            const isInstalling = installing === e.name;
            const isWaitlisted = waitlist.has(e.name);
            return (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">{e.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    {e.name}
                    {isInstalled && <Check className="h-3 w-3 text-yaa-green-500" />}
                  </p>
                  <p className="text-[11px] text-muted-foreground">par {e.developer} · {e.category}</p>
                </div>
                <div className="hidden md:flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{e.rating}</span>
                  <span className="text-muted-foreground ml-2">{e.installs}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-yaa-green-600">{e.price}</p>
                </div>
                {e.status === "coming_soon" ? (
                  <Button size="sm" variant="outline" disabled={isWaitlisted} onClick={() => toggleInstall(e.name, e.status, e)} className="gap-1">
                    {isWaitlisted ? <><Check className="w-3 h-3" /> En attente</> : "Liste d'attente"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isInstalled ? "outline" : "default"}
                    disabled={isInstalling}
                    onClick={() => toggleInstall(e.name, e.status, e)}
                    className={cn(!isInstalled && "bg-yaa-green-500 hover:bg-yaa-green-600")}
                  >
                    {isInstalling ? <Loader2 className="w-3 h-3 animate-spin" /> : isInstalled ? "Configurer" : "Installer"}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </Card>
      </motion.div>

      {/* Developer modal */}
      <Dialog open={showDevModal} onOpenChange={setShowDevModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-yaa-green-600" /> Développer une extension
            </DialogTitle>
            <DialogDescription>
              Soumettez votre projet d&apos;extension. Notre équipe vous contactera sous 48h.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDevSubmit} className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Nom de l&apos;extension *</Label>
              <Input
                required
                placeholder="Ex: Intégration Jumia API"
                className="mt-1"
                value={devForm.name}
                onChange={(e) => setDevForm({ ...devForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Catégorie</Label>
              <select
                className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                value={devForm.category}
                onChange={(e) => setDevForm({ ...devForm, category: e.target.value })}
              >
                <option value="Paiement">Paiement</option>
                <option value="Logistique">Logistique</option>
                <option value="Marketing">Marketing</option>
                <option value="Analytics">Analytics</option>
                <option value="Communication">Communication</option>
                <option value="Médias">Médias</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Description courte *</Label>
              <Textarea
                required
                rows={3}
                placeholder="Décrivez ce que fait votre extension, son utilité pour les marchands..."
                className="mt-1"
                value={devForm.description}
                onChange={(e) => setDevForm({ ...devForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email / WhatsApp de contact *</Label>
              <Input
                required
                placeholder="email@exemple.com ou +225 07 12 34 56"
                className="mt-1"
                value={devForm.contact}
                onChange={(e) => setDevForm({ ...devForm, contact: e.target.value })}
              />
            </div>
            <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 text-xs text-muted-foreground">
              <Code2 className="w-3.5 h-3.5 inline mr-1 text-yaa-green-600" />
              Notre API REST sera bientôt disponible. En attendant, décrivez votre projet et nous vous fournirons
              un accompagnement personnalisé pour le développer.
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDevModal(false)}>Annuler</Button>
              <Button type="submit" className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                <ExternalLink className="w-4 h-4" /> Soumettre
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
