"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  MoreHorizontal,
  Mail,
  Crown,
  Loader2,
  Users,
  Wallet,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  total_spent: number;
  orders_count: number;
  last_order_at: string | null;
  loyalty: number;
  segment: string;
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return "À l'instant";
    if (diffH < 24) return `Il y a ${diffH}h`;
    if (diffH < 168) return `Il y a ${Math.floor(diffH / 24)}j`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}

function getLoyaltyColor(value: number): string {
  if (value >= 80) return "bg-yaa-green-500";
  if (value >= 60) return "bg-yaa-orange-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function getSegment(totalSpent: number, ordersCount: number): string {
  if (totalSpent >= 200000) return "vip";
  if (ordersCount >= 5) return "regulier";
  if (ordersCount >= 1) return "actif";
  return "nouveau";
}

const SEGMENT_LABELS: Record<string, string> = {
  vip: "VIP",
  regulier: "Régulier",
  actif: "Actif",
  nouveau: "Nouveau",
};

const SEGMENT_COLORS: Record<string, string> = {
  vip: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  regulier: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  actif: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  nouveau: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
};

export default function ClientsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [segmentFilter, setSegmentFilter] = React.useState("all");

  const loadClients = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Récupérer toutes les commandes pour extraire les clients
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, customer_email, customer_city, customer_country, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Grouper par téléphone (ou nom si pas de téléphone)
      const clientMap = new Map<string, Client>();

      (orders || []).forEach((order: any) => {
        const key = order.customer_phone || order.customer_name || order.id;
        const existing = clientMap.get(key);

        if (existing) {
          existing.total_spent += order.amount || 0;
          existing.orders_count += 1;
          if (order.created_at > (existing.last_order_at || "")) {
            existing.last_order_at = order.created_at;
          }
        } else {
          clientMap.set(key, {
            id: key,
            name: order.customer_name || "Client",
            phone: order.customer_phone || null,
            email: order.customer_email || null,
            city: order.customer_city || null,
            country: order.customer_country || null,
            total_spent: order.amount || 0,
            orders_count: 1,
            last_order_at: order.created_at,
            loyalty: 0,
            segment: "nouveau",
          });
        }
      });

      // Calculer fidélité et segment
      const clientList = Array.from(clientMap.values()).map(c => {
        c.loyalty = Math.min(100, c.orders_count * 15 + Math.min(50, Math.floor(c.total_spent / 10000)));
        c.segment = getSegment(c.total_spent, c.orders_count);
        return c;
      });

      setClients(clientList);
    } catch (err) {
      console.error("[Clients] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Filter
  const filtered = React.useMemo(() => {
    let list = clients;
    if (segmentFilter !== "all") {
      list = list.filter(c => c.segment === segmentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, search, segmentFilter]);

  // Stats
  const stats = {
    total: clients.length,
    vip: clients.filter(c => c.segment === "vip").length,
    avgSpent: clients.length > 0 ? Math.round(clients.reduce((s, c) => s + c.total_spent, 0) / clients.length) : 0,
    retention: clients.length > 0 ? Math.round((clients.filter(c => c.orders_count > 1).length / clients.length) * 100) : 0,
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
        title="Clients"
        subtitle="Votre base de clients et leur fidélité"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Campagne WhatsApp", description: "Envoi de messages WhatsApp en masse bientôt disponible" })}>
            <MessageCircle className="w-4 h-4" /> Campagne WhatsApp
          </Button>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-yaa-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total clients</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.vip}</p>
          <p className="text-xs text-muted-foreground">Clients VIP</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 dark:bg-yaa-orange-950/50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-yaa-orange-600" />
            </div>
          </div>
          <p className="text-xl font-bold">{stats.avgSpent > 0 ? formatFCFA(stats.avgSpent) : "0"}</p>
          <p className="text-xs text-muted-foreground">Dépenses moy.</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.retention}%</p>
          <p className="text-xs text-muted-foreground">Taux rétention</p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, téléphone, email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Segment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="regulier">Régulier</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="nouveau">Nouveau</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table or Empty state */}
      {clients.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-display font-bold text-lg mb-1">Aucun client pour le moment</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Vos clients apparaîtront ici automatiquement dès qu'ils passeront leur première commande.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Aucun client trouvé avec ces filtres.</p>
        </Card>
      ) : (
        <motion.div variants={item}>
          <Card className="p-4 lg:p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Ville / Pays</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Contact</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Dépenses</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Commandes</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell min-w-[120px]">Fidélité</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Segment</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => {
                    const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">Dernière: {formatTime(c.last_order_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{c.city || "—"}, {c.country || ""}</td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                          {c.email && <p className="text-[10px] text-muted-foreground">{c.email}</p>}
                          {!c.phone && !c.email && <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">{formatFCFA(c.total_spent)}</td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell text-muted-foreground">{c.orders_count}</td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
                              <div className={cn("h-full rounded-full", getLoyaltyColor(c.loyalty))} style={{ width: `${c.loyalty}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground w-6">{c.loyalty}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded", SEGMENT_COLORS[c.segment])}>
                            {c.segment === "vip" && <Crown className="h-3 w-3" />}
                            {SEGMENT_LABELS[c.segment]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {c.phone && (
                                <DropdownMenuItem>
                                  <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {c.email && (
                                <DropdownMenuItem>
                                  <a href={`mailto:${c.email}`} className="flex items-center w-full">
                                    <Mail className="h-4 w-4 mr-2" /> Email
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => toast({ title: "Profil client", description: "Fiche détaillée bientôt disponible" })}>
                                Voir profil détaillé
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
