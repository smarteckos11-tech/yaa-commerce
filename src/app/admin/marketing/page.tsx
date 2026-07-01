"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  Smartphone,
  MessageCircle,
  Bell,
  Zap,
  Target,
  Trash2,
  Loader2,
  Send,
  Eye,
  MousePointerClick,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// ---------- Animation ----------
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Types ----------
type CampaignChannel = "Email" | "SMS" | "WhatsApp" | "Push";
type CampaignStatus = "active" | "planifiee" | "terminee";

type Campaign = {
  id: string;
  user_id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  revenue: number;
  created_at: string;
};

// ---------- Inline channel config ----------
const CHANNEL_META: Record<
  CampaignChannel,
  {
    icon: React.ElementType;
    bg: string;
    text: string;
    bar: string;
  }
> = {
  Email: {
    icon: Mail,
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-400",
    bar: "bg-blue-500",
  },
  SMS: {
    icon: Smartphone,
    bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50",
    text: "text-yaa-green-700 dark:text-yaa-green-400",
    bar: "bg-yaa-green-500",
  },
  WhatsApp: {
    icon: MessageCircle,
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  Push: {
    icon: Bell,
    bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50",
    text: "text-yaa-orange-700 dark:text-yaa-orange-400",
    bar: "bg-yaa-orange-500",
  },
};

const CHANNEL_LIST: CampaignChannel[] = ["Email", "SMS", "WhatsApp", "Push"];

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  planifiee: "Planifiée",
  terminee: "Terminée",
};

const STATUS_STYLES: Record<CampaignStatus, string> = {
  active:
    "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  planifiee:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  terminee: "bg-muted text-muted-foreground",
};

// ---------- Inline system automations (static templates) ----------
const AUTOMATIONS: {
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  executions: number;
}[] = [
  {
    name: "Panier abandonné",
    trigger: "cart.abandoned",
    action: "Envoie un rappel WhatsApp + Email après 2h",
    active: true,
    executions: 0,
  },
  {
    name: "Bienvenue nouveau client",
    trigger: "customer.created",
    action: "Envoie un message de bienvenue + code promo -10%",
    active: true,
    executions: 0,
  },
  {
    name: "Anniversaire client",
    trigger: "customer.birthday",
    action: "Envoie une offre spéciale anniversaire",
    active: false,
    executions: 0,
  },
  {
    name: "Recommande VIP",
    trigger: "customer.vip_reached",
    action: "Notifie le commerçant + envoie une récompense",
    active: true,
    executions: 0,
  },
];

