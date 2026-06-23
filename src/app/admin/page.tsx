import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { DASHBOARD_STATS, RECENT_ORDERS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  "Livré": "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  "En cours": "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400",
  "En attente": "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Tableau de Bord"
        subtitle="Bienvenue, Moussa ! Voici un aperçu de votre activité aujourd'hui."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            delta={stat.delta}
            trend={stat.trend}
            color={stat.color}
            icon={stat.icon}
            format={stat.format as "number" | "fcfa" | "percent" | undefined}
          />
        ))}
      </div>

      {/* Recent orders */}
      <Card className="overflow-hidden">
        <div className="p-4 lg:p-5 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base lg:text-lg">
              Commandes récentes
            </h2>
            <a
              href="/admin/commandes"
              className="text-xs font-semibold text-yaa-green-600 hover:underline"
            >
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
              {RECENT_ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="border-b last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 lg:px-5 py-3 font-mono text-xs">{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-muted text-xs font-semibold">
                          {order.client.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{order.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {order.city}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatFCFA(order.amount)}
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-center">
                    <span
                      className={cn(
                        "inline-block text-xs font-semibold px-2 py-0.5 rounded",
                        STATUS_STYLES[order.status]
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
