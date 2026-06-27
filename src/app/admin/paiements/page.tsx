"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Banknote,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Link2,
  QrCode,
  ExternalLink,
  Trash2,
  Plus,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// 10 opérateurs avec leurs infos
const PROVIDERS = [
  { name: "Wave", color: "#1DC7EA", initials: "W", type: "Mobile Money", desc: "Lien de paiement Wave", placeholder: "https://pay.wave.com/m/votre-id ou wa.me/votre-numero" },
  { name: "Orange Money", color: "#FF6600", initials: "OM", type: "Mobile Money", desc: "Lien Orange Money Marchand", placeholder: "https://orange-money.ci/pay/votre-id" },
  { name: "MTN MoMo", color: "#FFCC00", initials: "MTN", type: "Mobile Money", desc: "Lien MTN MoMo", placeholder: "https://momo.mtn.ci/votre-id" },
  { name: "Moov Money", color: "#00A0E3", initials: "MV", type: "Mobile Money", desc: "Lien Moov Money", placeholder: "https://moov-africa.com/money/votre-id" },
  { name: "CinetPay", color: "#1B4D8C", initials: "CP", type: "Agrégateur", desc: "Lien CinetPay", placeholder: "https://cinetpay.com/p/votre-id" },
  { name: "Stripe", color: "#635BFF", initials: "S", type: "Carte bancaire", desc: "Lien de paiement Stripe", placeholder: "https://buy.stripe.com/votre-lien" },
  { name: "PayPal", color: "#0070BA", initials: "PP", type: "Portefeuille", desc: "Lien PayPal.me", placeholder: "https://paypal.me/votre-nom" },
  { name: "Flutterwave", color: "#F5A623", initials: "FW", type: "Agrégateur", desc: "Lien Flutterwave", placeholder: "https://flutterwave.com/pay/votre-id" },
  { name: "PayDunya", color: "#1B9E77", initials: "PD", type: "Agrégateur", desc: "Lien PayDunya", placeholder: "https://paydunya.com/votre-id" },
  { name: "Paiement à la livraison", color: "#0F8A5F", initials: "COD", type: "Cash", desc: "Pas de lien — paiement cash à la livraison", placeholder: "" },
];

type PaymentLink = {
  id: string;
  provider: string;
  link_url: string;
  phone_number: string | null;
  is_active: boolean;
};