// ---------- Helpers ----------
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function safePct(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

// ---------- Component ----------
export default function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("campagnes");

  // New campaign dialog
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    channel: "Email" as CampaignChannel,
    message: "",
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<Campaign | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Status update pending
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // ---------- Load campaigns ----------
  const loadCampaigns = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (err) {
      console.error("[Marketing] Erreur de chargement:", err);
      toast({
        title: "Erreur de chargement",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de charger les campagnes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // ---------- Overall stats ----------
  const overall = React.useMemo(() => {
    const total = campaigns.length;
    const activeCount = campaigns.filter(
      (c) => c.status === "active"
    ).length;
    const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
    const totalOpened = campaigns.reduce(
      (s, c) => s + (c.opened_count || 0),
      0
    );
    const totalRevenue = campaigns.reduce(
      (s, c) => s + (c.revenue || 0),
      0
    );
    const openRate = safePct(totalOpened, totalSent);
    return { total, activeCount, totalSent, totalOpened, totalRevenue, openRate };
  }, [campaigns]);

  // ---------- Channel stats ----------
  const channelStats = React.useMemo(() => {
    return CHANNEL_LIST.map((channel) => {
      const list = campaigns.filter((c) => c.channel === channel);
      const sent = list.reduce((s, c) => s + (c.sent_count || 0), 0);
      const opened = list.reduce((s, c) => s + (c.opened_count || 0), 0);
      const rate = safePct(opened, sent);
      return { channel, sent, opened, rate, count: list.length };
    });
  }, [campaigns]);

  // ---------- Create campaign ----------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    if (!form.message.trim()) {
      toast({
        title: "Le message est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        channel: form.channel,
        status: "planifiee" as CampaignStatus,
        sent_count: 0,
        opened_count: 0,
        clicked_count: 0,
        revenue: 0,
      };

      const { data, error } = await supabase
        .from("marketing_campaigns")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setCampaigns((prev) => [data as Campaign, ...prev]);
      setShowNewDialog(false);
      setForm({ name: "", channel: "Email", message: "" });
      toast({
        title: "Campagne créée ! 🎯",
        description: `"${(data as Campaign).name}" a été planifiée avec succès.`,
      });
    } catch (err) {
      console.error("[Marketing] Erreur à la création:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de créer la campagne.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // ---------- Update campaign status ----------
  const handleStatusChange = async (
    campaign: Campaign,
    newStatus: CampaignStatus
  ) => {
    if (campaign.status === newStatus) return;
    setUpdatingId(campaign.id);
    try {
      const { error } = await supabase
        .from("marketing_campaigns")
        .update({ status: newStatus })
        .eq("id", campaign.id);

      if (error) throw error;

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, status: newStatus } : c
        )
      );
      toast({
        title: "Statut mis à jour",
        description: `"${campaign.name}" → ${STATUS_LABELS[newStatus]}`,
      });
    } catch (err) {
      console.error("[Marketing] Erreur MAJ statut:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ---------- Delete campaign ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("marketing_campaigns")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setCampaigns((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );
      toast({
        title: "Campagne supprimée",
        description: `"${deleteTarget.name}" a été supprimée.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("[Marketing] Erreur suppression:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de supprimer la campagne.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Render ----------
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Marketing"
        subtitle="Campagnes multi-canal, automatisations et performance"
        actions={
          <Button
            size="sm"
            className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus className="h-4 w-4" /> Nouvelle campagne
          </Button>
        }
      />

      {/* Overall stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6"
      >
        <StatCard
          label="Campagnes actives"
          value={overall.activeCount}
          icon="Zap"
          color="green"
          suffix={`/ ${overall.total}`}
        />
        <StatCard
          label="Total envoyés"
          value={overall.totalSent}
          icon="Send"
          color="blue"
        />
        <StatCard
          label="Taux d'ouverture"
          value={overall.openRate}
          icon="Eye"
          color="orange"
          format="percent"
        />
        <StatCard
          label="Revenu généré"
          value={overall.totalRevenue}
          icon="Wallet"
          color="emerald"
          format="fcfa"
        />
      </motion.div>

      {/* Channel stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6"
      >
        {channelStats.map((c) => {
          const meta = CHANNEL_META[c.channel];
          const Icon = meta.icon;
          return (
            <Card key={c.channel} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    meta.bg,
                    meta.text
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.channel}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {c.count} campagne{c.count > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Envoyés</p>
                  <p className="text-lg font-bold">{c.sent}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-muted-foreground">Ouverts</p>
                  <p className="text-lg font-bold">{c.opened}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full", meta.bar)}
                  style={{ width: `${c.rate}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {c.rate}% ouverture
              </p>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="campagnes">Campagnes</TabsTrigger>
            <TabsTrigger value="automatisations">
              Automatisations
            </TabsTrigger>
          </TabsList>

          {/* Campagnes */}
          <TabsContent value="campagnes" className="mt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-yaa-orange-500" />
                <p className="text-sm">Chargement des campagnes…</p>
              </div>
            ) : campaigns.length === 0 ? (
              <Card className="p-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-yaa-orange-100 dark:bg-yaa-orange-950/50 flex items-center justify-center">
                    <Target className="h-7 w-7 text-yaa-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Aucune campagne pour le moment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créez votre première campagne multi-canal pour toucher vos
                      clients.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 mt-2 bg-yaa-orange-500 hover:bg-yaa-orange-600"
                    onClick={() => setShowNewDialog(true)}
                  >
                    <Plus className="h-4 w-4" /> Nouvelle campagne
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {campaigns.map((c, idx) => {
                  const meta = CHANNEL_META[c.channel];
                  const Icon = meta.icon;
                  const isUpdating = updatingId === c.id;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              meta.bg,
                              meta.text
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded",
                              STATUS_STYLES[c.status]
                            )}
                          >
                            {STATUS_LABELS[c.status]}
                          </span>
                        </div>
                        <p className="font-semibold mb-1 line-clamp-1">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mb-3">
                          Créée le {formatDate(c.created_at)}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="flex items-center gap-1.5">
                            <Send className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Envoyés
                              </p>
                              <p className="font-bold">{c.sent_count}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Ouverts
                              </p>
                              <p className="font-bold">{c.opened_count}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Cliqués
                              </p>
                              <p className="font-bold">{c.clicked_count}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Wallet className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Revenu
                              </p>
                              <p className="font-bold text-yaa-green-600">
                                {formatFCFA(c.revenue)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={c.status}
                            onValueChange={(v) =>
                              handleStatusChange(c, v as CampaignStatus)
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="h-8 text-xs flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="planifiee">
                                Planifiée
                              </SelectItem>
                              <SelectItem value="terminee">
                                Terminée
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                            onClick={() => setDeleteTarget(c)}
                            disabled={isUpdating}
                            aria-label="Supprimer la campagne"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Automatisations */}
          <TabsContent value="automatisations" className="mt-0">
            <div className="space-y-2">
              {AUTOMATIONS.map((a, idx) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        a.active
                          ? "bg-yaa-green-100 text-yaa-green-600 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {a.action}
                      </p>
                    </div>
                    <div className="hidden md:block text-xs shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        Trigger
                      </p>
                      <code className="font-mono bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded text-[10px]">
                        {a.trigger}
                      </code>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded shrink-0",
                        a.active
                          ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </Card>
                </motion.div>
              ))}
              <p className="text-[11px] text-muted-foreground pt-2 px-1">
                💡 Les automatisations sont des modèles système prêts à
                l&apos;emploi. Activez-les depuis vos paramètres pour les
                déclencher automatiquement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* New campaign dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
            <DialogDescription>
              Créez une campagne marketing multi-canal. Elle sera planifiée
              automatiquement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="camp-name">Nom de la campagne</Label>
              <Input
                id="camp-name"
                placeholder="ex : Soldes du 15 août"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-channel">Canal</Label>
              <Select
                value={form.channel}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, channel: v as CampaignChannel }))
                }
                disabled={creating}
              >
                <SelectTrigger id="camp-channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_LIST.map((ch) => {
                    const M = CHANNEL_META[ch].icon;
                    return (
                      <SelectItem key={ch} value={ch}>
                        <span className="flex items-center gap-2">
                          <M className="h-3.5 w-3.5" />
                          {ch}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="camp-message">Message</Label>
              <Textarea
                id="camp-message"
                placeholder="Rédigez le message de votre campagne…"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                rows={4}
                required
                disabled={creating}
              />
              <p className="text-[10px] text-muted-foreground">
                {form.message.length} caractères
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewDialog(false)}
                disabled={creating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Création…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Créer la campagne
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer la campagne ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Suppression…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" /> Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
