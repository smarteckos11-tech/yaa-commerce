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
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

// ---------- animations ----------
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ---------- inline constants (NOT imported from admin-data) ----------

type ShipmentStatus = "en_preparation" | "en_transit" | "livre" | "retourne";

const SHIPMENT_STATUS_INFO: Record<
  ShipmentStatus,
  { label: string; badge: string; dot: string }
> = {
  en_preparation: {
    label: "En préparation",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  en_transit: {
    label: "En transit",
    badge: "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400",
    dot: "bg-yaa-orange-500",
  },
  livre: {
    label: "Livré",
    badge: "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
    dot: "bg-yaa-green-500",
  },
  retourne: {
    label: "Retourné",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: "en_preparation", label: "En préparation" },
  { value: "en_transit", label: "En transit" },
  { value: "livre", label: "Livré" },
  { value: "retourne", label: "Retourné" },
];

// Carrier master data (static display info — used as base for Transporteurs + form select)
const CARRIERS: {
  name: "Yango" | "DHL" | "Coursier Local" | "FedEx";
  color: string;
  coverage: string;
  delay: string;
  rating: number;
  price: string;
}[] = [
  { name: "Yango", color: "#E11D48", coverage: "Local & sous-régional", delay: "24-48h", rating: 4.6, price: "dès 2 500 FCFA" },
  { name: "DHL", color: "#D40511", coverage: "International", delay: "48-72h", rating: 4.8, price: "dès 8 500 FCFA" },
  { name: "Coursier Local", color: "#16A34A", coverage: "Intra-ville", delay: "2-6h", rating: 4.4, price: "dès 1 500 FCFA" },
  { name: "FedEx", color: "#7D2C8C", coverage: "International express", delay: "72-96h", rating: 4.7, price: "dès 12 000 FCFA" },
];

const CARRIER_BADGES: Record<string, { bg: string; text: string }> = {
  "Yango": { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-400" },
  "DHL": { bg: "bg-red-100 dark:bg-red-950/50", text: "text-red-700 dark:text-red-400" },
  "Coursier Local": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-400" },
  "FedEx": { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-400" },
};

const DELIVERY_CITIES_LIST: string[] = [
  "Abidjan",
  "Bouaké",
  "Yamoussoukro",
  "Dakar",
  "Bamako",
  "Ouagadougou",
  "Conakry",
  "Lomé",
  "Cotonou",
  "Niamey",
  "Accra",
  "Lagos",
  "Douala",
  "Yaoundé",
  "Libreville",
  "Malabo",
  "Bangui",
  "Brazzaville",
  "Kinshasa",
  "Paris",
  "Londres",
  "New York",
  "Dubaï",
];

// Calculator results — static pricing for 3 carriers
const CALCULATOR_RESULTS = [
  { carrier: "Yango", price: 2500, delay: "24-48h", best: true, color: "#E11D48" },
  { carrier: "DHL", price: 8500, delay: "48-72h", best: false, color: "#D40511" },
  { carrier: "FedEx", price: 12000, delay: "72-96h", best: false, color: "#7D2C8C" },
];

// ---------- types ----------
type Shipment = {
  id: string;
  user_id: string;
  order_id: string | null;
  customer_name: string;
  origin_city: string | null;
  destination_city: string | null;
  carrier: string | null;
  tracking_code: string | null;
  status: ShipmentStatus;
  eta: string | null;
  fee: number | null;
  cod_amount: number | null;
  cod_status: string | null;
  created_at: string;
};

// ---------- helpers ----------

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `YAA-${s}`;
}

function formatEta(value: string | null): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return "—";
  }
}

const COD_LABELS: Record<string, string> = {
  a_collecter: "À collecter",
  collecte: "Collecté ✓",
  non_collecte: "Refusé ✗",
  reconcilie: "Réconcilié",
};

const COD_COLORS: Record<string, string> = {
  a_collecter: "text-amber-600",
  collecte: "text-yaa-green-600",
  non_collecte: "text-rose-600",
  reconcilie: "text-sky-600",
};

