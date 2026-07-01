"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ============================================================
// Constants — plan & role definitions (inline, NOT from admin-data)
// ============================================================

const SUPER_ADMIN_EMAIL = "kossonouy11@gmail.com";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  "Découverte": { bg: "bg-muted", text: "text-muted-foreground" },
  "Business": { bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-700 dark:text-yaa-orange-400" },
  "Pro": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400" },
};

// Static plan definitions — user count & revenue come from the API at runtime.
const PLAN_DEFINITIONS = [
  {
    key: "decouverte",
    name: "Découverte",
    price: 2900,
    popular: false,
    features: [
      "Boutique en ligne",
      "50 produits",
      "1 Mobile Money",
      "Support email",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: 4900,
    popular: true,
    features: [
      "Produits illimités",
      "Tous Mobile Money",
      "WhatsApp Business",
      "Analytics avancés",
      "Support prioritaire",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 9900,
    popular: false,
    features: [
      "Multi-boutiques",
      "IA YaaMind",
      "API & Webhooks",
      "Gestionnaire dédié",
      "SLA 99.9%",
    ],
  },
] as const;

// Static role definitions — "Boutique Admin" count is filled with total users.
const ROLE_DEFINITIONS = [
  {
    name: "Super Admin",
    color: "red",
    permissions: [
      "Tous les droits",
      "Gestion utilisateurs",
      "Configuration plateforme",
      "White-label",
      "Facturation",
    ],
  },
  {
    name: "Boutique Admin",
    color: "green",
    permissions: [
      "Gestion produits",
      "Commandes",
      "Clients",
      "Paiements",
      "Livraisons",
      "Marketing",
    ],
  },
  {
    name: "Éditeur",
    color: "blue",
    permissions: [
      "Voir produits",
      "Modifier stock",
      "Commandes",
      "Clients",
      "Support",
    ],
  },
  {
    name: "Support",
    color: "purple",
    permissions: [
      "Voir commandes",
      "Messages clients",
      "Support tickets",
    ],
  },
  {
    name: "Lecteur",
    color: "yellow",
    permissions: [
      "Lecture seule",
      "Voir analytics",
      "Voir commandes",
    ],
  },
] as const;

const ROLE_DOT_COLORS: Record<string, string> = {
  red: "bg-rose-500",
  green: "bg-yaa-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  yellow: "bg-amber-500",
};

// ============================================================
// Types
// ============================================================

type PlanKey = "decouverte" | "business" | "pro";

type PlanDistributionEntry = { count: number; revenue: number };
type PlanDistribution = Partial<Record<PlanKey, PlanDistributionEntry>>;

type PlatformStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  mrr: number;
  newUsers30d: number;
  planDistribution: PlanDistribution;
};

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  boutique_name: string | null;
  plan: string;
  product_count: number;
  order_count: number;
  mrr: number;
  created_at: string | null;
};

// ============================================================
// Helpers — normalize the (potentially varied) API responses
// ============================================================

function normalizePlan(raw: unknown): PlanKey {
  if (typeof raw !== "string") return "decouverte";
  const v = raw.toLowerCase().trim();
  if (v === "pro") return "pro";
  if (v === "business") return "business";
  return "decouverte";
}

