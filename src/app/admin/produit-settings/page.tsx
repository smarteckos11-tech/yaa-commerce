"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Loader2, Save, Plus, Trash2, Zap, Sparkles, Package,
  Check, Settings, Palette, Type, Move, Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const BADGE_COLORS = [
  { value: "gray", label: "Gris", class: "bg-gray-200 text-gray-700" },
  { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-700" },
  { value: "red", label: "Rouge", class: "bg-red-100 text-red-700" },
  { value: "green", label: "Vert", class: "bg-green-100 text-green-700" },
  { value: "blue", label: "Bleu", class: "bg-blue-100 text-blue-700" },
];

const CTA_POSITIONS = [
  { value: "after_product_images", label: "Après les images produit" },
  { value: "before_price", label: "Avant le prix" },
  { value: "after_price", label: "Après le prix" },
  { value: "below_description", label: "Sous la description" },
  { value: "sticky_bottom_mobile", label: "Barre fixe en bas (mobile)" },
  { value: "floating_button", label: "Bouton flottant" },
];

const FORM_MODES = [
  { value: "modal", label: "Modal (centré)" },
  { value: "slide_panel", label: "Panneau latéral (slide)" },
  { value: "fullscreen", label: "Plein écran" },
];

export default function ProductSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // CTA settings
  const [cta, setCta] = React.useState({
    cta_text: "Commander maintenant",
    cta_color: "#ffffff",
    cta_background: "#0F8A5F",
    cta_border: "#0F8A5F",
    cta_radius: "12px",
    cta_size: "lg",
    cta_position: "after_product_images",
    cta_enabled: true,
    form_display_mode: "modal",
    free_shipping_threshold: 50000,
    skip_cart: true,
    show_default_packs: true,
  });

  React.useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadSettings() {
    try {
      const res = await fetch(`/api/product-settings?userId=${user!.id}`);
      const data = await res.json();
      if (data.settings) {
        setCta({ ...cta, ...data.settings });
      }
    } catch (err) {
      console.error("[Settings] Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/product-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cta, user_id: user.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Paramètres sauvegardés ✓", description: "Vos réglages sont actifs sur votre boutique." });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

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
        title="Paramètres fiche produit"
        subtitle="Personnalisez le CTA, le formulaire de commande et les packs"
        actions={
          <Button onClick={handleSave} disabled={saving} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        }
      />

      <Tabs defaultValue="cta">
        <TabsList className="mb-4">
          <TabsTrigger value="cta" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Bouton CTA</TabsTrigger>
          <TabsTrigger value="form" className="gap-1.5"><Settings className="w-3.5 h-3.5" /> Formulaire</TabsTrigger>
          <TabsTrigger value="shipping" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Livraison</TabsTrigger>
        </TabsList>

        {/* === CTA TAB === */}
        <TabsContent value="cta" className="mt-0">
          <motion.div variants={item}>
            <Card className="p-5 lg:p-6 max-w-2xl space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="font-display font-semibold">Bouton "Commander maintenant"</h2>
                </div>
                <Switch checked={cta.cta_enabled} onCheckedChange={(v) => setCta({ ...cta, cta_enabled: v })} />
              </div>

              {/* Texte */}
              <div>
                <Label className="text-xs font-semibold">Texte du bouton</Label>
                <Input value={cta.cta_text} onChange={(e) => setCta({ ...cta, cta_text: e.target.value })} className="mt-1" />
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Couleur texte</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={cta.cta_color} onChange={(e) => setCta({ ...cta, cta_color: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={cta.cta_color} onChange={(e) => setCta({ ...cta, cta_color: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Couleur fond</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={cta.cta_background} onChange={(e) => setCta({ ...cta, cta_background: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={cta.cta_background} onChange={(e) => setCta({ ...cta, cta_background: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Couleur bordure</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={cta.cta_border} onChange={(e) => setCta({ ...cta, cta_border: e.target.value })} className="w-10 h-9 rounded border cursor-pointer" />
                    <Input value={cta.cta_border} onChange={(e) => setCta({ ...cta, cta_border: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
              </div>

              {/* Rayon + Taille + Position */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Arrondi (border-radius)</Label>
                  <Input value={cta.cta_radius} onChange={(e) => setCta({ ...cta, cta_radius: e.target.value })} className="mt-1 font-mono text-xs" placeholder="12px" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Taille</Label>
                  <Select value={cta.cta_size} onValueChange={(v) => setCta({ ...cta, cta_size: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Petit</SelectItem>
                      <SelectItem value="md">Moyen</SelectItem>
                      <SelectItem value="lg">Grand</SelectItem>
                      <SelectItem value="xl">Très grand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Position</Label>
                  <Select value={cta.cta_position} onValueChange={(v) => setCta({ ...cta, cta_position: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CTA_POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="text-[10px] text-muted-foreground mb-2">Aperçu du bouton :</p>
                <button
                  className="w-full font-bold py-3 px-4 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: cta.cta_background,
                    color: cta.cta_color,
                    borderRadius: cta.cta_radius,
                    border: `2px solid ${cta.cta_border}`,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  {cta.cta_text || "Commander maintenant"}
                </button>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* === FORM TAB === */}
        <TabsContent value="form" className="mt-0">
          <motion.div variants={item}>
            <Card className="p-5 lg:p-6 max-w-2xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display font-semibold">Formulaire de commande</h2>
              </div>

              <div>
                <Label className="text-xs font-semibold">Mode d'affichage</Label>
                <Select value={cta.form_display_mode} onValueChange={(v) => setCta({ ...cta, form_display_mode: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORM_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Comment s'ouvre le formulaire quand le client clique sur "Commander maintenant"
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-semibold">Passer le panier (skip cart)</p>
                  <p className="text-[11px] text-muted-foreground">Commande directe sans passer par le panier</p>
                </div>
                <Switch checked={cta.skip_cart} onCheckedChange={(v) => setCta({ ...cta, skip_cart: v })} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-semibold">Afficher les packs par défaut</p>
                  <p className="text-[11px] text-muted-foreground">Génère automatiquement 3 packs (1x, 2x, 3x) si aucun pack personnalisé</p>
                </div>
                <Switch checked={cta.show_default_packs} onCheckedChange={(v) => setCta({ ...cta, show_default_packs: v })} />
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* === SHIPPING TAB === */}
        <TabsContent value="shipping" className="mt-0">
          <motion.div variants={item}>
            <Card className="p-5 lg:p-6 max-w-2xl space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yaa-orange-500 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-display font-semibold">Livraison</h2>
              </div>

              <div>
                <Label className="text-xs font-semibold">Seuil livraison gratuite (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={cta.free_shipping_threshold}
                  onChange={(e) => setCta({ ...cta, free_shipping_threshold: Number(e.target.value) })}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  La livraison est gratuite au-dessus de ce montant. En dessous : 2 500 FCFA.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 text-xs">
                <p className="font-semibold text-yaa-green-700 mb-1">💡 Exemple</p>
                <p className="text-muted-foreground">
                  Seuil = 50 000 FCFA → une commande de 55 000 FCFA a la livraison gratuite.
                  Une commande de 45 000 FCFA paie 2 500 FCFA de livraison.
                </p>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
