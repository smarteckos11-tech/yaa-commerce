"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  ArrowUp,
  ArrowDown,
  Loader2,
  Wallet,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

// ---------- Animation variants ----------
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Constants ----------
const PERIOD_OPTIONS = [
  { value: "7", label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "90 jours" },
  { value: "365", label: "1 an" },
];

const PAYMENT_COLORS: Record<string, string> = {
  Wave: "#1DC7EA",
  "Orange Money": "#FF6600",
  "MTN MoMo": "#FFCC00",
  Moov: "#00A0E3",
  "Carte bancaire": "#8B5CF6",
  "Paiement à la livraison": "#0F8A5F",
};

const PAYMENT_FALLBACK_COLORS = [
  "#0F8A5F",
  "#F97316",
  "#0EA5E9",
  "#8B5CF6",
  "#FFCC00",
  "#FF6600",
  "#94A3B8",
];

const FUNNEL_COLORS = ["#0F8A5F", "#34D399", "#F97316", "#FB923C", "#0EA5E9", "#8B5CF6"];

// ---------- Types ----------
type Order = {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  customer_city: string | null;
  customer_country: string | null;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  sold: number;
  stock: number | null;
  category: string | null;
};

type Customer = {
  id: string;
  total_spent: number;
  orders_count: number;
  city: string | null;
  country: string | null;
  created_at: string;
};

type DailyRevenue = { date: string; label: string; revenue: number; orders: number };

type FunnelStage = { stage: string; value: number; color: string };

type PaymentSlice = { name: string; value: number; color: string };

type TopCity = { city: string; revenue: number; percent: number };

type TopProduct = {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  category: string;
};

type Prediction = {
  label: string;
  value: string;
  trend: "up" | "down";
  change: string;
  confidence: number;
  icon: string;
};

type KPI = {
  label: string;
  value: string;
  icon: string;
  color: "green" | "orange" | "blue" | "purple";
};

