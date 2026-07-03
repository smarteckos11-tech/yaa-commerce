"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Check,
  Loader2,
  Code2,
  ExternalLink,
  Package,
  Upload,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CATEGORIES = [
  { value: "all", label: "Toutes", emoji: "🌐" },
  { value: "Paiement", label: "Paiement", emoji: "💳" },
  { value: "Logistique", label: "Logistique", emoji: "🚚" },
  { value: "Marketing", label: "Marketing", emoji: "📣" },
  { value: "Analytics", label: "Analytics", emoji: "📊" },
  { value: "Communication", label: "Communication", emoji: "💬" },
  { value: "Médias", label: "Médias", emoji: "🖼️" },
  { value: "CRM", label: "CRM", emoji: "👥" },
  { value: "Comptabilité", label: "Comptabilité", emoji: "🧮" },
  { value: "Autre", label: "Autre", emoji: "📦" },
];

const STATUS_INFO: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_review: { label: "En attente de revue", color: "text-amber-700 bg-amber-100", icon: Clock },
  approved: { label: "Approuvée", color: "text-yaa-green-700 bg-yaa-green-100", icon: CheckCircle2 },
  rejected: { label: "Rejetée", color: "text-rose-700 bg-rose-100", icon: XCircle },
  suspended: { label: "Suspendue", color: "text-rose-700 bg-rose-100", icon: XCircle },
};

type App = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  developer_name: string;
  developer_email: string;
  developer_website: string | null;
  icon_url: string | null;
  pricing_model: string;
  price_monthly: number;
  setup_fee: number;
  features: string[];
  permissions: string[];
  status: string;
  install_count: number;
  rating: number;
  review_count: number;
  created_at: string;
};