const PLAN_LABEL: Record<PlanKey, string> = {
  decouverte: "Découverte",
  business: "Business",
  pro: "Pro",
};

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function str(v: unknown): string | null {
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

function normalizeStats(raw: any): PlatformStats {
  const planDistRaw = raw?.planDistribution ?? raw?.plan_distribution ?? {};
  const planDistribution: PlanDistribution = {};
  (["decouverte", "business", "pro"] as PlanKey[]).forEach((k) => {
    const entry = (planDistRaw as any)[k];
    if (entry && typeof entry === "object") {
      planDistribution[k] = {
        count: num((entry as any).count ?? (entry as any).users, 0),
        revenue: num((entry as any).revenue ?? (entry as any).mrr, 0),
      };
    } else if (typeof entry === "number") {
      planDistribution[k] = { count: entry, revenue: 0 };
    }
  });

  return {
    totalUsers: num(raw?.totalUsers ?? raw?.total_users ?? raw?.users, 0),
    totalProducts: num(raw?.totalProducts ?? raw?.total_products ?? raw?.products, 0),
    totalOrders: num(raw?.totalOrders ?? raw?.total_orders ?? raw?.orders, 0),
    totalRevenue: num(raw?.totalRevenue ?? raw?.total_revenue ?? raw?.revenue, 0),
    mrr: num(raw?.mrr, 0),
    newUsers30d: num(raw?.newUsers30d ?? raw?.new_users_30d ?? raw?.newUsers, 0),
    planDistribution,
  };
}

function normalizeUsers(raw: any): AdminUser[] {
  const list = Array.isArray(raw?.users) ? raw.users : Array.isArray(raw) ? raw : [];
  return list.map((u: any, idx: number) => ({
    id: String(u?.id ?? u?.user_id ?? `u-${idx}`),
    email: String(u?.email ?? ""),
    full_name: str(u?.full_name ?? u?.name ?? u?.boutique_name),
    boutique_name: str(u?.boutique_name ?? u?.store_name),
    plan: normalizePlan(u?.plan),
    product_count: num(u?.product_count ?? u?.products ?? u?.products_count, 0),
    order_count: num(u?.order_count ?? u?.orders ?? u?.orders_count, 0),
    mrr: num(u?.mrr ?? u?.monthly_revenue, 0),
    created_at: str(u?.created_at ?? u?.signup_date ?? u?.createdAt) ?? null,
  }));
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string | null, email: string): string {
  const src = name || email || "?";
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

// ============================================================
// Page
// ============================================================

export default function SuperAdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = React.useState<PlatformStats | null>(null);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // White-Label form state
  const [platformName, setPlatformName] = React.useState("YAA Commerce");
  const [primaryColor, setPrimaryColor] = React.useState("#0F8A5F");
  const [customDomain, setCustomDomain] = React.useState("");

  // Users tab filters
  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState<"tous" | PlanKey>("tous");

  const isSuperAdmin = React.useMemo(
    () => profile?.email?.toLowerCase() === SUPER_ADMIN_EMAIL,
    [profile?.email],
  );

  const loadData = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoading(true);
      setRefreshing(true);

      const headers: Record<string, string> = {};
      if (typeof document !== "undefined") {
        // Forward auth token if Supabase persisted it in localStorage
        try {
          const raw = localStorage.getItem("sb-" + "auth-token");
          if (raw) headers["x-supabase-auth"] = raw;
        } catch {}
      }

      try {
        const [statsRes, usersRes] = await Promise.allSettled([
          fetch("/api/admin/stats", { headers, cache: "no-store" }),
          fetch("/api/admin/users", { headers, cache: "no-store" }),
        ]);

        let statsError: string | null = null;
        let usersError: string | null = null;

        if (statsRes.status === "fulfilled") {
          if (!statsRes.value.ok) {
            statsError = `Stats ${statsRes.value.status}`;
          } else {
            const json = await statsRes.value.json().catch(() => ({}));
            setStats(normalizeStats(json));
          }
        } else {
          statsError = "Réseau stats";
        }

        if (usersRes.status === "fulfilled") {
          if (!usersRes.value.ok) {
            usersError = `Users ${usersRes.value.status}`;
          } else {
            const json = await usersRes.value.json().catch(() => ({}));
            setUsers(normalizeUsers(json));
          }
        } else {
          usersError = "Réseau users";
        }

        if (!silent && (statsError || usersError)) {
          toast({
            title: "Données partielles",
            description: [statsError, usersError].filter(Boolean).join(" · "),
            variant: "destructive",
          });
        } else if (!silent) {
          toast({
            title: "Données chargées",
            description: "Statistiques et utilisateurs à jour.",
          });
        }
      } catch (err) {
        if (!silent) {
          toast({
            title: "Erreur de chargement",
            description: err instanceof Error ? err.message : "Erreur inconnue",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  React.useEffect(() => {
    if (authLoading) return;
    if (!user || !isSuperAdmin) return;
    loadData();
  }, [user, isSuperAdmin, authLoading, loadData]);

  // ---- Early gates ----
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              Super Admin
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 px-2 py-0.5 rounded">
                <Crown className="h-3 w-3" /> Plateforme
              </span>
            </span>
          }
          subtitle="Administration globale de la plateforme YAA"
        />
        <motion.div variants={item}>
          <Card className="p-8 lg:p-10 max-w-lg mx-auto text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mb-4">
              <ShieldAlert className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="font-display font-bold text-xl mb-1.5">Accès refusé</h2>
            <p className="text-sm text-muted-foreground">
              Cette section est réservée au Super Admin de la plateforme. Votre
              compte (<span className="font-mono">{profile?.email || "inconnu"}</span>)
              n&apos;a pas les permissions nécessaires.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  // ---- Derived data ----
  const planTotals = React.useMemo(() => {
    const dist = stats?.planDistribution ?? {};
    const total = (["decouverte", "business", "pro"] as PlanKey[]).reduce(
      (acc, k) => acc + (dist[k]?.count ?? 0),
      0,
    );
    return { dist, total: total || stats?.totalUsers || 0 };
  }, [stats]);

  const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (planFilter !== "tous" && u.plan !== planFilter) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.boutique_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [users, search, planFilter]);

  const refresh = () => loadData({ silent: true });

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Super Admin
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 px-2 py-0.5 rounded">
              <Crown className="h-3 w-3" /> Plateforme
            </span>
          </span>
        }
        subtitle="Administration globale de la plateforme YAA"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Actualiser
          </Button>
        }
      />

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6"
      >
        <StatCard
          label="Utilisateurs"
          value={stats?.totalUsers ?? 0}
          color="blue"
          icon="Users"
          format="number"
        />
        <StatCard
          label="Produits"
          value={stats?.totalProducts ?? 0}
          color="purple"
          icon="Package"
          format="number"
        />
        <StatCard
          label="Commandes"
          value={stats?.totalOrders ?? 0}
          color="orange"
          icon="ShoppingCart"
          format="number"
        />
        <StatCard
          label="Revenu Total"
          value={stats?.totalRevenue ?? 0}
          color="green"
          icon="TrendingUp"
          format="fcfa"
        />
        <StatCard
          label="MRR"
          value={stats?.mrr ?? 0}
          color="rose"
          icon="Wallet"
          format="fcfa"
        />
      </motion.div>

      {/* New users this month */}
      {stats && stats.newUsers30d > 0 && (
        <motion.div variants={item} className="mb-6">
          <Card className="p-4 lg:p-5 flex items-center gap-3 border-yaa-green-200 dark:border-yaa-green-900/50 bg-yaa-green-50/50 dark:bg-yaa-green-950/20">
            <div className="w-10 h-10 rounded-xl bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-yaa-green-600 dark:text-yaa-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                +{stats.newUsers30d.toLocaleString("fr-FR")} nouveaux utilisateurs ce mois
              </p>
              <p className="text-xs text-muted-foreground">
                Croissance de la plateforme sur les 30 derniers jours
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="plans">Plans &amp; Facturation</TabsTrigger>
            <TabsTrigger value="roles">Rôles &amp; Permissions</TabsTrigger>
            <TabsTrigger value="whitelabel">White-Label</TabsTrigger>
          </TabsList>

          {/* ============== USERS ============== */}
          <TabsContent value="users" className="mt-0">
            <Card className="p-4 lg:p-5">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  placeholder="Rechercher par nom, email ou boutique…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sm:max-w-xs"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {(["tous", "decouverte", "business", "pro"] as const).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={planFilter === p ? "default" : "outline"}
                      onClick={() => setPlanFilter(p)}
                      className={cn(
                        planFilter === p && "bg-yaa-green-500 hover:bg-yaa-green-600",
                      )}
                    >
                      {p === "tous" ? "Tous" : PLAN_LABEL[p]}
                    </Button>
                  ))}
                </div>
                <div className="sm:ml-auto text-xs text-muted-foreground self-center">
                  {filteredUsers.length} / {users.length} utilisateurs
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Utilisateur</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Boutique</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Plan</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Produits</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Commandes</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">MRR</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden xl:table-cell">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-10 text-center text-sm text-muted-foreground">
                          Aucun utilisateur ne correspond à votre recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => {
                        const plan = PLAN_COLORS[PLAN_LABEL[u.plan]];
                        return (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                            className="border-b last:border-b-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-muted text-xs font-bold">
                                    {initials(u.full_name, u.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {u.full_name || u.email || "Utilisateur"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {u.email || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">
                              {u.boutique_name || "—"}
                            </td>
                            <td className="px-3 py-3">
                              <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", plan.bg, plan.text)}>
                                {PLAN_LABEL[u.plan]}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right hidden lg:table-cell font-medium">
                              {u.product_count.toLocaleString("fr-FR")}
                            </td>
                            <td className="px-3 py-3 text-right hidden lg:table-cell font-medium">
                              {u.order_count.toLocaleString("fr-FR")}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold">
                              {u.mrr > 0 ? formatFCFA(u.mrr) : "—"}
                            </td>
                            <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden xl:table-cell">
                              {formatDate(u.created_at)}
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ============== PLANS ============== */}
          <TabsContent value="plans" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLAN_DEFINITIONS.map((p, idx) => {
                const entry = planTotals.dist[p.key];
                const usersCount = entry?.count ?? 0;
                const revenue = entry?.revenue ?? 0;
                const percent =
                  planTotals.total > 0
                    ? Math.round((usersCount / planTotals.total) * 100)
                    : 0;
                return (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card
                      className={cn(
                        "p-5 lg:p-6 h-full flex flex-col",
                        p.popular && "ring-2 ring-yaa-green-500 relative",
                      )}
                    >
                      {p.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-yaa-green-500 px-3 py-0.5 rounded-full">
                          Populaire
                        </span>
                      )}
                      <p className="font-display font-bold text-lg mb-1">{p.name}</p>
                      <p className="text-2xl font-display font-extrabold mb-1">
                        {formatFCFA(p.price)}
                        <span className="text-xs font-medium text-muted-foreground">/mois</span>
                      </p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {usersCount.toLocaleString("fr-FR")} utilisateurs
                          </span>
                          <span className="font-bold">{percent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-yaa-green-500 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Revenu:{" "}
                          <span className="font-bold text-yaa-green-600">
                            {formatFCFA(revenue)}
                          </span>
                        </p>
                      </div>
                      <ul className="space-y-1.5 flex-1">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-yaa-green-500 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Modifier
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ============== ROLES ============== */}
          <TabsContent value="roles" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {ROLE_DEFINITIONS.map((r, idx) => {
                // "Boutique Admin" count = total users from stats; others unknown.
                const count =
                  r.name === "Boutique Admin" ? stats?.totalUsers ?? 0 : 0;
                return (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="p-4 lg:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              ROLE_DOT_COLORS[r.color],
                            )}
                          />
                          <p className="font-semibold">{r.name}</p>
                        </div>
                        <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">
                          {count.toLocaleString("fr-FR")} users
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {r.permissions.map((perm) => (
                          <li key={perm} className="flex items-start gap-2 text-xs">
                            <Check className="h-3.5 w-3.5 text-yaa-green-500 flex-shrink-0 mt-0.5" />
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ============== WHITE-LABEL ============== */}
          <TabsContent value="whitelabel" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h3 className="font-display font-semibold text-lg mb-4">
                Configuration White-Label
              </h3>
              <div className="space-y-5">
                {/* Platform name */}
                <div>
                  <Label htmlFor="platform-name" className="text-xs font-semibold mb-1.5 block">
                    Nom de la plateforme
                  </Label>
                  <Input
                    id="platform-name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>

                {/* Primary color */}
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Couleur primaire</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded-md border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono max-w-32"
                    />
                    <div
                      className="w-10 h-10 rounded-md border flex-shrink-0"
                      style={{ background: primaryColor }}
                    />
                  </div>
                </div>

                {/* Logo upload */}
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-yaa-green-500 transition-colors cursor-pointer">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium flex items-center justify-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Cliquez pour téléverser
                    </p>
                    <p className="text-[11px] text-muted-foreground">PNG, SVG ou JPG · max 2MB</p>
                  </div>
                </div>

                {/* Custom domain */}
                <div>
                  <Label htmlFor="domain" className="text-xs font-semibold mb-1.5 block">
                    Domaine personnalisé
                  </Label>
                  <Input
                    id="domain"
                    placeholder="boutique.exemple.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Configurez un enregistrement CNAME pointant vers{" "}
                    <code className="font-mono bg-muted px-1 py-0.5 rounded">
                      cname.yaa-commerce.com
                    </code>
                  </p>
                </div>

                <Button
                  className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  onClick={() =>
                    toast({
                      title: "Configuration sauvegardée",
                      description: "Vos réglages White-Label ont été enregistrés.",
                    })
                  }
                >
                  <Check className="h-4 w-4" /> Sauvegarder
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