// ---------- Helpers ----------
function getPeriodDays(period: string): number {
  const n = parseInt(period, 10);
  return isNaN(n) ? 30 : n;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function formatGrowth(n: number): string {
  return n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
}

function trendOf(n: number): "up" | "down" {
  return n >= 0 ? "up" : "down";
}

// ---------- Component ----------
export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [period, setPeriod] = React.useState("30");
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);

  // ---------- Load data ----------
  const loadData = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const days = getPeriodDays(period);
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - days);
      const startISO = start.toISOString();

      // Fetch orders in period (filtered by user_id + created_at)
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select(
          "id, amount, status, payment_method, customer_city, customer_country, created_at"
        )
        .eq("user_id", user.id)
        .gte("created_at", startISO)
        .order("created_at", { ascending: true });

      if (ordersErr) throw ordersErr;

      // Fetch all products (no period filter — sold counts are cumulative)
      const { data: productsData, error: productsErr } = await supabase
        .from("products")
        .select("id, name, price, sold, stock, category")
        .eq("user_id", user.id);

      if (productsErr) throw productsErr;

      // Fetch customers created in period
      const { data: customersData, error: customersErr } = await supabase
        .from("customers")
        .select("id, total_spent, orders_count, city, country, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startISO);

      if (customersErr) throw customersErr;

      setOrders((ordersData || []) as Order[]);
      setProducts((productsData || []) as Product[]);
      setCustomers((customersData || []) as Customer[]);
    } catch (err) {
      console.error("[Analytics] Erreur de chargement:", err);
      toast({
        title: "Erreur de chargement",
        description:
          err instanceof Error
            ? err.message
            : "Impossible de charger les données analytiques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, period, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------- Computed analytics ----------
  // Exclude cancelled orders from revenue / conversion stats
  const validOrders = React.useMemo(
    () => orders.filter((o) => o.status !== "annule"),
    [orders]
  );

  const stats = React.useMemo(() => {
    const revenue = validOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const orderCount = validOrders.length;
    const deliveredCount = validOrders.filter((o) => o.status === "livre").length;
    const deliveryRate = orderCount > 0 ? (deliveredCount / orderCount) * 100 : 0;
    const avgBasket = orderCount > 0 ? revenue / orderCount : 0;
    return { revenue, orderCount, deliveredCount, deliveryRate, avgBasket };
  }, [validOrders]);

  // Daily revenue chart (initialized with zeros for periods <= 90d)
  const dailyRevenue: DailyRevenue[] = React.useMemo(() => {
    const days = getPeriodDays(period);
    const map = new Map<string, { revenue: number; orders: number }>();

    if (days <= 90) {
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = dayKey(d);
        map.set(key, { revenue: 0, orders: 0 });
      }
    }

    for (const o of validOrders) {
      const key = dayKey(new Date(o.created_at));
      const cur = map.get(key) || { revenue: 0, orders: 0 };
      cur.revenue += o.amount || 0;
      cur.orders += 1;
      map.set(key, cur);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => ({
        date,
        label: shortLabel(date),
        revenue: v.revenue,
        orders: v.orders,
      }));
  }, [validOrders, period]);

  // Conversion funnel: visitors estimate → cart → checkout → orders → delivered
  const funnel: FunnelStage[] = React.useMemo(() => {
    const orderCount = stats.orderCount;
    const delivered = stats.deliveredCount;
    // Heuristic estimates — YAA doesn't track visitors server-side, so we
    // extrapolate from real orders using typical e-commerce conversion ratios.
    const visitors = Math.round(orderCount * 14);
    const carts = Math.round(orderCount * 3.5);
    const checkouts = Math.round(orderCount * 1.4);
    return [
      { stage: "Visiteurs", value: visitors, color: FUNNEL_COLORS[0] },
      { stage: "Paniers", value: carts, color: FUNNEL_COLORS[2] },
      { stage: "Checkouts", value: checkouts, color: FUNNEL_COLORS[3] },
      { stage: "Commandes", value: orderCount, color: FUNNEL_COLORS[4] },
      { stage: "Livrées", value: delivered, color: FUNNEL_COLORS[5] },
    ];
  }, [stats]);

  // Payment methods distribution (PieChart from real orders grouped by payment_method)
  const paymentSlices: PaymentSlice[] = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of validOrders) {
      const key = o.payment_method || "Inconnu";
      map.set(key, (map.get(key) || 0) + 1);
    }
    let fallbackIdx = 0;
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        color:
          PAYMENT_COLORS[name] ||
          PAYMENT_FALLBACK_COLORS[fallbackIdx++ % PAYMENT_FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [validOrders]);

  // Top products by sold count (top 5) with revenue
  const topProducts: TopProduct[] = React.useMemo(() => {
    return [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sold: p.sold || 0,
        revenue: (p.sold || 0) * (p.price || 0),
        category: p.category || "—",
      }));
  }, [products]);

  // Top cities by revenue (top 6) from real orders
  const topCities: TopCity[] = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of validOrders) {
      const city = o.customer_city || "Inconnu";
      map.set(city, (map.get(city) || 0) + (o.amount || 0));
    }
    const arr = Array.from(map.entries())
      .map(([city, revenue]) => ({ city, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    const max = arr.length > 0 ? arr[0].revenue : 0;
    return arr.map((c) => ({
      ...c,
      percent: max > 0 ? Math.round((c.revenue / max) * 100) : 0,
    }));
  }, [validOrders]);

  // AI Predictions: compare last 7 days vs previous 7 days, predict next 30 days
  const predictions: Prediction[] = React.useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const last7Start = now - 7 * DAY;
    const prev7Start = now - 14 * DAY;

    const last7Orders = validOrders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= last7Start && t <= now;
    });
    const prev7Orders = validOrders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= prev7Start && t < last7Start;
    });

    const last7Revenue = last7Orders.reduce((s, o) => s + (o.amount || 0), 0);
    const prev7Revenue = prev7Orders.reduce((s, o) => s + (o.amount || 0), 0);
    const last7Count = last7Orders.length;
    const prev7Count = prev7Orders.length;

    const last7Customers = customers.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= last7Start && t <= now;
    }).length;
    const prev7Customers = customers.filter((c) => {
      const t = new Date(c.created_at).getTime();
      return t >= prev7Start && t < last7Start;
    }).length;

    const last7Basket = last7Count > 0 ? last7Revenue / last7Count : 0;
    const prev7Basket = prev7Count > 0 ? prev7Revenue / prev7Count : 0;

    // Conversion rate estimate (orders / visitors estimate, where visitors = orders * 14)
    const last7Conv = last7Count > 0 ? 100 / 14 : 0;
    const prev7Conv = prev7Count > 0 ? 100 / 14 : 0;

    const revGrowth = pctChange(last7Revenue, prev7Revenue);
    const ordGrowth = pctChange(last7Count, prev7Count);
    const custGrowth = pctChange(last7Customers, prev7Customers);
    const basketGrowth = pctChange(last7Basket, prev7Basket);
    const convGrowth = pctChange(last7Conv, prev7Conv);

    // Predict next 30 days, applying a clamped growth multiplier to the linear projection
    const predictedRevenue = Math.round(
      ((last7Revenue * 30) / 7) * (1 + clamp(revGrowth / 100, -0.3, 0.5))
    );
    const predictedOrders = Math.round(
      ((last7Count * 30) / 7) * (1 + clamp(ordGrowth / 100, -0.3, 0.5))
    );
    const predictedCustomers = Math.round(
      ((last7Customers * 30) / 7) * (1 + clamp(custGrowth / 100, -0.3, 0.5))
    );
    const predictedBasket = Math.round(
      last7Basket * (1 + clamp(basketGrowth / 100, -0.2, 0.4))
    );
    const predictedConv = clamp(
      last7Conv * (1 + clamp(convGrowth / 100, -0.2, 0.3)),
      0,
      100
    );

    // Confidence: more historical data → higher confidence (capped at 95%)
    const baseConfidence = Math.min(60 + last7Count * 4 + prev7Count * 2, 95);

    return [
      {
        label: "CA prévu (30 j)",
        value: formatFCFA(predictedRevenue),
        trend: trendOf(revGrowth),
        change: formatGrowth(revGrowth),
        confidence: baseConfidence,
        icon: "TrendingUp",
      },
      {
        label: "Commandes prévues",
        value: predictedOrders.toLocaleString("fr-FR"),
        trend: trendOf(ordGrowth),
        change: formatGrowth(ordGrowth),
        confidence: Math.max(baseConfidence - 2, 50),
        icon: "ShoppingCart",
      },
      {
        label: "Nouveaux clients",
        value: predictedCustomers.toLocaleString("fr-FR"),
        trend: trendOf(custGrowth),
        change: formatGrowth(custGrowth),
        confidence: Math.max(baseConfidence - 4, 50),
        icon: "UserPlus",
      },
      {
        label: "Taux conversion",
        value: predictedConv.toFixed(1) + "%",
        trend: trendOf(convGrowth),
        change: formatGrowth(convGrowth),
        confidence: Math.max(baseConfidence - 6, 50),
        icon: "Target",
      },
      {
        label: "Panier moyen",
        value: formatFCFA(predictedBasket),
        trend: trendOf(basketGrowth),
        change: formatGrowth(basketGrowth),
        confidence: Math.max(baseConfidence - 2, 50),
        icon: "ShoppingBag",
      },
    ];
  }, [validOrders, customers]);

  // KPI cards: Revenue, Orders, Delivery rate, Average basket
  const kpis: KPI[] = React.useMemo(
    () => [
      {
        label: "Revenus",
        value: formatFCFA(stats.revenue),
        icon: "Wallet",
        color: "green",
      },
      {
        label: "Commandes",
        value: stats.orderCount.toLocaleString("fr-FR"),
        icon: "ShoppingCart",
        color: "orange",
      },
      {
        label: "Taux de livraison",
        value: stats.deliveryRate.toFixed(1) + "%",
        icon: "Truck",
        color: "blue",
      },
      {
        label: "Panier moyen",
        value: formatFCFA(Math.round(stats.avgBasket)),
        icon: "ShoppingBag",
        color: "purple",
      },
    ],
    [stats]
  );

  // ---------- Export CSV (daily revenue) ----------
  const exportCSV = React.useCallback(() => {
    if (dailyRevenue.length === 0) {
      toast({
        title: "Rien à exporter",
        description: "Aucune donnée disponible pour cette période.",
        variant: "destructive",
      });
      return;
    }
    const header = "Date;Revenu (FCFA);Commandes\n";
    const rows = dailyRevenue
      .map((d) => `${d.date};${d.revenue};${d.orders}`)
      .join("\n");
    const csv = header + rows;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-revenus-${period}j-${dayKey(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Export réussi",
      description: `${dailyRevenue.length} lignes exportées au format CSV.`,
    });
  }, [dailyRevenue, period, toast]);

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  const hasData = validOrders.length > 0;
  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Analytics"
        subtitle="Performances, prédictions IA et insights"
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={exportCSV}
              disabled={!hasData}
            >
              <Download className="h-4 w-4" /> Exporter
            </Button>
          </>
        }
      />

      {!hasData ? (
        /* ---------- Empty state ---------- */
        <motion.div variants={item}>
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Wallet className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="font-display font-bold text-lg mb-1">
              Pas encore de revenus sur cette période
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Aucune commande n&apos;a été enregistrée sur les{" "}
              {periodLabel.toLowerCase()}. Partagez votre boutique pour recevoir vos
              premières commandes, ou changez la période pour voir vos performances.
            </p>
            <Button
              onClick={() => loadData()}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Loader2 className="h-4 w-4" /> Actualiser
            </Button>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* ---------- KPI Cards ---------- */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6"
          >
            {kpis.map((kpi) => (
              <Card
                key={kpi.label}
                className="p-4 lg:p-5 hover:shadow-md transition-shadow"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    kpi.color === "green" &&
                      "bg-yaa-green-50 dark:bg-yaa-green-950/50 text-yaa-green-600",
                    kpi.color === "orange" &&
                      "bg-yaa-orange-50 dark:bg-yaa-orange-950/50 text-yaa-orange-600",
                    kpi.color === "blue" &&
                      "bg-blue-50 dark:bg-blue-950/50 text-blue-600",
                    kpi.color === "purple" &&
                      "bg-purple-50 dark:bg-purple-950/50 text-purple-600"
                  )}
                >
                  <DynamicIcon name={kpi.icon} className="h-5 w-5" />
                </div>
                <p className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                  {kpi.label}
                </p>
              </Card>
            ))}
          </motion.div>

          {/* ---------- AI Predictions ---------- */}
          <motion.div variants={item} className="mb-6">
            <Card className="p-5 lg:p-6 bg-gradient-to-br from-yaa-orange-50/50 to-yaa-green-50/50 dark:from-yaa-orange-950/20 dark:to-yaa-green-950/20 border-yaa-orange-200/50 dark:border-yaa-orange-900/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yaa-orange-500 to-yaa-green-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-semibold">
                    Prédictions IA — 30 prochains jours
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Basé sur la tendance des 14 derniers jours (7 j vs 7 j précédents)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {predictions.map((p) => (
                  <div
                    key={p.label}
                    className="p-3 bg-background/60 backdrop-blur rounded-lg border"
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {p.label}
                    </p>
                    <p className="text-sm font-bold mb-1.5">{p.value}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] font-bold",
                          p.trend === "up"
                            ? "text-yaa-green-600"
                            : "text-rose-600"
                        )}
                      >
                        {p.trend === "up" ? (
                          <ArrowUp className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDown className="h-2.5 w-2.5" />
                        )}
                        {p.change}
                      </span>
                      <span className="text-[9px] font-semibold text-yaa-orange-600 bg-yaa-orange-100 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400 px-1 py-0.5 rounded">
                        {p.confidence}% conf.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ---------- Revenue chart ---------- */}
          <motion.div variants={item} className="mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold">
                    Évolution des revenus
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Revenu quotidien — {periodLabel}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-yaa-green-500" /> Réel
                  </span>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyRevenue}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F8A5F" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0F8A5F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E2E8F0"
                      strokeOpacity={0.4}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                          ? `${Math.round(v / 1000)}k`
                          : `${v}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [formatFCFA(v), "Revenu"]}
                      labelFormatter={(label: string) => `Date : ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0F8A5F"
                      strokeWidth={2.5}
                      fill="url(#revenue-grad)"
                      name="Revenu"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* ---------- Conversion funnel ---------- */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="mb-4">
                  <h2 className="font-display font-semibold">
                    Entonnoir de conversion
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tunnel d&apos;achat — {periodLabel}
                  </p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={funnel}
                      layout="vertical"
                      margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                        strokeOpacity={0.4}
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#94A3B8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="stage"
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {funnel.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* ---------- Payment methods distribution ---------- */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="mb-4">
                  <h2 className="font-display font-semibold">
                    Moyens de paiement
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Répartition des commandes
                  </p>
                </div>
                {paymentSlices.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Aucun paiement enregistré
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentSlices}
                            dataKey="value"
                            innerRadius={42}
                            outerRadius={70}
                            paddingAngle={2}
                          >
                            {paymentSlices.map((s, i) => (
                              <Cell key={i} fill={s.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "white",
                              border: "1px solid #E2E8F0",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {paymentSlices.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ background: s.color }}
                          />
                          <span className="flex-1 text-muted-foreground truncate">
                            {s.name}
                          </span>
                          <span className="font-bold">{s.value}</span>
                          <span className="text-xs text-muted-foreground">
                            (
                            {stats.orderCount > 0
                              ? Math.round((s.value / stats.orderCount) * 100)
                              : 0}
                            %)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* ---------- Top products ---------- */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="mb-4">
                  <h2 className="font-display font-semibold">Top produits</h2>
                  <p className="text-xs text-muted-foreground">
                    Par quantité vendue (cumul)
                  </p>
                </div>
                {topProducts.length === 0 ||
                topProducts.every((p) => p.sold === 0) ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Aucune vente enregistrée
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                            idx === 0 &&
                              "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                            idx === 1 &&
                              "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                            idx === 2 &&
                              "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
                            idx > 2 && "bg-muted text-muted-foreground"
                          )}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.sold} vendus · {p.category}
                          </p>
                        </div>
                        <span className="text-sm font-bold whitespace-nowrap">
                          {formatFCFA(p.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* ---------- Top cities ---------- */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="mb-4">
                  <h2 className="font-display font-semibold">
                    Top villes par revenu
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Vos meilleurs marchés géographiques — {periodLabel}
                  </p>
                </div>
                {topCities.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Aucune ville enregistrée
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topCities.map((c, idx) => (
                      <motion.div
                        key={`${c.city}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-20 text-sm font-semibold truncate">
                          {c.city}
                        </span>
                        <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.percent}%` }}
                            transition={{
                              duration: 0.8,
                              delay: idx * 0.06 + 0.2,
                              ease: "easeOut",
                            }}
                            className="h-full bg-gradient-to-r from-yaa-green-500 to-yaa-green-400 rounded-md flex items-center justify-end pr-2"
                          >
                            <span className="text-[10px] font-bold text-white">
                              {c.percent}%
                            </span>
                          </motion.div>
                        </div>
                        <span className="w-28 text-right text-sm font-bold whitespace-nowrap">
                          {formatFCFA(c.revenue)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* ---------- Footer hint ---------- */}
          <motion.div variants={item} className="text-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Données en temps réel depuis Supabase · {stats.orderCount} commande
              {stats.orderCount > 1 ? "s" : ""} sur {periodLabel.toLowerCase()}
            </span>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
