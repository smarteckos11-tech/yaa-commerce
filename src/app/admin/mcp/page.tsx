"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Settings,
  Clock,
  Loader2,
  Plug,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// ---------- Animation ----------
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ---------- Inline MCP catalog (12 connectors — NO mock import) ----------
type McpConnector = {
  name: string;
  category: string;
  color: string;
  description: string;
  type: string;
  initials: string;
};

const MCP_CATALOG: McpConnector[] = [
  {
    name: "Wave",
    category: "Mobile Money",
    color: "#1DC7EA",
    description:
      "Encaissements Wave automatiques, QR code pay et notifications temps réel via webhooks.",
    type: "Paiement",
    initials: "W",
  },
  {
    name: "Orange Money",
    category: "Mobile Money",
    color: "#FF6600",
    description:
      "Paiements Orange Money Côte d'Ivoire / Mali / Sénégal — QR marchand et callbacks sécurisés.",
    type: "Paiement",
    initials: "OM",
  },
  {
    name: "MTN MoMo",
    category: "Mobile Money",
    color: "#FFCC00",
    description:
      "Mobile Money MTN — transferts, encaissements et reversions via l'API MoMo Open API.",
    type: "Paiement",
    initials: "MTN",
  },
  {
    name: "Moov",
    category: "Mobile Money",
    color: "#00A0E3",
    description:
      "Moov Money — paiements marchands et notifications de transaction automatiques.",
    type: "Paiement",
    initials: "MV",
  },
  {
    name: "Stripe",
    category: "Carte bancaire",
    color: "#635BFF",
    description:
      "Cartes Visa / Mastercard / Amex — paiements internationaux, abonnements et refunds.",
    type: "Paiement",
    initials: "S",
  },
  {
    name: "Yango Delivery",
    category: "Logistique",
    color: "#FF6900",
    description:
      "Livraison dernier kilomètre Yango — tarifs dynamiques et suivi GPS temps réel.",
    type: "Livraison",
    initials: "Y",
  },
  {
    name: "DHL Express",
    category: "Logistique",
    color: "#D40511",
    description:
      "Expéditions internationales DHL — étiquettes auto, suivi multi-pays et retours.",
    type: "Livraison",
    initials: "DHL",
  },
  {
    name: "WhatsApp Business",
    category: "Communication",
    color: "#25D366",
    description:
      "Messagerie clients, notifications de commande et support automatique via WhatsApp Cloud API.",
    type: "Communication",
    initials: "WA",
  },
  {
    name: "Twilio SMS",
    category: "Communication",
    color: "#F22F46",
    description:
      "SMS transactionnels, OTP et rappels de livraison vers 180+ pays via Twilio.",
    type: "Communication",
    initials: "T",
  },
  {
    name: "Cloudinary",
    category: "Média",
    color: "#3448C5",
    description:
      "Hébergement, optimisation et transformation d'images produits via CDN global.",
    type: "Média",
    initials: "C",
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    color: "#E37400",
    description:
      "Suivi e-commerce GA4 — conversions, entonnoirs d'achat et audiences personnalisées.",
    type: "Analytics",
    initials: "GA",
  },
  {
    name: "Facebook Pixel",
    category: "Marketing",
    color: "#1877F2",
    description:
      "Tracking publicitaire Meta — retargeting, conversions et audiences personnalisées.",
    type: "Marketing",
    initials: "FB",
  },
];

// ---------- Payment provider row type (Supabase) ----------
type PaymentProvider = {
  id: string;
  user_id: string;
  provider_name: string;
  is_connected: boolean;
  balance: number;
  transactions_count: number;
  created_at: string;
};

