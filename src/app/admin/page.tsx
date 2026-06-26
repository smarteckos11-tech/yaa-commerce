"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { Loader2, Package, ShoppingCart, Users, Wallet, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  "Livré": "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  "En cours": "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400",
  "En attente": "bg-muted text-muted-foreground",
  "nouveau": "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  "en_preparation": "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "expedie": "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  "livre": "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  "annule": "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};

const STATUS_LABELS: Record<string, string> = {
  "nouveau": "Nouveau",
  "en_preparation": "En préparation",
  "expedie": "Expédié",
  "livre": "Livré",
  "annule": "Annulé",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Charger les produits
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Charger les commandes
        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const orderList = orders || [];
        const totalRevenue = orderList.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

        // Charger les clients (unique phones dans orders)
        const uniqueCustomers = new Set(orderList.map((o: any) => o.customer_phone).filter(Boolean));

        setStats({
          revenue: totalRevenue,
          orders: orderList.length,
          customers: uniqueCustomers.size,
          products: productCount || 0,
        });
        setRecentOrders(orderList);
      } catch (err) {
        console.error("[Dashboard] Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const dashboardStats = [
    { label: "Revenus", value: stats.revenue, format: "fcfa", delta: "", trend: "up" as const, color: "green" as const, icon: "Wallet" },
    { label: "Commandes", value: stats.orders, format: "number", delta: "", trend: "up" as const, color: "orange" as const, icon: "ShoppingCart" },
    { label: "Clients", value: stats.customers, format: "number", delta: "", trend: "up" as const, color: "blue" as const, icon: "Users" },
    { label: "Produits", value: stats.products, format: "number", delta: "", trend: "up" as const, color: "purple" as const, icon: "Package" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tableau de Bord"
        subtitle={`Bienvenue, ${profile?.full_name?.split(" ")[0] || "Marchand"} ! Voici un aperçu de votre activité.`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="p-4 lg:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.color === "green" && "bg-yaa-green-50 dark:bg-yaa-green-950/50 text-yaa-green-600",
                stat.color === "orange" && "bg-yaa-orange-50 dark:bg-yaa-orange-950/50 text-yaa-orange-600",
                stat.color === "blue" && "bg-blue-50 dark:bg-blue-950/50 text-blue-600",
                stat.color === "purple" && "bg-purple-50 dark:bg-purple-950/50 text-purple-600",
              )}>
                <DynamicIcon name={stat.icon} className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
              {stat.format === "fcfa" ? formatFCFA(stat.value) : stat.value}
            </p>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Empty state or Recent orders */}
      {recentOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-display font-bold text-lg mb-1">Aucune commande pour le moment</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Ajoutez vos premiers produits et partagez votre boutique pour recevoir vos premières commandes.
          </p>
          <Button onClick={() => router.push("/admin/produits/nouveau")} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            <Plus className="w-4 h-4" /> Ajouter un produit
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-4 lg:p-5 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-base lg:text-lg">
                Commandes récentes
              </h2>
              <a href="/admin/commandes" className="text-xs font-semibold text-yaa-green-600 hover:underline">
                Voir tout
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 lg:px-5 py-2.5">ID</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Client</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-2.5 hidden sm:table-cell">Ville</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-2.5">Montant</th>
                  <th className="text-center font-medium text-muted-foreground px-4 lg:px-5 py-2.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 lg:px-5 py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-muted text-xs font-semibold">
                            {order.customer_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {order.customer_city || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatFCFA(order.amount)}
                    </td>
                    <td className="px-4 lg:px-5 py-3 text-center">
                      <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded",
                        STATUS_STYLES[order.status] || "bg-muted text-muted-foreground"
                      )}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
