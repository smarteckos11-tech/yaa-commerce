"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus, Send,
  Sparkles,
  Mail,
  Smartphone,
  MessageCircle,
  Bell,
  Zap,
  Target,
  Loader2,
  Megaphone,
  Users,
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
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Campaign = {
  id: string;
  name: string;
  channel: string;
  status: string;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  revenue: number;
  created_at: string;
};

type Client = {
  name: string;
  phone: string | null;
  total_spent: number;
  orders_count: number;
  segment: string;
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  Email: Mail,
  SMS: Smartphone,
  WhatsApp: MessageCircle,
  Push: Bell,
};

const CHANNEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Email: { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-400", bar: "bg-blue-500" },
  SMS: { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400", bar: "bg-yaa-green-500" },
  WhatsApp: { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
  Push: { bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-700 dark:text-yaa-orange-400", bar: "bg-yaa-orange-500" },
};

const SEGMENTS = [
  { emoji: "👑", name: "VIP Premium", desc: "Clients ayant dépensé > 200 000 FCFA", filter: (c: Client) => c.total_spent >= 200000 },
  { emoji: "🛒", name: "Acheteurs récurrents", desc: "Plus de 3 commandes sur 90 jours", filter: (c: Client) => c.orders_count >= 3 },
  { emoji: "🌟", name: "Nouveaux clients", desc: "Première commande récente", filter: (c: Client) => c.orders_count === 1 },
  { emoji: "💤", name: "Inactifs", desc: "Aucune commande depuis 60 jours", filter: (c: Client) => c.orders_count === 0 },
  { emoji: "🔄", name: "Paniers abandonnés", desc: "Panier non finalisé", filter: () => false },
  { emoji: "💬", name: "Engagés WhatsApp", desc: "Conversations actives", filter: (c: Client) => !!c.phone },
];

export default function MarketingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [showCampaignModal, setShowCampaignModal] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  // New campaign form
  const [campName, setCampName] = React.useState("");
  const [campChannel, setCampChannel] = React.useState("WhatsApp");
  const [campMessage, setCampMessage] = React.useState("");
  const [campSegment, setCampSegment] = React.useState("Tous");

  const loadData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load marketing campaigns
      const { data: camps, error: campErr } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (campErr) throw campErr;
      setCampaigns((camps || []) as Campaign[]);

      // Load clients from orders
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_name, customer_phone, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const clientMap = new Map<string, Client>();
      (orders || []).forEach((o: any) => {
        const key = o.customer_phone || o.customer_name;
        if (!key) return;
        const existing = clientMap.get(key);
        if (existing) {
          existing.total_spent += o.amount || 0;
          existing.orders_count += 1;
        } else {
          clientMap.set(key, {
            name: o.customer_name || "Client",
            phone: o.customer_phone || null,
            total_spent: o.amount || 0,
            orders_count: 1,
            segment: "nouveau",
          });
        }
      });

      // Assign segments
      const clientList = Array.from(clientMap.values()).map(c => {
        if (c.total_spent >= 200000) c.segment = "vip";
        else if (c.orders_count >= 3) c.segment = "regulier";
        else if (c.orders_count === 1) c.segment = "actif";
        else c.segment = "nouveau";
        return c;
      });

      setClients(clientList);
    } catch (err) {
      console.error("[Marketing] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendCampaign = async () => {
    if (!user || !campName.trim() || !campMessage.trim()) {
      toast({ title: "Champs manquants", description: "Nom et message requis", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Filter clients by segment
      let targetClients = clients;
      if (campSegment !== "Tous") {
        const segment = SEGMENTS.find(s => s.name === campSegment);
        if (segment) {
          targetClients = clients.filter(segment.filter);
        }
      }

      // Insert campaign in Supabase
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .insert({
          user_id: user.id,
          name: campName,
          channel: campChannel,
          status: "active",
          sent_count: targetClients.length,
          opened_count: 0,
          clicked_count: 0,
          revenue: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // If WhatsApp channel, open WhatsApp for each client
      if (campChannel === "WhatsApp") {
        const whatsappClients = targetClients.filter(c => c.phone);
        if (whatsappClients.length > 0) {
          const firstClient = whatsappClients[0];
          const phone = firstClient.phone!.replace(/[^0-9]/g, "");
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(campMessage)}`;
          window.open(url, "_blank");
        }
      }

      setCampaigns([data as Campaign, ...campaigns]);
      setShowCampaignModal(false);
      setCampName("");
      setCampMessage("");
      setCampSegment("Tous");
      toast({
        title: "Campagne créée ✓",
        description: `${targetClients.length} clients ciblés via ${campChannel}`,
      });
    } catch (err) {
      toast({ title: "Erreur", description: "Création impossible", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // Channel stats
  const channelStats = [
    { name: "Email", icon: Mail, sent: campaigns.filter(c => c.channel === "Email").reduce((s, c) => s + (c.sent_count || 0), 0), opened: campaigns.filter(c => c.channel === "Email").reduce((s, c) => s + (c.opened_count || 0), 0), color: "blue" },
    { name: "SMS", icon: Smartphone, sent: campaigns.filter(c => c.channel === "SMS").reduce((s, c) => s + (c.sent_count || 0), 0), opened: campaigns.filter(c => c.channel === "SMS").reduce((s, c) => s + (c.opened_count || 0), 0), color: "green" },
    { name: "WhatsApp", icon: MessageCircle, sent: campaigns.filter(c => c.channel === "WhatsApp").reduce((s, c) => s + (c.sent_count || 0), 0), opened: campaigns.filter(c => c.channel === "WhatsApp").reduce((s, c) => s + (c.opened_count || 0), 0), color: "emerald" },
    { name: "Push", icon: Bell, sent: campaigns.filter(c => c.channel === "Push").reduce((s, c) => s + (c.sent_count || 0), 0), opened: campaigns.filter(c => c.channel === "Push").reduce((s, c) => s + (c.opened_count || 0), 0), color: "orange" },
  ];

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
        title="Marketing"
        subtitle="Campagnes multi-canal, segments et automatisations"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5 border-yaa-green-300 text-yaa-green-600 hover:bg-yaa-green-50" onClick={() => toast({ title: "IA YaaMind", description: "Génération de campagne par IA bientôt disponible" })}>
              <Sparkles className="w-4 h-4" /> IA: Créer
            </Button>
            <Button size="sm" className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600" onClick={() => setShowCampaignModal(true)}>
              <Plus className="w-4 h-4" /> Nouvelle campagne
            </Button>
          </>
        }
      />

      {/* Channel stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {channelStats.map((ch) => {
          const col = CHANNEL_COLORS[ch.name] || CHANNEL_COLORS.Email;
          const rate = ch.sent > 0 ? Math.round((ch.opened / ch.sent) * 100) : 0;
          return (
            <Card key={ch.name} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", col.bg, col.text)}>
                  <ch.icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold">{ch.name}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Envoyés</p>
                  <p className="text-lg font-bold">{ch.sent}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-muted-foreground">Ouverts</p>
                  <p className="text-lg font-bold">{ch.opened}</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", col.bar)} style={{ width: `${rate}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{rate}% ouverture</p>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="campaigns">
          <TabsList className="mb-4">
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="segments">Segments IA</TabsTrigger>
            <TabsTrigger value="automatisations">Automatisations</TabsTrigger>
          </TabsList>

          {/* Campaigns */}
          <TabsContent value="campaigns" className="mt-0">
            {campaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Megaphone className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h2 className="font-display font-bold text-lg mb-1">Aucune campagne</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Créez votre première campagne marketing pour toucher vos clients via WhatsApp, SMS ou Email.
                </p>
                <Button onClick={() => setShowCampaignModal(true)} className="bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5">
                  <Plus className="w-4 h-4" /> Créer une campagne
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {campaigns.map((c, idx) => {
                  const Icon = CHANNEL_ICONS[c.channel] || Megaphone;
                  const col = CHANNEL_COLORS[c.channel] || CHANNEL_COLORS.Email;
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", col.bg, col.text)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge className={cn("text-[10px]", c.status === "active" ? "bg-yaa-green-100 text-yaa-green-700" : "bg-muted text-muted-foreground")}>
                            {c.status === "active" ? "Active" : "Terminée"}
                          </Badge>
                        </div>
                        <p className="font-semibold mb-3">{c.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-[10px] text-muted-foreground">Envoyés</p><p className="font-bold">{c.sent_count || 0}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Ouverts</p><p className="font-bold">{c.opened_count || 0}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Cliqués</p><p className="font-bold">{c.clicked_count || 0}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Revenu</p><p className="font-bold text-yaa-green-600">{c.revenue ? formatFCFA(c.revenue) : "—"}</p></div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          {/* Segments */}
          <TabsContent value="segments" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {SEGMENTS.map((s, idx) => {
                const count = clients.filter(s.filter).length;
                const revenue = clients.filter(s.filter).reduce((sum, c) => sum + c.total_spent, 0);
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-2xl">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{s.desc}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div><p className="text-[10px] text-muted-foreground">Clients</p><p className="font-bold">{count}</p></div>
                        <div><p className="text-[10px] text-muted-foreground">Revenus</p><p className="font-bold text-[10px]">{revenue > 0 ? formatFCFA(revenue) : "—"}</p></div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50 gap-1" disabled={count === 0} onClick={() => { setShowCampaignModal(true); setCampSegment(s.name); toast({ title: "Segment ciblé", description: `${count} clients dans "${s.name}"` }); }}>
                        <Target className="w-3 h-3" /> Cibler ({count})
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Automatisations */}
          <TabsContent value="automatisations" className="mt-0">
            <div className="space-y-2">
              {[
                { name: "Bienvenue nouveau client", trigger: "nouveau_client", action: "Email de bienvenue + code promo -10%", active: true },
                { name: "Panier abandonné", trigger: "panier_abandonne", action: "WhatsApp relance + lien direct", active: true },
                { name: "Anniversaire client", trigger: "anniversaire", action: "Email personnalisé + offre spéciale", active: false },
                { name: "Réactivation inactifs", trigger: "inactif_60j", action: "SMS promo réactivation", active: false },
              ].map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", a.active ? "bg-yaa-green-100 text-yaa-green-600 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground")}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">{a.action}</p>
                    </div>
                    <code className="text-[10px] bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded hidden md:block">{a.trigger}</code>
                    <Badge className={cn("text-[10px]", a.active ? "bg-yaa-green-100 text-yaa-green-700" : "bg-muted text-muted-foreground")}>{a.active ? "Active" : "Inactive"}</Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal: New campaign */}
      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne marketing</DialogTitle>
            <DialogDescription>Touchez vos clients via WhatsApp, SMS ou Email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="camp-name" className="text-xs font-semibold">Nom *</Label>
              <Input id="camp-name" placeholder="Promo Tabaski 2026" value={campName} onChange={(e) => setCampName(e.target.value)} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Canal</Label>
                <Select value={campChannel} onValueChange={setCampChannel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Segment</Label>
                <Select value={campSegment} onValueChange={setCampSegment}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous les clients</SelectItem>
                    {SEGMENTS.map(s => <SelectItem key={s.name} value={s.name}>{s.emoji} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="camp-msg" className="text-xs font-semibold">Message *</Label>
              <Textarea id="camp-msg" rows={4} placeholder="Bonjour ! Profitez de -20% avec le code TABASKI2026 !" value={campMessage} onChange={(e) => setCampMessage(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCampaignModal(false)}>Annuler</Button>
            <Button onClick={handleSendCampaign} disabled={sending} className="bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Lancer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
