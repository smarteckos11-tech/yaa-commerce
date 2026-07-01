"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Settings,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Globe,
  Banknote,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Inbox,
  PackageOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// ---------- Animation ----------
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ---------- Static provider info (inline — NO mock import) ----------
type ProviderInfo = {
  name: string;
  type: string;
  country: string;
  color: string;
  initials: string;
};

const PROVIDER_INFO: ProviderInfo[] = [
  { name: "Wave", type: "Mobile Money", country: "Sénégal, Côte d'Ivoire", color: "#1DC7EA", initials: "W" },
  { name: "Orange Money", type: "Mobile Money", country: "Côte d'Ivoire, Mali", color: "#FF6600", initials: "OM" },
  { name: "MTN MoMo", type: "Mobile Money", country: "Ghana, Côte d'Ivoire", color: "#FFCC00", initials: "MTN" },
  { name: "Moov", type: "Mobile Money", country: "Bénin, Burkina", color: "#00A0E3", initials: "MV" },
  { name: "Carte bancaire", type: "Carte bancaire", country: "International", color: "#8B5CF6", initials: "CB" },
  { name: "Paiement à la livraison", type: "Cash (COD)", country: "Toute l'Afrique", color: "#0F8A5F", initials: "COD" },
];

// Inline provider badge colors (for transaction rows)
const PROVIDER_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  Wave: { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300", dot: "#1DC7EA" },
  "Orange Money": { bg: "bg-orange-100 dark:bg-orange-950/50", text: "text-orange-700 dark:text-orange-300", dot: "#FF6600" },
  "MTN MoMo": { bg: "bg-yellow-100 dark:bg-yellow-950/50", text: "text-yellow-700 dark:text-yellow-300", dot: "#FFCC00" },
  Moov: { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-300", dot: "#00A0E3" },
  "Carte bancaire": { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-300", dot: "#8B5CF6" },
  "Paiement à la livraison": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300", dot: "#0F8A5F" },
};

// ---------- Status maps ----------
type TxStatus = "reussi" | "en_attente" | "echec";

const TX_STATUS_MAP: Record<TxStatus, { label: string; icon: React.ElementType; color: string }> = {
  reussi: { label: "Réussi", icon: CheckCircle2, color: "text-yaa-green-600" },
  en_attente: { label: "En attente", icon: Clock, color: "text-amber-600" },
  echec: { label: "Échec", icon: XCircle, color: "text-rose-600" },
};

type CodStatus = "a_collecter" | "collecte" | "non_collecte" | "reconcilie";

const COD_STATUS_INFO: Record<CodStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  a_collecter: { label: "À collecter", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/50", icon: Clock },
  collecte: { label: "Collecté", color: "text-yaa-green-700 dark:text-yaa-green-400", bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", icon: CheckCircle2 },
  non_collecte: { label: "Non collecté", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950/50", icon: XCircle },
  reconcilie: { label: "Réconcilié", color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-950/50", icon: Banknote },
};

// ---------- Types ----------
type Transaction = {
  id: string;
  user_id: string;
  order_id: string | null;
  customer_name: string | null;
  provider: string;
  amount: number;
  reference: string | null;
  status: TxStatus;
  created_at: string;
};

type PaymentProvider = {
  id: string;
  user_id: string;
  provider_name: string;
  is_connected: boolean;
  balance: number;
  transactions_count: number;
  created_at: string;
};

type CodOrder = {
  id: string;
  user_id: string;
  customer_name: string | null;
  customer_city: string | null;
  amount: number;
  cod_enabled: boolean;
  cod_amount: number | null;
  cod_status: CodStatus | null;
  cod_collected_by: string | null;
  cod_discrepancy: number | null;
  created_at: string;
};

// ---------- Helpers ----------
function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ============================ PAGE ============================
export default function PaiementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [providers, setProviders] = React.useState<PaymentProvider[]>([]);
  const [codOrders, setCodOrders] = React.useState<CodOrder[]>([]);

  // Loading
  const [loadingTx, setLoadingTx] = React.useState(true);
  const [loadingProviders, setLoadingProviders] = React.useState(true);
  const [loadingCod, setLoadingCod] = React.useState(true);

  // Filters
  const [txSearch, setTxSearch] = React.useState("");
  const [txStatusFilter, setTxStatusFilter] = React.useState<string>("all");

  // Action loaders
  const [togglingProvider, setTogglingProvider] = React.useState<string | null>(null);
  const [updatingCodId, setUpdatingCodId] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  // ---------- Loaders ----------
  const loadTransactions = React.useCallback(async () => {
    if (!user) return;
    setLoadingTx(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (err) {
      console.error("[Paiements] transactions:", err);
      toast({ title: "Erreur", description: "Impossible de charger les transactions", variant: "destructive" });
    } finally {
      setLoadingTx(false);
    }
  }, [user, toast]);

  const loadProviders = React.useCallback(async () => {
    if (!user) return;
    setLoadingProviders(true);
    try {
      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setProviders((data || []) as PaymentProvider[]);
    } catch (err) {
      console.error("[Paiements] providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  }, [user]);

  const loadCod = React.useCallback(async () => {
    if (!user) return;
    setLoadingCod(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("cod_enabled", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCodOrders((data || []) as CodOrder[]);
    } catch (err) {
      console.error("[Paiements] cod:", err);
    } finally {
      setLoadingCod(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      loadTransactions();
      loadProviders();
      loadCod();
    }
  }, [user, loadTransactions, loadProviders, loadCod]);

  const reloadAll = async () => {
    setSyncing(true);
    await Promise.all([loadTransactions(), loadProviders(), loadCod()]);
    setSyncing(false);
    toast({ title: "Synchronisé ✓", description: "Données de paiement actualisées" });
  };

  // ---------- Top stats from real transactions ----------
  const stats = React.useMemo(() => {
    const totalVolume = transactions
      .filter((t) => t.status === "reussi")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalCount = transactions.length;
    const pendingCount = transactions.filter((t) => t.status === "en_attente").length;
    const failedCount = transactions.filter((t) => t.status === "echec").length;
    return { totalVolume, totalCount, pendingCount, failedCount };
  }, [transactions]);

  // ---------- Provider actions ----------
  const getProviderData = (name: string) =>
    providers.find((p) => p.provider_name === name);

  const toggleProvider = async (name: string) => {
    if (!user) return;
    setTogglingProvider(name);
    const existing = getProviderData(name);
    const newConnected = existing ? !existing.is_connected : true;
    try {
      if (existing) {
        // UPDATE existing row
        const { error } = await supabase
          .from("payment_providers")
          .update({ is_connected: newConnected })
          .eq("id", existing.id);
        if (error) throw error;
        setProviders(
          providers.map((p) =>
            p.id === existing.id ? { ...p, is_connected: newConnected } : p
          )
        );
      } else {
        // INSERT new row (was not configured before)
        const { data, error } = await supabase
          .from("payment_providers")
          .insert({
            user_id: user.id,
            provider_name: name,
            is_connected: true,
            balance: 0,
            transactions_count: 0,
          })
          .select()
          .single();
        if (error) throw error;
        setProviders([...providers, data as PaymentProvider]);
      }
      toast({
        title: newConnected ? `${name} connecté ✓` : `${name} déconnecté`,
        description: newConnected
          ? "Le fournisseur est désormais actif"
          : "Le fournisseur a été désactivé",
      });
    } catch (err) {
      console.error("[Paiements] toggle provider:", err);
      toast({ title: "Erreur", description: "Action impossible", variant: "destructive" });
    } finally {
      setTogglingProvider(null);
    }
  };

  // ---------- Transaction filtering ----------
  const filteredTx = React.useMemo(() => {
    let list = transactions;
    if (txStatusFilter !== "all") {
      list = list.filter((t) => t.status === txStatusFilter);
    }
    const q = txSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.customer_name || "").toLowerCase().includes(q) ||
          (t.reference || "").toLowerCase().includes(q) ||
          (t.id || "").toLowerCase().includes(q) ||
          (t.provider || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, txStatusFilter, txSearch]);

  // ---------- COD stats from real data ----------
  const codStats = React.useMemo(() => {
    const totalToCollect = codOrders
      .filter((o) => o.cod_status === "a_collecter")
      .reduce((s, o) => s + (o.cod_amount || 0), 0);
    const totalCollected = codOrders
      .filter((o) => o.cod_status === "collecte")
      .reduce((s, o) => s + (o.cod_amount || 0), 0);
    const totalDiscrepancy = codOrders.reduce(
      (s, o) => s + Math.max(0, o.cod_discrepancy || 0),
      0
    );
    const totalReconciled = codOrders
      .filter((o) => o.cod_status === "reconcilie")
      .reduce((s, o) => s + (o.cod_amount || 0), 0);
    const pendingOrders = codOrders.filter((o) => o.cod_status === "a_collecter").length;
    return { totalToCollect, totalCollected, totalDiscrepancy, totalReconciled, pendingOrders };
  }, [codOrders]);

  // ---------- COD actions ----------
  const updateCodStatus = async (orderId: string, newStatus: CodStatus) => {
    if (!user) return;
    setUpdatingCodId(orderId);
    try {
      const update: Record<string, unknown> = { cod_status: newStatus };
      if (newStatus === "collecte") {
        update.cod_collected_by = "Vous";
      }
      const { error } = await supabase.from("orders").update(update).eq("id", orderId);
      if (error) throw error;
      setCodOrders(
        codOrders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                cod_status: newStatus,
                cod_collected_by: newStatus === "collecte" ? "Vous" : o.cod_collected_by,
              }
            : o
        )
      );
      toast({
        title: "Statut mis à jour ✓",
        description: `Commande marquée « ${COD_STATUS_INFO[newStatus].label} »`,
      });
    } catch (err) {
      console.error("[Paiements] cod update:", err);
      toast({ title: "Erreur", description: "Mise à jour impossible", variant: "destructive" });
    } finally {
      setUpdatingCodId(null);
    }
  };

  const bulkReconcile = async () => {
    if (!user) return;
    const toReconcile = codOrders.filter((o) => o.cod_status === "collecte");
    if (toReconcile.length === 0) {
      toast({ title: "Rien à réconcilier", description: "Aucune commande collectée en attente" });
      return;
    }
    setUpdatingCodId("bulk");
    try {
      const ids = toReconcile.map((o) => o.id);
      const { error } = await supabase
        .from("orders")
        .update({ cod_status: "reconcilie" })
        .in("id", ids);
      if (error) throw error;
      setCodOrders(
        codOrders.map((o) =>
          ids.includes(o.id) ? { ...o, cod_status: "reconcilie" } : o
        )
      );
      toast({
        title: "Réconciliation terminée ✓",
        description: `${toReconcile.length} commande(s) réconciliée(s)`,
      });
    } catch (err) {
      console.error("[Paiements] bulk reconcile:", err);
      toast({ title: "Erreur", description: "Réconciliation impossible", variant: "destructive" });
    } finally {
      setUpdatingCodId(null);
    }
  };

  // ============================ RENDER ============================
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Paiements"
        subtitle="Gérez vos fournisseurs de paiement Mobile Money et transactions"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={reloadAll}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> Synchroniser
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="h-4 w-4" /> Configurer
            </Button>
          </>
        }
      />

      {/* Stats — computed from real transactions */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <StatCard
          label="Volume total"
          value={stats.totalVolume}
          color="green"
          icon="Wallet"
          format="fcfa"
        />
        <StatCard
          label="Transactions"
          value={stats.totalCount}
          color="orange"
          icon="CreditCard"
          format="number"
        />
        <StatCard
          label="En attente"
          value={stats.pendingCount}
          color="amber"
          icon="Clock"
          format="number"
        />
        <StatCard
          label="Échecs"
          value={stats.failedCount}
          color="red"
          icon="XCircle"
          format="number"
        />
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="fournisseurs">
          <TabsList className="mb-4">
            <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cod" className="gap-1.5">
              <Banknote className="w-3.5 h-3.5" />
              COD (Cash)
              {codStats.pendingOrders > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-yaa-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {codStats.pendingOrders}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* =================================================== */}
          {/* TAB — FOURNISSEURS                                  */}
          {/* =================================================== */}
          <TabsContent value="fournisseurs" className="mt-0">
            {loadingProviders ? (
              <Card className="p-0">
                <LoadingState label="Chargement des fournisseurs…" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {PROVIDER_INFO.map((p, idx) => {
                  const data = getProviderData(p.name);
                  const connected = data?.is_connected ?? false;
                  const balance = data?.balance ?? 0;
                  const txCount = data?.transactions_count ?? 0;
                  const isToggling = togglingProvider === p.name;
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-1.5" style={{ background: p.color }} />
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: p.color }}
                            >
                              {p.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold truncate">{p.name}</p>
                                {connected && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">
                                    <span className="w-1 h-1 rounded-full bg-yaa-green-500" /> Connecté
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">{p.type}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                            <Globe className="h-3 w-3" /> {p.country}
                          </p>
                          {connected ? (
                            <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-muted/50 rounded-lg">
                              <div>
                                <p className="text-[10px] text-muted-foreground">Solde</p>
                                <p className="text-sm font-bold">{formatFCFA(balance)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground">Transactions</p>
                                <p className="text-sm font-bold">{txCount.toLocaleString("fr-FR")}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-3 p-2.5 bg-muted/30 rounded-lg text-center">
                              <p className="text-xs text-muted-foreground">Non configuré</p>
                            </div>
                          )}
                          <Button
                            variant={connected ? "outline" : "default"}
                            size="sm"
                            className={cn("w-full", !connected && "bg-yaa-green-500 hover:bg-yaa-green-600")}
                            onClick={() => toggleProvider(p.name)}
                            disabled={isToggling}
                          >
                            {isToggling ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Traitement…
                              </>
                            ) : connected ? (
                              "Déconnecter"
                            ) : (
                              "Connecter"
                            )}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* =================================================== */}
          {/* TAB — TRANSACTIONS                                  */}
          {/* =================================================== */}
          <TabsContent value="transactions" className="mt-0">
            <Card className="p-4 lg:p-5">
              {loadingTx ? (
                <LoadingState label="Chargement des transactions…" />
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Aucune transaction"
                  description="Les paiements reçus via vos fournisseurs connectés apparaîtront ici."
                />
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher une transaction (client, référence, ID)…"
                        className="pl-9"
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                      />
                    </div>
                    <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                      <SelectTrigger size="sm" className="w-full sm:w-44">
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="reussi">Réussi</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="echec">Échec</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredTx.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="Aucun résultat"
                      description="Aucune transaction ne correspond à votre recherche."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left font-medium text-muted-foreground px-3 py-2.5">ID</th>
                            <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                            <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Fournisseur</th>
                            <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Montant</th>
                            <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Référence</th>
                            <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                            <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTx.map((tx, idx) => {
                            const badge = PROVIDER_BADGE[tx.provider] || {
                              bg: "bg-muted",
                              text: "text-muted-foreground",
                              dot: "#94a3b8",
                            };
                            const stInfo = TX_STATUS_MAP[tx.status] || TX_STATUS_MAP.en_attente;
                            const StIcon = stInfo.icon;
                            return (
                              <motion.tr
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                                className="border-b last:border-b-0 hover:bg-muted/30"
                              >
                                <td className="px-3 py-3 font-mono text-xs">{tx.id.slice(0, 8)}</td>
                                <td className="px-3 py-3 font-medium">{tx.customer_name || "—"}</td>
                                <td className="px-3 py-3 hidden md:table-cell">
                                  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded", badge.bg, badge.text)}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
                                    {tx.provider}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-right font-semibold">{formatFCFA(tx.amount || 0)}</td>
                                <td className="px-3 py-3 hidden lg:table-cell font-mono text-xs text-muted-foreground">{tx.reference || "—"}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", stInfo.color)}>
                                    <StIcon className="h-3 w-3" /> {stInfo.label}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                                  {formatDate(tx.created_at)}
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabsContent>

          {/* =================================================== */}
          {/* TAB — COD (Cash on Delivery)                        */}
          {/* =================================================== */}
          <TabsContent value="cod" className="mt-0 space-y-4">
            {loadingCod ? (
              <Card className="p-0">
                <LoadingState label="Chargement des commandes COD…" />
              </Card>
            ) : codOrders.length === 0 ? (
              <Card className="p-0">
                <EmptyState
                  icon={PackageOpen}
                  title="Aucune commande COD"
                  description="Les commandes avec paiement à la livraison apparaîtront ici pour suivi du cash à collecter."
                />
              </Card>
            ) : (
              <>
                {/* COD stats row — computed from real data */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">À collecter</p>
                    </div>
                    <p className="text-xl font-display font-bold">{formatFCFA(codStats.totalToCollect)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{codStats.pendingOrders} commande(s) en attente</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-yaa-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">Collecté</p>
                    </div>
                    <p className="text-xl font-display font-bold text-yaa-green-600">{formatFCFA(codStats.totalCollected)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">En caisse livreur</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">Écarts</p>
                    </div>
                    <p className="text-xl font-display font-bold text-rose-600">{formatFCFA(codStats.totalDiscrepancy)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">À investiguer</p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center">
                        <Banknote className="w-4 h-4 text-sky-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">Réconcilié</p>
                    </div>
                    <p className="text-xl font-display font-bold text-sky-600">{formatFCFA(codStats.totalReconciled)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">En banque</p>
                  </Card>
                </div>

                {/* COD table */}
                <Card className="p-4 lg:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-base">Réconciliation COD</h3>
                      <p className="text-xs text-muted-foreground">Suivi des encaissements cash par les livreurs</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={bulkReconcile}
                      disabled={updatingCodId === "bulk"}
                    >
                      {updatingCodId === "bulk" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      Marquer réconcilié
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Commande</th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Ville</th>
                          <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Livreur</th>
                          <th className="text-right font-medium text-muted-foreground px-3 py-2.5">À collecter</th>
                          <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                          <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Écart</th>
                          <th className="px-3 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {codOrders.map((cod, idx) => {
                          const statusKey = (cod.cod_status || "a_collecter") as CodStatus;
                          const stInfo = COD_STATUS_INFO[statusKey];
                          const StIcon = stInfo.icon;
                          const isUpdating = updatingCodId === cod.id;
                          const discrepancy = cod.cod_discrepancy ?? 0;
                          const amountToCollect = cod.cod_amount ?? cod.amount ?? 0;
                          return (
                            <motion.tr
                              key={cod.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                              className="border-b last:border-b-0 hover:bg-muted/30"
                            >
                              <td className="px-3 py-3 font-mono text-xs">{cod.id.slice(0, 8)}</td>
                              <td className="px-3 py-3 font-medium">{cod.customer_name || "—"}</td>
                              <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{cod.customer_city || "—"}</td>
                              <td className="px-3 py-3 text-xs">{cod.cod_collected_by || "—"}</td>
                              <td className="px-3 py-3 text-right font-semibold">{formatFCFA(amountToCollect)}</td>
                              <td className="px-3 py-3 text-center">
                                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded", stInfo.bg, stInfo.color)}>
                                  <StIcon className="w-3 h-3" />
                                  {stInfo.label}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right hidden lg:table-cell">
                                {discrepancy > 0 ? (
                                  <span className="text-xs font-bold text-rose-600">-{formatFCFA(discrepancy)}</span>
                                ) : discrepancy === 0 && statusKey !== "a_collecter" ? (
                                  <span className="text-xs text-yaa-green-600">✓ 0</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-3 py-3 text-right">
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin inline-block" />
                                ) : statusKey === "a_collecter" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] gap-1"
                                    onClick={() => updateCodStatus(cod.id, "collecte")}
                                  >
                                    <ArrowRight className="w-3 h-3" /> Marquer collecté
                                  </Button>
                                ) : statusKey === "collecte" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] gap-1 border-yaa-green-300 text-yaa-green-600 hover:bg-yaa-green-50"
                                    onClick={() => updateCodStatus(cod.id, "reconcilie")}
                                  >
                                    <Banknote className="w-3 h-3" /> Réconcilier
                                  </Button>
                                ) : statusKey === "non_collecte" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] gap-1 border-amber-300 text-amber-600 hover:bg-amber-50"
                                    onClick={() => updateCodStatus(cod.id, "collecte")}
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Marquer collecté
                                  </Button>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">Clôturé</span>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/20 border border-yaa-green-200 flex items-start gap-2">
                    <Banknote className="w-4 h-4 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-yaa-green-700">Workflow COD :</span>{" "}
                      commande → livreur collecte le cash → marquer « Collecté » → verser en caisse → « Réconcilié » quand l'argent est en banque.
                      En Afrique, le COD représente 60-80% des paiements e-commerce — surveillez les écarts quotidiennement.
                    </p>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