export default function PaiementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = React.useState<PaymentLink[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState<string | null>(null);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadLinks = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setLinks((data || []) as PaymentLink[]);
    } catch (err) {
      // Table might not exist yet
      console.warn("[Paiements] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleSave = async () => {
    if (!user || !editingProvider) return;
    const provider = PROVIDERS.find(p => p.name === editingProvider);
    if (!provider) return;

    if (editingProvider !== "Paiement à la livraison" && !linkUrl) {
      toast({ title: "Lien requis", description: "Entrez votre lien de paiement", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const existing = links.find(l => l.provider === editingProvider);

      if (existing) {
        // Update
        const { error } = await supabase
          .from("payment_links")
          .update({ link_url: linkUrl || "cod", phone_number: phoneNumber || null, is_active: true })
          .eq("id", existing.id);

        if (error) throw error;

        setLinks(links.map(l => l.id === existing.id ? { ...l, link_url: linkUrl || "cod", phone_number: phoneNumber || null, is_active: true } : l));
      } else {
        // Insert
        const { data, error } = await supabase
          .from("payment_links")
          .insert({
            user_id: user.id,
            provider: editingProvider,
            link_url: linkUrl || "cod",
            phone_number: phoneNumber || null,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setLinks([...links, data as PaymentLink]);
      }

      toast({ title: "Paiement connecté ✓", description: `${provider.name} est maintenant actif` });
      setShowModal(false);
      setEditingProvider(null);
      setLinkUrl("");
      setPhoneNumber("");
    } catch (err) {
      toast({ title: "Erreur", description: "Sauvegarde impossible. Exécutez le SQL payment_links dans Supabase.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (providerName: string) => {
    const link = links.find(l => l.provider === providerName);
    if (!link) return;

    try {
      const { error } = await supabase
        .from("payment_links")
        .delete()
        .eq("id", link.id);

      if (error) throw error;

      setLinks(links.filter(l => l.id !== link.id));
      toast({ title: "Déconnecté", description: `${providerName} n'est plus actif` });
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const openModal = (providerName: string) => {
    setEditingProvider(providerName);
    const existing = links.find(l => l.provider === providerName);
    setLinkUrl(existing?.link_url && existing.link_url !== "cod" ? existing.link_url : "");
    setPhoneNumber(existing?.phone_number || "");
    setShowModal(true);
  };

  // Stats
  const connectedCount = links.length;
  const totalBalance = 0; // Pas de solde réel sans API provider

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
        title="Paiements"
        subtitle="Connectez vos comptes Mobile Money pour recevoir des paiements directs par QR code"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Synchronisation", description: "Les soldes seront disponibles quand les API seront connectées" })}>
            <RefreshCw className="w-4 w-4" /> Synchroniser
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-yaa-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{connectedCount}</p>
          <p className="text-xs text-muted-foreground">Méthodes connectées</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 dark:bg-yaa-orange-950/50 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-yaa-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{links.filter(l => l.provider !== "Paiement à la livraison").length}</p>
          <p className="text-xs text-muted-foreground">QR codes actifs</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{links.some(l => l.provider === "Paiement à la livraison") ? "1" : "0"}</p>
          <p className="text-xs text-muted-foreground">COD activé</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{connectedCount > 0 ? "100%" : "0%"}</p>
          <p className="text-xs text-muted-foreground">Taux de succès</p>
        </Card>
      </motion.div>

      {/* Providers grid */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-3">Méthodes de paiement</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Connectez vos comptes en ajoutant votre lien de paiement. Le client scannera le QR code et payera directement dans l'app de l'opérateur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {PROVIDERS.map((provider, idx) => {
            const link = links.find(l => l.provider === provider.name);
            const isConnected = !!link;

            return (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className={cn("p-4 hover:shadow-md transition-shadow h-full flex flex-col", !isConnected && "opacity-80")}>
                  {/* Color bar */}
                  <div className="h-1 rounded-full mb-3" style={{ background: provider.color }} />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: provider.color }}
                      >
                        {provider.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{provider.name}</p>
                          {isConnected && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">
                              <span className="w-1 h-1 rounded-full bg-yaa-green-500" /> Connecté
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{provider.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <p className="text-xs text-muted-foreground mb-3 flex-1">{provider.desc}</p>

                  {/* Link preview */}
                  {isConnected && link && (
                    <div className="mb-3 p-2 rounded-lg bg-muted/50 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-[10px] font-mono text-muted-foreground truncate flex-1">
                        {link.link_url === "cod" ? "Cash à la livraison" : link.link_url}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {isConnected ? (
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => openModal(provider.name)}
                      >
                        <Link2 className="w-3.5 h-3.5" /> Modifier
                      </Button>
                      {link && link.link_url !== "cod" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => window.open(link.link_url, "_blank")}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() => handleDisconnect(provider.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full mt-auto bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                      onClick={() => openModal(provider.name)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Connecter
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div variants={item} className="mt-6">
        <div className="p-4 rounded-xl bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
          <div className="flex items-start gap-3">
            <QrCode className="w-5 h-5 text-yaa-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yaa-green-700">Comment ça marche ?</p>
              <p className="text-xs text-muted-foreground mt-1">
                1. Ajoutez votre lien de paiement pour chaque opérateur (ex: lien Wave Marchand)<br/>
                2. Au checkout, le client choisit son opérateur<br/>
                3. Un QR code est généré — le client scanne et paye directement dans l'app<br/>
                4. Pour Wave : utilisez votre lien <code className="bg-white dark:bg-slate-800 px-1 rounded">https://pay.wave.com/m/votre-id</code><br/>
                5. Pour COD : aucun lien requis, le client paie en cash à la livraison
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal: Connect provider */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connecter {editingProvider}</DialogTitle>
            <DialogDescription>
              Ajoutez votre lien de paiement. Les clients scanneront le QR code pour payer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingProvider !== "Paiement à la livraison" && (
              <div>
                <Label htmlFor="link-url" className="text-xs font-semibold">Lien de paiement *</Label>
                <Input
                  id="link-url"
                  placeholder={PROVIDERS.find(p => p.name === editingProvider)?.placeholder || "https://..."}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Pour Wave : Dashboard Wave → Recevoir → Partager le lien<br/>
                  Pour Orange Money : *144# → Marchand → Lien de paiement
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="phone-number" className="text-xs font-semibold">Numéro de téléphone (optionnel)</Label>
              <Input
                id="phone-number"
                placeholder="+225 07 12 34 56"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Pour afficher sur la page de paiement</p>
            </div>

            {editingProvider !== "Paiement à la livraison" && linkUrl && (
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Aperçu QR code</p>
                  <p className="text-[10px] text-muted-foreground truncate">{linkUrl}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Sauvegarde..." : "Connecter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
