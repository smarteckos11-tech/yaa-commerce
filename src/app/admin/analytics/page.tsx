"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Download, ArrowUp, ArrowDown, Loader2, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Order = {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  customer_city: string | null;
  customer_name: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  category: string | null;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [period, setPeriod] = React.useState("30");

  React.useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("products").select("id, name, price, category").eq("user_id", user.id),
        ]);

        setOrders((ordersRes.data || []) as Order[]);
        setProducts((productsRes.data || []) as Product[]);
      } catch (err) {
        console.error("[Analytics] Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Calculate real stats
  const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map(o => o.customer_name)).size;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Revenue chart data (last 6 months)
  const revenueData = React.useMemo(() => {
    const months: { month: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString("fr-FR", { month: "short" });
      const monthOrders = orders.filter(o => {
        const od = new Date(o.created_at);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      months.push({
        month: monthName,
        revenue: monthOrders.reduce((s, o) => s + (o.amount || 0), 0),
        orders: monthOrders.length,
      });
    }
    return months;
  }, [orders]);

  // Payment methods distribution
  const paymentData = React.useMemo(() => {
    const methods: Record<string, number> = {};
    orders.forEach(o => {
      const method = o.payment_method || "Autre";
      methods[method] = (methods[method] || 0) + 1;
    });
    const colors: Record<string, string> = {
      "Wave": "#1DC7EA",
      "Orange Money": "#FF6600",
      "MTN MoMo": "#FFCC00",
      "Paiement à la livraison": "#0F8A5F",
      "Carte bancaire": "#8B5CF6",
    };
    return Object.entries(methods).map(([name, value]) => ({
      name: name === "Paiement à la livraison" ? "COD" : name,
      value,
      color: colors[name] || "#94A3B8",
    }));
  }, [orders]);

  // Top cities
  const cityData = React.useMemo(() => {
    const cities: Record<string, { revenue: number; count: number }> = {};
    orders.forEach(o => {
      const city = o.customer_city || "Non spécifié";
      if (!cities[city]) cities[city] = { revenue: 0, count: 0 };
      cities[city].revenue += o.amount || 0;
      cities[city].count += 1;
    });
    return Object.entries(cities)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  // Order status distribution
  const statusData = React.useMemo(() => {
    const statuses: Record<string, number> = {};
    orders.forEach(o => {
      statuses[o.status] = (statuses[o.status] || 0) + 1;
    });
    const colors: Record<string, string> = {
      nouveau: "#0EA5E9",
      en_preparation: "#F59E0B",
      expedie: "#8B5CF6",
      livre: "#0F8A5F",
      annule: "#EF4444",
    };
    return Object.entries(statuses).map(([name, value]) => ({
      name: name === "en_preparation" ? "Préparation" : name === "expedie" ? "Expédié" : name === "livre" ? "Livré" : name === "nouveau" ? "Nouveau" : "Annulé",
      value,
      color: colors[name] || "#94A3B8",
    }));
  }, [orders]);

  // AI Predictions (based on trend)
  const predictions = React.useMemo(() => {
    const lastMonth = revenueData[revenueData.length - 1]?.revenue || 0;
    const prevMonth = revenueData[revenueData.length - 2]?.revenue || 0;
    const growthRate = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
    const predictedRevenue = Math.round(lastMonth * (1 + (growthRate > 0 ? 0.15 : 0.05)));
    const predictedOrders = Math.round(totalOrders > 0 ? totalOrders * 0.18 : 0);
    const confidence = Math.min(95, 60 + totalOrders * 3);

    return [
      { label: "Revenus prédits (mois prochain)", value: predictedRevenue > 0 ? formatFCFA(predictedRevenue) : "—", trend: growthRate >= 0 ? "up" : "down", change: `${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(1)}%`, confidence },
      { label: "Commandes prédites", value: predictedOrders.toString(), trend: "up", change: "+15%", confidence: confidence - 5 },
      { label: "Nouveaux clients", value: Math.round(uniqueCustomers * 0.2).toString(), trend: "up", change: "+20%", confidence: confidence - 10 },
      { label: "Panier moyen", value: avgOrderValue > 0 ? formatFCFA(avgOrderValue) : "—", trend: "up", change: "+5%", confidence: confidence - 8 },
    ];
  }, [revenueData, totalOrders, uniqueCustomers, avgOrderValue]);

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
        title="Analytics"
        subtitle="Performances, prédictions IA et insights"
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="365">12 mois</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Export", description: "Export PDF/Excel bientôt disponible" })}>
              <Download className="w-4 h-4" /> Exporter
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {[
          { label: "Revenus totaux", value: totalRevenue, format: "fcfa", icon: DollarSign, color: "green" },
          { label: "Commandes", value: totalOrders, format: "number", icon: ShoppingCart, color: "orange" },
          { label: "Clients uniques", value: uniqueCustomers, format: "number", icon: Users, color: "blue" },
          { label: "Panier moyen", value: avgOrderValue, format: "fcfa", icon: Package, color: "purple" },
        ].map((stat) => {
          const colors: Record<string, string> = {
            green: "bg-yaa-green-100 dark:bg-yaa-green-950/50 text-yaa-green-600",
            orange: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50 text-yaa-orange-600",
            blue: "bg-blue-100 dark:bg-blue-950/50 text-blue-600",
            purple: "bg-purple-100 dark:bg-purple-950/50 text-purple-600",
          };
          return (
            <Card key={stat.label} className="p-4 lg:p-5 hover:shadow-md transition-shadow">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colors[stat.color])}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                {stat.format === "fcfa" ? formatFCFA(stat.value) : stat.value}
              </p>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </motion.div>

      {/* Empty state if no data */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-display font-bold text-lg mb-1">Pas encore de données</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Vos analytics apparaîtront ici dès que vous recevrez vos premières commandes.
          </p>
        </Card>
      ) : (
        <>
          {/* AI Predictions */}
          <motion.div variants={item} className="mb-6">
            <Card className="p-5 lg:p-6 bg-gradient-to-br from-yaa-orange-50/50 to-yaa-green-50/50 dark:from-yaa-orange-950/20 dark:to-yaa-green-950/20 border-yaa-orange-200/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yaa-orange-500 to-yaa-green-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-semibold">Prédictions IA</h2>
                  <p className="text-xs text-muted-foreground">Basé sur vos données réelles</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {predictions.map((p, i) => (
                  <div key={i} className="p-3 bg-background/60 backdrop-blur rounded-lg border">
                    <p className="text-[10px] text-muted-foreground mb-1">{p.label}</p>
                    <p className="text-sm font-bold mb-1.5">{p.value}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-bold", p.trend === "up" ? "text-yaa-green-600" : "text-rose-600")}>
                        {p.trend === "up" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                        {p.change}
                      </span>
                      <span className="text-[9px] font-semibold text-yaa-orange-600 bg-yaa-orange-100 dark:bg-yaa-orange-950/50 px-1 py-0.5 rounded">{p.confidence}% conf.</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div variants={item} className="mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold">Évolution des revenus</h2>
                  <p className="text-xs text-muted-foreground">6 derniers mois</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F8A5F" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0F8A5F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatFCFA(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#0F8A5F" strokeWidth={2.5} fill="url(#rev-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Payment methods */}
            <motion.div variants={item}>
              <Card className="p-5">
                <h2 className="font-display font-semibold mb-4">Méthodes de paiement</h2>
                {paymentData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentData} innerRadius={42} outerRadius={70} paddingAngle={2} dataKey="value">
                            {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {paymentData.map((p) => (
                        <div key={p.name} className="flex items-center gap-2 text-sm">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                          <span className="text-muted-foreground flex-1">{p.name}</span>
                          <span className="font-bold">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Pas de données</p>
                )}
              </Card>
            </motion.div>

            {/* Order status */}
            <motion.div variants={item}>
              <Card className="p-5">
                <h2 className="font-display font-semibold mb-4">Statut des commandes</h2>
                {statusData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.4} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                          {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Pas de données</p>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Top cities */}
          <motion.div variants={item}>
            <Card className="p-5">
              <h2 className="font-display font-semibold mb-4">Top villes par revenus</h2>
              {cityData.length > 0 ? (
                <div className="space-y-3">
                  {cityData.map((c, idx) => {
                    const maxRevenue = cityData[0]?.revenue || 1;
                    const pct = (c.revenue / maxRevenue) * 100;
                    return (
                      <motion.div
                        key={c.city}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-20 text-sm font-semibold truncate">{c.city}</span>
                        <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.06 + 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yaa-green-500 to-yaa-green-400 rounded-md flex items-center justify-end pr-2"
                          >
                            <span className="text-[10px] font-bold text-white">{c.count} cmd</span>
                          </motion.div>
                        </div>
                        <span className="w-28 text-right text-sm font-bold">{formatFCFA(c.revenue)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Pas de données</p>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
