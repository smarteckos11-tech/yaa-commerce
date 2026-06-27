"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Plus,
  MapPin,
  ArrowRight,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  Zap,
  Loader2,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const CARRIER_BADGES: Record<string, { bg: string; text: string }> = {
  Yango: { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-300" },
  DHL: { bg: "bg-red-100 dark:bg-red-950/50", text: "text-red-700 dark:text-red-300" },
  "Coursier Local": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300" },
  FedEx: { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-300" },
};

const SHIPMENT_STATUS: Record<string, string> = {
  en_transit: "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400",
  livre: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  en_preparation: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  retourne: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  expedie: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
};

const STATUS_LABELS: Record<string, string> = {
  expedie: "Expédié",
  livre: "Livré",
  en_preparation: "En préparation",
  en_transit: "En transit",
  retourne: "Retourné",
};

const DELIVERY_CITIES = [
  "Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro", "Daloa", "Korhogo", "Man",
  "Dakar", "Bamako", "Accra", "Lagos", "Cotonou", "Conakry", "Ouagadougou", "Lomé",
];

const CARRIERS = [
  { name: "Yango", color: "#E11D48", coverage: "Abidjan, Dakar, Accra, Lagos", deliveries: 487, rating: 4.8, delay: "2h - 24h", price: "1 500 - 5 000 FCFA" },
  { name: "DHL", color: "#D40511", coverage: "International + grandes villes", deliveries: 234, rating: 4.9, delay: "24h - 72h", price: "5 000 - 25 000 FCFA" },
  { name: "Coursier Local", color: "#0F8A5F", coverage: "Intérieur Côte d'Ivoire", deliveries: 312, rating: 4.6, delay: "24h - 72h", price: "2 000 - 8 000 FCFA" },
  { name: "FedEx", color: "#7D2C8C", coverage: "International express", deliveries: 89, rating: 4.7, delay: "48h - 96h", price: "8 000 - 30 000 FCFA" },
];

type Order = {
  id: string;
  customer_name: string;
  customer_city: string | null;
  customer_country: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  cod_enabled: boolean;
  cod_amount: number | null;
  cod_status: string | null;
  created_at: string;
};

export default function LivraisonsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Calculator state
  const [origin, setOrigin] = React.useState("Abidjan");
  const [destination, setDestination] = React.useState("Dakar");
  const [weight, setWeight] = React.useState("1-2");
  const [calculated, setCalculated] = React.useState(false);

  const loadOrders = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["expedie", "livre"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (err) {
      console.error("[Livraisons] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Stats
  const inTransit = orders.filter(o => o.status === "expedie").length;
  const delivered = orders.filter(o => o.status === "livre").length;
  const codOrders = orders.filter(o => o.cod_enabled && o.status === "expedie");

  // Calculator results
  const calcResults = [
    { carrier: "Yango", price: 2500, delay: "24-48h", best: true, color: "#E11D48" },
    { carrier: "DHL Express", price: 8500, delay: "48-72h", best: false, color: "#D40511" },
    { carrier: "FedEx International", price: 12000, delay: "72-96h", best: false, color: "#7D2C8C" },
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
        title="Livraisons"
        subtitle="Suivez vos expéditions et calculez vos frais de livraison"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50" onClick={() => document.getElementById("calculateur")?.scrollIntoView({ behavior: "smooth" })}>
              <Calculator className="w-4 h-4" /> Calculer frais
            </Button>
            <Button size="sm" className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600" onClick={() => toast({ title: "Nouvelle expédition", description: "Création d'expédition manuelle bientôt disponible" })}>
              <Plus className="w-4 h-4" /> Nouvelle expédition
            </Button>
          </>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 dark:bg-yaa-orange-950/50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-yaa-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{inTransit}</p>
          <p className="text-xs text-muted-foreground">En transit</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-yaa-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{delivered}</p>
          <p className="text-xs text-muted-foreground">Livrées</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">3.2</p>
          <p className="text-xs text-muted-foreground">Délai moyen (jours)</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 100}%</p>
          <p className="text-xs text-muted-foreground">Taux livraison</p>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="expeditions">
          <TabsList className="mb-4">
            <TabsTrigger value="expeditions">Expéditions</TabsTrigger>
            <TabsTrigger value="transporteurs">Transporteurs</TabsTrigger>
            <TabsTrigger value="calculateur">Calculateur</TabsTrigger>
          </TabsList>

          {/* Expéditions */}
          <TabsContent value="expeditions" className="mt-0">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Truck className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h2 className="font-display font-bold text-lg mb-1">Aucune expédition</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Les commandes expédiées apparaîtront ici automatiquement. Marquez vos commandes comme "Expédié" dans l'onglet Commandes.
                </p>
              </Card>
            ) : (
              <Card className="p-4 lg:p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5">ID</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Trajet</th>
                        <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                        <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Date</th>
                        <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">COD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-3 py-3 font-medium">{order.customer_name}</td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 text-muted-foreground" /> Abidjan</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 text-yaa-orange-500" /> {order.customer_city || "—"}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", SHIPMENT_STATUS[order.status] || "bg-muted text-muted-foreground")}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                            {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                          </td>
                          <td className="px-3 py-3 text-right hidden md:table-cell">
                            {order.cod_enabled ? (
                              <span className={cn("text-xs font-bold", order.cod_status === "collecte" ? "text-yaa-green-600" : "text-amber-600")}>
                                {order.cod_status === "collecte" ? "Collecté ✓" : order.cod_status === "non_collecte" ? "Refusé ✗" : "À collecter"}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Transporteurs */}
          <TabsContent value="transporteurs" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {CARRIERS.map((c, idx) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 lg:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: c.color }}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.coverage}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-[10px] text-muted-foreground">Livraisons</p><p className="font-bold">{c.deliveries}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Note</p><p className="font-bold flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {c.rating}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Délai</p><p className="font-bold text-xs">{c.delay}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Tarifs</p><p className="font-bold text-xs">{c.price}</p></div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Calculateur */}
          <TabsContent value="calculateur" className="mt-0" id="calculateur">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 lg:p-6">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 h-5 text-yaa-orange-500" /> Calculer les frais de livraison
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Ville d'origine</label>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Ville de destination</label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Poids du colis</label>
                    <Select value={weight} onValueChange={setWeight}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0 - 1 kg</SelectItem>
                        <SelectItem value="1-2">1 - 2 kg</SelectItem>
                        <SelectItem value="2-5">2 - 5 kg</SelectItem>
                        <SelectItem value="5-10">5 - 10 kg</SelectItem>
                        <SelectItem value="10+">10+ kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5" onClick={() => setCalculated(true)}>
                    <Zap className="w-4 h-4" /> Calculer les frais
                  </Button>
                </div>
              </Card>

              <div>
                {calculated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {origin} → {destination} · {weight} kg
                    </p>
                    {calcResults.map((r, idx) => (
                      <motion.div key={r.carrier} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={cn("p-4 relative overflow-hidden", r.best && "border-yaa-green-500 border-2")}>
                          {r.best && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded">Moins cher</span>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: r.color }}>{r.carrier[0]}</div>
                            <div className="flex-1">
                              <p className="font-semibold">{r.carrier}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {r.delay}</p>
                            </div>
                          </div>
                          <p className="text-2xl font-display font-bold text-yaa-green-600">{formatFCFA(r.price)}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center h-full flex flex-col items-center justify-center border-dashed">
                    <Truck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Configurez les paramètres et cliquez sur "Calculer les frais"</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