// ---------- Helpers ----------
function formatSyncDate(s: string | null): string {
  if (!s) return "Jamais";
  try {
    const d = new Date(s);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Il y a ${diffD} j`;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatCount(n: number): string {
  return (n || 0).toLocaleString("fr-FR");
}

// ============================ PAGE ============================
export default function McpPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data
  const [providers, setProviders] = React.useState<PaymentProvider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [toggling, setToggling] = React.useState<string | null>(null);

  // ---------- Load payment_providers from Supabase ----------
  const loadProviders = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setProviders((data || []) as PaymentProvider[]);
    } catch (err) {
      console.error("[MCP] load providers:", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les connecteurs MCP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    if (user) loadProviders();
  }, [user, loadProviders]);

  // ---------- Reload all (Tout synchroniser) ----------
  const reloadAll = async () => {
    if (!user) return;
    setSyncing(true);
    await loadProviders();
    setSyncing(false);
    toast({
      title: "Synchronisé ✓",
      description: "Connecteurs MCP actualisés depuis Supabase",
    });
  };

  // ---------- Lookup helpers ----------
  const getProvider = (name: string) =>
    providers.find((p) => p.provider_name === name);

  // ---------- Toggle provider connection (Connecter button) ----------
  const toggleProvider = async (name: string) => {
    if (!user) return;
    setToggling(name);
    const existing = getProvider(name);
    const newConnected = existing ? !existing.is_connected : true;
    try {
      if (existing) {
        // Row already exists → toggle is_connected
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
        // No row yet → insert new with is_connected=true
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
          ? "Le connecteur est désormais actif"
          : "Le connecteur a été désactivé",
      });
    } catch (err) {
      console.error("[MCP] toggle provider:", err);
      toast({
        title: "Erreur",
        description: "Action impossible sur ce connecteur",
        variant: "destructive",
      });
    } finally {
      setToggling(null);
    }
  };

  // ---------- Configure (Configurer button → toast) ----------
  const configure = (name: string) => {
    toast({
      title: `Configuration — ${name}`,
      description:
        "Les paramètres avancés du connecteur seront bientôt disponibles.",
    });
  };

  // ---------- Stats computed from real data ----------
  const stats = React.useMemo(() => {
    const connected = providers.filter((p) => p.is_connected).length;
    const totalTx = providers.reduce(
      (s, p) => s + (p.transactions_count || 0),
      0
    );
    const totalBalance = providers
      .filter((p) => p.is_connected)
      .reduce((s, p) => s + (p.balance || 0), 0);
    return {
      connected,
      available: MCP_CATALOG.length,
      totalTx,
      totalBalance,
    };
  }, [providers]);

  // ============================ RENDER ============================
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="MCP Connecteurs"
        subtitle="Synchronisez vos outils externes avec YAA"
        actions={
          <Button
            size="sm"
            className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"
            onClick={reloadAll}
            disabled={syncing || loading}
          >
            <RefreshCw
              className={cn("h-4 w-4", (syncing || loading) && "animate-spin")}
            />
            Tout synchroniser
          </Button>
        }
      />

      {/* ---------- Loading spinner ---------- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-yaa-green-500 mb-3" />
          <p className="text-sm text-muted-foreground">
            Chargement des connecteurs MCP…
          </p>
        </div>
      ) : (
        <>
          {/* ---------- Stats (real data) ---------- */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6"
          >
            <StatCard
              label="Connectés"
              value={stats.connected}
              suffix={`/${stats.available}`}
              color="green"
              icon="Plug"
              format="number"
            />
            <StatCard
              label="Disponibles"
              value={stats.available}
              color="orange"
              icon="Zap"
              format="number"
            />
            <StatCard
              label="Transactions"
              value={stats.totalTx}
              color="blue"
              icon="Activity"
              format="number"
            />
            <StatCard
              label="Solde global"
              value={stats.totalBalance}
              color="purple"
              icon="Wallet"
              format="fcfa"
            />
          </motion.div>

          {/* ---------- Connectors grid ---------- */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          >
            {MCP_CATALOG.map((c, idx) => {
              const provider = getProvider(c.name);
              const isConnected = !!provider?.is_connected;
              return (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                    {/* Icon + status badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                        style={{ background: c.color }}
                      >
                        {c.initials}
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded",
                          isConnected
                            ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isConnected
                              ? "bg-yaa-green-500"
                              : "bg-muted-foreground/40"
                          )}
                        />
                        {isConnected ? "Connecté" : "Déconnecté"}
                      </span>
                    </div>

                    {/* Name + category */}
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      {c.category} · {c.type}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {c.description}
                    </p>

                    {/* Balance + transactions_count (connected only) */}
                    {isConnected && provider && (
                      <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                        <div className="rounded-md bg-muted/60 p-2">
                          <p className="text-muted-foreground">Solde</p>
                          <p className="font-semibold text-xs">
                            {formatFCFA(provider.balance || 0)}
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/60 p-2">
                          <p className="text-muted-foreground">Transactions</p>
                          <p className="font-semibold text-xs">
                            {formatCount(provider.transactions_count)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Last sync date */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {isConnected
                        ? `Sync : ${formatSyncDate(
                            provider?.created_at || null
                          )}`
                        : "Jamais synchronisé"}
                    </div>

                    {/* Actions */}
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => configure(c.name)}
                        >
                          <Settings className="h-3.5 w-3.5" /> Configurer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-1.5 mt-1.5 text-muted-foreground hover:text-rose-600"
                          onClick={() => toggleProvider(c.name)}
                          disabled={toggling === c.name}
                        >
                          {toggling === c.name ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plug className="h-3.5 w-3.5" />
                          )}
                          Déconnecter
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"
                        onClick={() => toggleProvider(c.name)}
                        disabled={toggling === c.name}
                      >
                        {toggling === c.name ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plug className="h-3.5 w-3.5" />
                        )}
                        Connecter
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ---------- MCP info card ---------- */}
          <motion.div variants={item} className="mt-6">
            <Card className="p-5 border-yaa-green-200/60 bg-yaa-green-50/40 dark:bg-yaa-green-950/10 dark:border-yaa-green-900/40">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yaa-green-100 dark:bg-yaa-green-900/40 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-yaa-green-600 dark:text-yaa-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">
                      Qu&apos;est-ce que le protocole MCP ?
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-900/40 dark:text-yaa-green-400">
                      <CheckCircle2 className="h-3 w-3" /> Standard ouvert
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Le{" "}
                    <strong className="text-foreground">
                      Model Context Protocol (MCP)
                    </strong>{" "}
                    est un standard ouvert qui permet à YAA de se connecter à
                    vos outils externes — Mobile Money, logistique,
                    communication, analytics et marketing — via une API
                    unifiée. Chaque connecteur expose des capacités (paiements,
                    livraisons, notifications, suivi) que vous activez et
                    configurez en un clic. Les données restent synchronisées en
                    temps réel et sécurisées par{" "}
                    <strong className="text-foreground">
                      Row Level Security (RLS)
                    </strong>{" "}
                    au niveau de votre compte : seules vos lignes{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-[10px]">
                      payment_providers
                    </code>{" "}
                    sont accessibles.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
