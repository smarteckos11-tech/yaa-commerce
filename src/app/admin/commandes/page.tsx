"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, MapPin, MessageCircle, Eye, Banknote, Loader2, ShoppingCart, Package, Send, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ORDER_STATUS_COLORS, PAYMENT_COLORS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_city: string | null;
  customer_country: string | null;
  items: any;
  amount: number;
  payment_method: string | null;
  status: string;
  cod_enabled: boolean;
  cod_amount: number | null;
  cod_status: string | null;
  created_at: string;
};

const STATUS_FLOW = ["nouveau", "en_preparation", "expedie", "livre", "annule"] as const;
const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  en_preparation: "En préparation",
  expedie: "Expédié",
  livre: "Livré",
  annule: "Annulé",
};

function parseItems(items: any): string {
  if (!items) return "—";
  try {
    const parsed = typeof items === "string" ? JSON.parse(items) : items;
    if (Array.isArray(parsed)) {
      return parsed.map((i: any) => `${i.name} ×${i.quantity}`).join(", ");
    }
    return String(items);
  } catch {
    return String(items || "—");
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return "À l'instant";
    if (diffH < 24) return `Il y a ${diffH}h`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function CommandesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // SMS modal state
  const [smsModal, setSmsModal] = React.useState<{ order: Order } | null>(null);
  const [smsMessage, setSmsMessage] = React.useState("");
  const [sendingSms, setSendingSms] = React.useState(false);

  const loadOrders = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (err) {
      console.error("[Commandes] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Send automatic SMS notification on status change
  const sendSmsNotification = async (orderId: string, event: string, userId?: string) => {
    try {
      await fetch("/api/sms/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          orderId,
          userId: userId || user?.id,
        }),
      });
    } catch (err) {
      console.warn("[Commandes] SMS notify failed (non-blocking):", err);
    }
  };

  // Update order status
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "Statut mis à jour", description: `Commande → ${STATUS_LABELS[newStatus]}` });

      // Send SMS notification on key status changes (fire-and-forget)
      const smsEvent =
        newStatus === "expedie" ? "order_shipped" :
        newStatus === "livre" ? "order_delivered" :
        newStatus === "annule" ? "order_cancelled" :
        null;

      if (smsEvent) {
        sendSmsNotification(orderId, smsEvent);
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Mise à jour impossible", variant: "destructive" });
    }
  };

  // Send custom SMS to customer
  const handleSendSms = async () => {
    if (!smsModal || !smsMessage.trim()) return;
    setSendingSms(true);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: smsModal.order.customer_phone,
          message: smsMessage,
          orderId: smsModal.order.id,
          trigger: "manual",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "SMS envoyé ✓",
          description: `Vers ${data.phone} · SID: ${data.sid?.slice(0, 12)}...`,
        });
        setSmsModal(null);
        setSmsMessage("");
      } else if (data.message?.includes("non configuré")) {
        toast({
          title: "Twilio non configuré",
          description: "Configurez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans Vercel.",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error || "Échec");
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Envoi impossible",
        variant: "destructive",
      });
    } finally {
      setSendingSms(false);
    }
  };

  // Group orders by status
  const grouped = React.useMemo(() => {
    const filtered = search.trim()
      ? orders.filter(o =>
          o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase())
        )
      : orders;

    return STATUS_FLOW.map(status => ({
      status,
      orders: filtered.filter(o => o.status === status),
    }));
  }, [orders, search]);

  // Summary
  const summary = React.useMemo(() => {
    return STATUS_FLOW.map(status => ({
      status,
      count: orders.filter(o => o.status === status).length,
      total: orders.filter(o => o.status === status).reduce((s, o) => s + (o.amount || 0), 0),
    }));
  }, [orders]);

  const SUMMARY_COLORS: Record<string, string> = {
    nouveau: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    en_preparation: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    expedie: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    livre: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
    annule: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
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
        title="Commandes"
        subtitle="Suivez vos commandes en temps réel"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Export", description: "Export CSV des commandes bientôt disponible" })}>
              <Package className="w-4 h-4" /> Exporter
            </Button>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600" onClick={() => toast({ title: "Nouvelle commande", description: "Création manuelle de commande bientôt disponible" })}>
              <Plus className="w-4 h-4" /> Nouvelle commande
            </Button>
          </>
        }
      />

      {/* Summary */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {summary.map((s) => (
          <Card key={s.status} className="p-3 lg:p-4">
            <div className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded mb-2", SUMMARY_COLORS[s.status])}>
              <span className={cn("w-1.5 h-1.5 rounded-full", `bg-${s.status === 'livre' ? 'yaa-green' : s.status === 'annule' ? 'rose' : s.status === 'nouveau' ? 'sky' : s.status === 'en_preparation' ? 'amber' : 'violet'}-500`)} />
              {STATUS_LABELS[s.status]}
            </div>
            <p className="text-2xl font-display font-bold">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.total > 0 ? formatFCFA(s.total) : "—"}</p>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client ou ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-display font-bold text-lg mb-1">Aucune commande pour le moment</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Partagez votre boutique avec vos clients pour recevoir vos premières commandes.
          </p>
          <Button onClick={() => router.push("/admin/stores")} variant="outline" className="gap-1.5">
            <Package className="w-4 h-4" /> Voir ma boutique
          </Button>
        </Card>
      ) : (
        /* Kanban */
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 lg:gap-4">
          {grouped.map((col) => {
            const colors = ORDER_STATUS_COLORS[STATUS_LABELS[col.status] as keyof typeof ORDER_STATUS_COLORS] || { border: "border-slate-300", bg: "bg-muted", text: "text-muted-foreground", dot: "bg-slate-400" };
            return (
              <div key={col.status} className="flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                    <span className="text-sm font-semibold">{STATUS_LABELS[col.status]}</span>
                  </div>
                  <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{col.orders.length}</span>
                </div>
                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                  {col.orders.map((order, idx) => {
                    const pay = order.payment_method ? PAYMENT_COLORS[order.payment_method as keyof typeof PAYMENT_COLORS] : null;
                    const itemsText = parseItems(order.items);
                    const initials = order.customer_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                        <Card className={cn("p-3 border-l-4 group cursor-pointer hover:shadow-md transition-shadow", colors.border)}>
                          <div className="flex items-start gap-2 mb-2">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarFallback className="bg-muted text-[10px] font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{order.customer_name}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 truncate">
                                <MapPin className="h-2.5 w-2.5" /> {order.customer_city || "—"}, {order.customer_country || ""}
                              </p>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{itemsText}</p>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold">{formatFCFA(order.amount)}</p>
                            {pay && (
                              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5", pay.bg, pay.text)}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: pay.dot }} />
                                {order.payment_method === "Paiement à la livraison" ? "COD" : order.payment_method}
                              </span>
                            )}
                          </div>

                          {order.payment_method === "Paiement à la livraison" && (
                            <div className="mb-2 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              {order.status === "livre" ? "Cash collecté ✓" : "À collecter à la livraison"}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <p className="text-[10px] font-mono text-muted-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-muted-foreground">{formatTime(order.created_at)}</p>
                          </div>

                          {/* Status change buttons */}
                          <div className="flex gap-1 mt-2">
                            {col.status === "nouveau" && (
                              <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1" onClick={() => updateStatus(order.id, "en_preparation")}>
                                Préparer
                              </Button>
                            )}
                            {col.status === "en_preparation" && (
                              <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1" onClick={() => updateStatus(order.id, "expedie")}>
                                Expédier
                              </Button>
                            )}
                            {col.status === "expedie" && (
                              <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1 bg-yaa-green-50 text-yaa-green-700 border-yaa-green-300" onClick={() => updateStatus(order.id, "livre")}>
                                Livré ✓
                              </Button>
                            )}
                            {col.status !== "annule" && col.status !== "livre" && (
                              <Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-500" onClick={() => updateStatus(order.id, "annule")}>
                                Annuler
                              </Button>
                            )}
                          </div>

                          {/* SMS action */}
                          {order.customer_phone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] w-full mt-1 text-yaa-green-600 hover:bg-yaa-green-50 gap-1"
                              onClick={() => {
                                setSmsModal({ order });
                                setSmsMessage(`Bonjour ${order.customer_name}, votre commande ${order.id.slice(0, 8).toUpperCase()} chez notre boutique est en cours de traitement. Merci !`);
                              }}
                            >
                              <Smartphone className="w-3 h-3" /> Envoyer SMS
                            </Button>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* SMS Modal */}
      <Dialog open={!!smsModal} onOpenChange={(o) => !o && setSmsModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-yaa-green-600" /> Envoyer un SMS
            </DialogTitle>
            <DialogDescription>
              À : {smsModal?.order.customer_name} ({smsModal?.order.customer_phone})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Message</Label>
              <Textarea
                placeholder="Tapez votre message..."
                rows={4}
                className="mt-1"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                maxLength={1600}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {smsMessage.length} / 1600 caractères · 1 SMS = 160 caractères
              </p>
            </div>

            {/* Quick templates */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Préparation", msg: `Bonjour ${smsModal?.order.customer_name?.split(" ")[0] || ""}, votre commande est en préparation. Nous vous tiendrons informé(e) de l'expédition.` },
                { label: "Expédition", msg: `Votre commande a été expédiée ! Vous la recevrez sous 24-48h.` },
                { label: "Livraison", msg: `Votre commande est en cours de livraison. Le livreur vous appellera avant d'arriver.` },
                { label: "Merci", msg: `Merci pour votre confiance ! À bientôt sur notre boutique 🙏` },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setSmsMessage(tpl.msg)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-md bg-muted hover:bg-yaa-green-100 dark:hover:bg-yaa-green-950/50 text-muted-foreground hover:text-yaa-green-700"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 text-xs text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5 inline mr-1 text-yaa-green-600" />
              Le SMS sera envoyé via Twilio. Si Twilio n&apos;est pas configuré, le message sera loggé uniquement.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSmsModal(null)}>Annuler</Button>
            <Button
              onClick={handleSendSms}
              disabled={sendingSms || !smsMessage.trim()}
              className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
            >
              {sendingSms ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