type Install = {
  id: string;
  extension_name: string;
  extension_category: string | null;
  developer: string | null;
  price: string | null;
  status: string;
  config: any;
  created_at: string;
};

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [apps, setApps] = React.useState<App[]>([]);
  const [installed, setInstalled] = React.useState<Install[]>([]);
  const [submitted, setSubmitted] = React.useState<App[]>([]);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [installing, setInstalling] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Submit form
  const [form, setForm] = React.useState({
    name: "",
    short_description: "",
    description: "",
    category: "Paiement",
    developer_name: profile?.full_name || profile?.boutique_name || "",
    developer_email: user?.email || "",
    developer_website: "",
    icon_url: "",
    pricing_model: "free",
    price_monthly: 0,
    setup_fee: 0,
    webhook_url: "",
    features: "",
    permissions: "",
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Load approved apps (public catalog)
      const appsRes = await fetch(`/api/marketplace/apps?category=${category}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      const appsData = await appsRes.json();
      if (!appsData.error) setApps(appsData.apps || []);

      // Load user's installed + submitted apps
      if (user) {
        const myAppsRes = await fetch("/api/marketplace/my-apps");
        const myAppsData = await myAppsRes.json();
        if (!myAppsData.error) {
          setInstalled(myAppsData.installed || []);
          setSubmitted(myAppsData.submitted || []);
        }
      }
    } catch (err) {
      console.error("[Marketplace] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, category, search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInstall = async (app: App) => {
    setInstalling(app.id);
    try {
      const res = await fetch("/api/marketplace/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: app.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setInstalled([...installed, data.install]);
      // Update install_count locally
      setApps(apps.map((a) => (a.id === app.id ? { ...a, install_count: a.install_count + 1 } : a)));

      toast({ title: "Application installée ✓", description: `${app.name} est maintenant active sur votre boutique.` });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Installation impossible",
        variant: "destructive",
      });
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (installId: string, appName: string) => {
    if (!confirm(`Désinstaller "${appName}" ?`)) return;
    try {
      const res = await fetch("/api/marketplace/install", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setInstalled(installed.filter((i) => i.id !== installId));
      toast({ title: "Application désinstallée", description: appName });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Désinstallation impossible",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const features = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
      const permissions = form.permissions.split("\n").map((p) => p.trim()).filter(Boolean);

      const res = await fetch("/api/marketplace/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_monthly: Number(form.price_monthly),
          setup_fee: Number(form.setup_fee),
          features,
          permissions,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSubmitted([data.app, ...submitted]);
      setShowSubmitModal(false);
      setForm({
        ...form,
        name: "",
        short_description: "",
        description: "",
        features: "",
        permissions: "",
        webhook_url: "",
      });

      toast({
        title: "Application soumise ✓",
        description: "Votre application sera examinée par notre équipe sous 48h.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Soumission impossible",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isInstalled = (appName: string) => installed.some((i) => i.extension_name === appName);

  const formatPrice = (app: App) => {
    if (app.pricing_model === "free") return "Gratuit";
    if (app.pricing_model === "freemium") return "Freemium";
    return `${app.price_monthly.toLocaleString("fr-FR")} FCFA/mois`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketplace"
        subtitle={`${apps.length} application${apps.length > 1 ? "s" : ""} disponible${apps.length > 1 ? "s" : ""} · ${installed.length} installée${installed.length > 1 ? "s" : ""}`}
        actions={
          <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600" onClick={() => setShowSubmitModal(true)}>
            <Code2 className="w-4 h-4" /> Soumettre une application
          </Button>
        }
      />

      <Tabs defaultValue="browse">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Catalogue ({apps.length})</TabsTrigger>
          <TabsTrigger value="installed">Mes applications ({installed.length})</TabsTrigger>
          <TabsTrigger value="developer">Espace développeur ({submitted.length})</TabsTrigger>
        </TabsList>

        {/* ===== CATALOGUE ===== */}
        <TabsContent value="browse" className="mt-0">
          {/* Categories */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all hover:shadow-sm",
                  category === c.value
                    ? "border-yaa-green-500 ring-2 ring-yaa-green-500/30 bg-yaa-green-50/50"
                    : "border-border bg-card hover:border-yaa-green-300"
                )}
              >
                <div className="text-xl mb-0.5">{c.emoji}</div>
                <p className="text-[10px] font-semibold">{c.label}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une application..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Apps grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
            </div>
          ) : apps.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Store className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h2 className="font-display font-bold text-lg mb-1">Aucune application disponible</h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                La marketplace est vide pour le moment. Soyez le premier à soumettre une application
                et intégrez-la à l'écosystème YAA Commerce.
              </p>
              <Button
                size="sm"
                className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                onClick={() => setShowSubmitModal(true)}
              >
                <Plus className="w-4 h-4" /> Soumettre la première application
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app, idx) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-5 hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 flex items-center justify-center flex-shrink-0">
                        {app.icon_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{app.category}</Badge>
                    </div>

                    <h3 className="font-display font-bold text-base mb-1">{app.name}</h3>
                    <p className="text-[11px] text-muted-foreground mb-2">par {app.developer_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {app.short_description || app.description?.slice(0, 120) || "Aucune description"}
                    </p>

                    {app.features && app.features.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {app.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Check className="w-3 h-3 text-yaa-green-500 flex-shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3 text-xs">
                      {app.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{app.rating.toFixed(1)}</span>
                        </span>
                      )}
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{app.install_count} install.</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm font-bold text-yaa-green-600">{formatPrice(app)}</span>
                      {isInstalled(app.name) ? (
                        <Badge className="bg-yaa-green-100 text-yaa-green-700 gap-1">
                          <Check className="w-3 h-3" /> Installée
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                          disabled={installing === app.id}
                          onClick={() => handleInstall(app)}
                        >
                          {installing === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          Installer
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== MES APPLICATIONS ===== */}
        <TabsContent value="installed" className="mt-0">
          {installed.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold">Aucune application installée</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Parcourez le catalogue pour trouver des applications qui amélioreront votre boutique.
              </p>
              <Button variant="outline" size="sm" onClick={() => (window.location.hash = "")}>
                Parcourir le catalogue
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {installed.map((install) => (
                <Card key={install.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      {install.extension_name}
                      <Badge className="bg-yaa-green-100 text-yaa-green-700 text-[10px]">Active</Badge>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      par {install.developer || "—"} · {install.extension_category || "Autre"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{install.price || "Gratuit"}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                  >
                    Configurer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => handleUninstall(install.id, install.extension_name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== ESPACE DÉVELOPPEUR ===== */}
        <TabsContent value="developer" className="mt-0">
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm mb-1">Espace développeur</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Soumettez vos applications pour qu'elles apparaissent dans la marketplace YAA Commerce.
                  Une fois approuvées, les marchands pourront les installer en un clic.
                </p>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 gap-1.5" onClick={() => setShowSubmitModal(true)}>
                  <Plus className="w-4 h-4" /> Soumettre une nouvelle application
                </Button>
              </div>
            </div>
          </div>

          {submitted.length === 0 ? (
            <Card className="p-12 text-center">
              <Code2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold">Aucune application soumise</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cliquez sur "Soumettre une nouvelle application" pour commencer.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {submitted.map((app) => {
                const statusInfo = STATUS_INFO[app.status] || STATUS_INFO.pending_review;
                const StIcon = statusInfo.icon;
                return (
                  <Card key={app.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        {app.icon_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Package className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{app.name}</p>
                          <Badge className={cn("text-[10px] gap-1", statusInfo.color)}>
                            <StIcon className="w-2.5 h-2.5" /> {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {app.short_description || app.description || "Aucune description"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span>📦 {app.category}</span>
                          <span>💰 {formatPrice(app)}</span>
                          <span>📅 {new Date(app.created_at).toLocaleDateString("fr-FR")}</span>
                          {app.status === "approved" && (
                            <span>⬇️ {app.install_count} installations</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== MODAL: SOUMETTRE UNE APPLICATION ===== */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-600" /> Soumettre une application
            </DialogTitle>
            <DialogDescription>
              Votre application sera examinée par notre équipe sous 48h avant d'apparaître dans la marketplace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Nom de l'application *</Label>
                <Input
                  required
                  placeholder="Ex: Intégration Wave Pro"
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Description courte (max 120 caractères) *</Label>
                <Input
                  required
                  maxLength={120}
                  placeholder="Paiement Wave instantané avec webhook et remboursements automatiques"
                  className="mt-1"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Description complète</Label>
                <Textarea
                  rows={4}
                  placeholder="Décrivez en détail ce que fait votre application, comment elle fonctionne, les bénéfices pour le marchand..."
                  className="mt-1"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Catégorie *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Modèle de tarification</Label>
                <Select value={form.pricing_model} onValueChange={(v) => setForm({ ...form, pricing_model: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="freemium">Freemium (gratuit + premium)</SelectItem>
                    <SelectItem value="paid">Payant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.pricing_model === "paid" && (
                <div>
                  <Label className="text-xs font-semibold">Prix mensuel (FCFA)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="mt-1"
                    value={form.price_monthly}
                    onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold">Frais d'installation (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  className="mt-1"
                  value={form.setup_fee}
                  onChange={(e) => setForm({ ...form, setup_fee: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Nom du développeur *</Label>
                <Input
                  required
                  placeholder="Ex: YAA Technologies"
                  className="mt-1"
                  value={form.developer_name}
                  onChange={(e) => setForm({ ...form, developer_name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Email développeur *</Label>
                <Input
                  required
                  type="email"
                  placeholder="dev@exemple.com"
                  className="mt-1"
                  value={form.developer_email}
                  onChange={(e) => setForm({ ...form, developer_email: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Site web (optionnel)</Label>
                <Input
                  placeholder="https://votre-site.com"
                  className="mt-1"
                  value={form.developer_website}
                  onChange={(e) => setForm({ ...form, developer_website: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">URL icône (optionnel)</Label>
                <Input
                  placeholder="https://.../icon.png"
                  className="mt-1"
                  value={form.icon_url}
                  onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Webhook URL (pour recevoir les événements)</Label>
                <Input
                  placeholder="https://votre-app.com/webhooks/yaa"
                  className="mt-1"
                  value={form.webhook_url}
                  onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  YAA enverra les événements (commandes, paiements, etc.) à cette URL
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Fonctionnalités (une par ligne)</Label>
                <Textarea
                  rows={3}
                  placeholder={"Paiement instantané\nRemboursements automatiques\nWebhooks temps réel"}
                  className="mt-1"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Permissions requises (une par ligne)</Label>
                <Textarea
                  rows={2}
                  placeholder={"read:orders\nwrite:products"}
                  className="mt-1"
                  value={form.permissions}
                  onChange={(e) => setForm({ ...form, permissions: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 text-xs text-muted-foreground">
              <Code2 className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
              Notre équipe examinera votre application sous 48h. Vous recevrez un email à{" "}
              <strong>{form.developer_email || "votre email"}</strong> avec le résultat.
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>Annuler</Button>
              <Button type="submit" disabled={submitting} className="bg-purple-500 hover:bg-purple-600 gap-1.5">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Soumission...</> : <><Upload className="w-4 h-4" /> Soumettre</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