// ============================================================
// Page
// ============================================================
export default function LivraisonsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [shipments, setShipments] = React.useState<Shipment[]>([]);

  // Calculator state
  const [calculated, setCalculated] = React.useState(false);
  const [origin, setOrigin] = React.useState("Abidjan");
  const [destination, setDestination] = React.useState("Dakar");
  const [weight, setWeight] = React.useState("1-2");

  // New shipment dialog state
  const [newOpen, setNewOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newShipment, setNewShipment] = React.useState({
    customerName: "",
    originCity: "Abidjan",
    destinationCity: "Dakar",
    carrier: "Yango" as "Yango" | "DHL" | "Coursier Local" | "FedEx",
    fee: 2500,
  });

  // -------- load shipments from Supabase --------
  const loadShipments = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments((data || []) as Shipment[]);
    } catch (err) {
      console.error("[Livraisons] Error loading shipments:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Chargement impossible",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  // -------- update status inline --------
  const updateStatus = async (shipmentId: string, newStatus: ShipmentStatus) => {
    setUpdatingId(shipmentId);
    try {
      const { error } = await supabase
        .from("shipments")
        .update({ status: newStatus })
        .eq("id", shipmentId);

      if (error) throw error;

      setShipments(
        shipments.map((s) => (s.id === shipmentId ? { ...s, status: newStatus } : s))
      );
      toast({
        title: "Statut mis à jour ✓",
        description: `Expédition → ${SHIPMENT_STATUS_INFO[newStatus].label}`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Mise à jour impossible",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // -------- create new shipment --------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newShipment.customerName.trim()) {
      toast({ title: "Champ requis", description: "Le nom du client est obligatoire", variant: "destructive" });
      return;
    }
    if (!newShipment.fee || newShipment.fee <= 0) {
      toast({ title: "Frais invalides", description: "Renseignez un montant valide", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const trackingCode = generateTrackingCode();
      const payload = {
        user_id: user.id,
        customer_name: newShipment.customerName.trim(),
        origin_city: newShipment.originCity,
        destination_city: newShipment.destinationCity,
        carrier: newShipment.carrier,
        tracking_code: trackingCode,
        status: "en_preparation" as ShipmentStatus,
        fee: newShipment.fee,
      };

      const { data, error } = await supabase
        .from("shipments")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setShipments([data as Shipment, ...shipments]);
      setNewOpen(false);
      setNewShipment({
        customerName: "",
        originCity: "Abidjan",
        destinationCity: "Dakar",
        carrier: "Yango",
        fee: 2500,
      });
      toast({
        title: "Expédition créée ✓",
        description: `Suivi ${trackingCode} · ${formatFCFA(newShipment.fee)}`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Création impossible",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // -------- stats computed from real data --------
  const stats = React.useMemo(() => {
    const total = shipments.length;
    const delivered = shipments.filter((s) => s.status === "livre").length;
    const inTransit = shipments.filter((s) => s.status === "en_transit").length;
    const rate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return [
      { label: "Total expéditions", value: total, color: "blue" as const, icon: "Truck" },
      { label: "Livrées", value: delivered, color: "green" as const, icon: "CheckCircle2" },
      { label: "En transit", value: inTransit, color: "orange" as const, icon: "Clock" },
      { label: "Taux de livraison", value: rate, format: "percent" as const, color: "purple" as const, icon: "TrendingUp" },
    ];
  }, [shipments]);

  // -------- per-carrier stats computed from real shipments --------
  const carrierStats = React.useMemo(() => {
    const map: Record<string, { deliveries: number; revenue: number }> = {};
    for (const c of CARRIERS) {
      map[c.name] = { deliveries: 0, revenue: 0 };
    }
    for (const s of shipments) {
      const carrier = s.carrier || "";
      if (!map[carrier]) map[carrier] = { deliveries: 0, revenue: 0 };
      map[carrier].deliveries += 1;
      map[carrier].revenue += s.fee || 0;
    }
    return map;
  }, [shipments]);

  // -------- loading state --------
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
        subtitle="Gérez vos expéditions et calculez vos frais de livraison"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={loadShipments}
            >
              <RefreshCw className="h-4 w-4" /> Actualiser
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"
              onClick={() => setNewOpen(true)}
            >
              <Plus className="h-4 w-4" /> Nouvelle expédition
            </Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            format={s.format as "number" | "fcfa" | "percent" | undefined}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="expeditions">
          <TabsList className="mb-4">
            <TabsTrigger value="expeditions">Expéditions</TabsTrigger>
            <TabsTrigger value="transporteurs">Transporteurs</TabsTrigger>
            <TabsTrigger value="calculateur">Calculateur</TabsTrigger>
          </TabsList>

          {/* =================================================== */}
          {/* TAB: Expéditions                                    */}
          {/* =================================================== */}
          <TabsContent value="expeditions" className="mt-0">
            {shipments.length === 0 ? (
              <Card className="p-12 text-center">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold">Aucune expédition</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créez votre première expédition avec le bouton « Nouvelle expédition ».
                </p>
                <Button
                  size="sm"
                  className="mt-4 gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"
                  onClick={() => setNewOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Nouvelle expédition
                </Button>
              </Card>
            ) : (
              <Card className="p-4 lg:p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Suivi</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Trajet</th>
                        <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Transporteur</th>
                        <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                        <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">ETA</th>
                        <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">COD</th>
                        <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Frais</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((s, idx) => {
                        const badge = s.carrier ? CARRIER_BADGES[s.carrier] : null;
                        const statusInfo = SHIPMENT_STATUS_INFO[s.status] || SHIPMENT_STATUS_INFO.en_preparation;
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="border-b last:border-b-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-3 font-mono text-xs">
                              {s.tracking_code || "—"}
                            </td>
                            <td className="px-3 py-3 font-medium">{s.customer_name || "—"}</td>
                            <td className="px-3 py-3 hidden md:table-cell">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="inline-flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3 text-muted-foreground" /> {s.origin_city || "—"}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="inline-flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3 text-yaa-orange-500" /> {s.destination_city || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {s.carrier && badge ? (
                                <span
                                  className={cn(
                                    "inline-block text-xs font-semibold px-2 py-0.5 rounded",
                                    badge.bg,
                                    badge.text
                                  )}
                                >
                                  {s.carrier}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex justify-center">
                                <Select
                                  value={s.status}
                                  onValueChange={(v) => updateStatus(s.id, v as ShipmentStatus)}
                                  disabled={updatingId === s.id}
                                >
                                  <SelectTrigger className="h-8 w-[150px] text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-1.5">
                                          <span className={cn("w-1.5 h-1.5 rounded-full", SHIPMENT_STATUS_INFO[opt.value].dot)} />
                                          {opt.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                              {formatEta(s.eta)}
                            </td>
                            <td className="px-3 py-3 text-right hidden md:table-cell">
                              {s.cod_amount ? (
                                <div className="flex flex-col items-end">
                                  <span className={cn("text-xs font-bold", COD_COLORS[s.cod_status || ""] || "text-foreground")}>
                                    {formatFCFA(s.cod_amount)}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {COD_LABELS[s.cod_status || ""] || s.cod_status || "—"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-yaa-green-600">
                              {s.fee ? formatFCFA(s.fee) : "—"}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* =================================================== */}
          {/* TAB: Transporteurs                                  */}
          {/* =================================================== */}
          <TabsContent value="transporteurs" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {CARRIERS.map((c, idx) => {
                const stats = carrierStats[c.name] || { deliveries: 0, revenue: 0 };
                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="p-4 lg:p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: c.color }}
                        >
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{c.coverage}</p>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {c.rating}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Livraisons (réelles)</p>
                          <p className="font-bold flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            {stats.deliveries}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Revenu frais</p>
                          <p className="font-bold text-yaa-green-600">{formatFCFA(stats.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Délai moyen</p>
                          <p className="font-bold text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" /> {c.delay}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Tarifs</p>
                          <p className="font-bold text-xs">{c.price}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* =================================================== */}
          {/* TAB: Calculateur                                    */}
          {/* =================================================== */}
          <TabsContent value="calculateur" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 lg:p-6">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-yaa-orange-500" /> Calculer les frais de livraison
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Ville d&apos;origine</Label>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES_LIST.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Ville de destination</Label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES_LIST.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Poids du colis</Label>
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
                  <Button
                    className="w-full bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5"
                    onClick={() => setCalculated(true)}
                  >
                    <Zap className="h-4 w-4" /> Calculer les frais
                  </Button>
                </div>
              </Card>

              {/* Results */}
              <div>
                {calculated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {origin} → {destination} · {weight} kg
                    </p>
                    {CALCULATOR_RESULTS.map((r, idx) => (
                      <motion.div
                        key={r.carrier}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={cn("p-4 relative overflow-hidden", r.best && "border-yaa-green-500 border-2")}>
                          {r.best && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded">
                              Moins cher
                            </span>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ background: r.color }}
                            >
                              {r.carrier[0]}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{r.carrier}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {r.delay}
                              </p>
                            </div>
                          </div>
                          <p className="text-2xl font-display font-bold text-yaa-green-600">
                            {formatFCFA(r.price)}
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center h-full flex flex-col items-center justify-center border-dashed">
                    <Truck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Configurez les paramètres et cliquez sur « Calculer les frais » pour voir les options de livraison disponibles.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* =================================================== */}
      {/* DIALOG: Nouvelle expédition                         */}
      {/* =================================================== */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-yaa-orange-500" /> Nouvelle expédition
            </DialogTitle>
            <DialogDescription>
              Créez une expédition. Un code de suivi sera généré automatiquement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Nom du client *</Label>
              <Input
                className="mt-1"
                placeholder="Ex: Aïcha Diallo"
                value={newShipment.customerName}
                onChange={(e) => setNewShipment({ ...newShipment, customerName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Ville d&apos;origine</Label>
                <Select
                  value={newShipment.originCity}
                  onValueChange={(v) => setNewShipment({ ...newShipment, originCity: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_CITIES_LIST.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Ville de destination</Label>
                <Select
                  value={newShipment.destinationCity}
                  onValueChange={(v) => setNewShipment({ ...newShipment, destinationCity: v })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DELIVERY_CITIES_LIST.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Transporteur</Label>
              <Select
                value={newShipment.carrier}
                onValueChange={(v) =>
                  setNewShipment({
                    ...newShipment,
                    carrier: v as "Yango" | "DHL" | "Coursier Local" | "FedEx",
                  })
                }
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Frais de livraison (FCFA) *</Label>
              <Input
                type="number"
                min="0"
                step="100"
                className="mt-1"
                placeholder="Ex: 2500"
                value={newShipment.fee}
                onChange={(e) => setNewShipment({ ...newShipment, fee: Number(e.target.value) })}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Sera enregistré comme statut « En préparation ». Code de suivi généré au format YAA-XXXXXXXX.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={creating}
                className="bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Créer l&apos;expédition</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
