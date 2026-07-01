"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Loader2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Package,
  Eye,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type ReturnItem = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  reason: string;
  reason_details: string | null;
  requested_refund_amount: number;
  approved_refund_amount: number | null;
  refund_method: string | null;
  refund_reference: string | null;
  status: "requested" | "under_review" | "approved" | "rejected" | "refunded" | "received_back";
  items_count: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  orders?: {
    id: string;
    amount: number;
    customer_name: string;
    items: any;
    payment_method: string | null;
  } | null;
};

const REASON_LABELS: Record<string, string> = {
  defect: "Produit défectueux",
  wrong_item: "Mauvais article reçu",
  not_as_described: "Non conforme à la description",
  damaged_shipping: "Endommagé pendant le transport",
  changed_mind: "Changement d'avis",
  late_delivery: "Livraison tardive",
  other: "Autre raison",
};

const REASON_ICONS: Record<string, string> = {
  defect: "🔧",
  wrong_item: "📦",
  not_as_described: "❌",
  damaged_shipping: "💥",
  changed_mind: "🔄",
  late_delivery: "⏰",
  other: "❓",
};

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  requested: { label: "Demandé", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/50", icon: Clock },
  under_review: { label: "En cours d'examen", color: "text-sky-700 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-950/50", icon: Eye },
  approved: { label: "Approuvé", color: "text-yaa-green-700 dark:text-yaa-green-400", bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", icon: CheckCircle2 },
  rejected: { label: "Refusé", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950/50", icon: XCircle },
  refunded: { label: "Remboursé", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-950/50", icon: DollarSign },
  received_back: { label: "Produit reçu en retour", color: "text-indigo-700 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-950/50", icon: Package },
};

const REFUND_METHODS = [
  { value: "original", label: "Méthode originale (Mobile Money/Carte)" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "moov", label: "Moov Money" },
  { value: "cash", label: "Espèces (en boutique)" },
  { value: "store_credit", label: "Avoir boutique (crédit)" },
];

export default function RetoursPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [returns, setReturns] = React.useState<ReturnItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [detailModal, setDetailModal] = React.useState<ReturnItem | null>(null);
  const [processing, setProcessing] = React.useState(false);

  // Form state for processing return
  const [processForm, setProcessForm] = React.useState({
    status: "" as ReturnItem["status"],
    approvedRefundAmount: 0,
    refundMethod: "original",
    refundReference: "",
    adminNotes: "",
  });

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadReturns() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/returns");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReturns(data.returns || []);
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Chargement impossible",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Stats from real data
  const stats = React.useMemo(() => {
    const total = returns.length;
    const pending = returns.filter((r) => r.status === "requested" || r.status === "under_review").length;
    const approved = returns.filter((r) => r.status === "approved" || r.status === "refunded").length;
    const totalRefunded = returns
      .filter((r) => r.status === "refunded")
      .reduce((sum, r) => sum + (r.approved_refund_amount || r.requested_refund_amount || 0), 0);
    return [
      { label: "Total retours", value: total, color: "blue" as const, icon: "RotateCcw" },
      { label: "En attente", value: pending, color: "orange" as const, icon: "Clock" },
      { label: "Approuvés", value: approved, color: "green" as const, icon: "CheckCircle2" },
      { label: "Remboursé", value: totalRefunded, format: "fcfa" as const, color: "purple" as const, icon: "DollarSign" },
    ];
  }, [returns]);

  const filteredReturns = React.useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        !search ||
        r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        r.order_id.toLowerCase().includes(search.toLowerCase()) ||
        (r.customer_phone || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [returns, search, statusFilter]);

  const openProcessModal = (r: ReturnItem) => {
    setDetailModal(r);
    setProcessForm({
      status: r.status,
      approvedRefundAmount: r.approved_refund_amount || r.requested_refund_amount || 0,
      refundMethod: r.refund_method || "original",
      refundReference: r.refund_reference || "",
      adminNotes: r.admin_notes || "",
    });
  };

  const handleProcess = async () => {
    if (!detailModal) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: detailModal.id,
          status: processForm.status,
          approvedRefundAmount: processForm.approvedRefundAmount,
          refundMethod: processForm.refundMethod,
          refundReference: processForm.refundReference,
          adminNotes: processForm.adminNotes,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update local state
      setReturns(returns.map((r) => (r.id === detailModal.id ? { ...r, ...data.return } : r)));
      setDetailModal(null);
      toast({
        title: "Retour mis à jour ✓",
        description: `Statut: ${STATUS_INFO[processForm.status]?.label}`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Mise à jour impossible",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    } catch {
      return "—";
    }
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
        title="Retours & Remboursements"
        subtitle={`${returns.length} demandes · ${returns.filter((r) => r.status === "requested" || r.status === "under_review").length} en attente`}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={loadReturns}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
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

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, téléphone, n° commande..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="requested">Demandé</SelectItem>
            <SelectItem value="under_review">En cours d'examen</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="refunded">Remboursé</SelectItem>
            <SelectItem value="received_back">Produit reçu</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Returns list */}
      <motion.div variants={item}>
        {filteredReturns.length === 0 ? (
          <Card className="p-12 text-center">
            <RotateCcw className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold">
              {returns.length === 0 ? "Aucune demande de retour" : "Aucun retour ne correspond à vos filtres"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {returns.length === 0
                ? "Les demandes de retour de vos clients apparaîtront ici."
                : "Essayez de modifier vos critères de recherche."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredReturns.map((r, idx) => {
              const statusInfo = STATUS_INFO[r.status];
              const StIcon = statusInfo.icon;
              const orderAmount = r.orders?.amount || 0;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-4 lg:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Left — customer + reason */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{REASON_ICONS[r.reason]}</span>
                            <div>
                              <p className="font-semibold text-sm">{r.customer_name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {r.customer_phone || "—"} · {r.customer_email || "—"}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn("gap-1", statusInfo.bg, statusInfo.color)}>
                            <StIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Commande</p>
                            <p className="font-mono font-bold">#{r.order_id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Date demande</p>
                            <p className="font-bold">{formatDate(r.created_at)}</p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                            {REASON_LABELS[r.reason]}
                          </p>
                          <p className="text-xs text-foreground line-clamp-2">
                            {r.reason_details || "Aucun détail fourni"}
                          </p>
                        </div>
                      </div>

                      {/* Right — amounts + actions */}
                      <div className="lg:w-64 flex-shrink-0 lg:border-l lg:pl-4">
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Montant commande</span>
                            <span className="font-bold">{formatFCFA(orderAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Remboursement demandé</span>
                            <span className="font-bold text-amber-600">{formatFCFA(r.requested_refund_amount)}</span>
                          </div>
                          {r.approved_refund_amount !== null && r.approved_refund_amount !== r.requested_refund_amount && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Approuvé</span>
                              <span className="font-bold text-yaa-green-600">{formatFCFA(r.approved_refund_amount)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Articles concernés</span>
                            <span className="font-bold">{r.items_count}</span>
                          </div>
                          {r.refund_method && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Méthode</span>
                              <span className="font-bold capitalize">{r.refund_method.replace("_", " ")}</span>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-1.5"
                          onClick={() => openProcessModal(r)}
                        >
                          <Eye className="w-3.5 h-3.5" /> Examiner
                        </Button>
                      </div>
                    </div>

                    {r.admin_notes && (
                      <div className="mt-3 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 text-xs">
                        <p className="font-semibold text-sky-700 mb-0.5">Note admin :</p>
                        <p className="text-muted-foreground">{r.admin_notes}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Process modal */}
      <Dialog open={!!detailModal} onOpenChange={(o) => !o && setDetailModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-yaa-orange-500" /> Examiner le retour
            </DialogTitle>
            <DialogDescription>
              Demande de {detailModal?.customer_name} · Commande #{detailModal?.order_id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {detailModal && (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-[10px] text-muted-foreground">Client</p>
                  <p className="text-sm font-semibold">{detailModal.customer_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-semibold">{detailModal.customer_phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Raison</p>
                  <p className="text-sm font-semibold">{REASON_ICONS[detailModal.reason]} {REASON_LABELS[detailModal.reason]}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Articles</p>
                  <p className="text-sm font-semibold">{detailModal.items_count} article(s)</p>
                </div>
              </div>

              {/* Reason details */}
              {detailModal.reason_details && (
                <div>
                  <Label className="text-xs font-semibold">Détails du client</Label>
                  <div className="mt-1 p-3 rounded-lg border border-slate-200 text-sm">
                    {detailModal.reason_details}
                  </div>
                </div>
              )}

              {/* Process form */}
              <div className="space-y-3 border-t pt-3">
                <div>
                  <Label className="text-xs font-semibold">Statut</Label>
                  <Select
                    value={processForm.status}
                    onValueChange={(v) => setProcessForm({ ...processForm, status: v as ReturnItem["status"] })}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requested">Demandé</SelectItem>
                      <SelectItem value="under_review">En cours d'examen</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="received_back">Produit reçu en retour</SelectItem>
                      <SelectItem value="refunded">Remboursé ✓</SelectItem>
                      <SelectItem value="rejected">Refusé ✗</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Montant à rembourser (FCFA)</Label>
                    <Input
                      type="number"
                      min="0"
                      className="mt-1"
                      value={processForm.approvedRefundAmount}
                      onChange={(e) => setProcessForm({ ...processForm, approvedRefundAmount: Number(e.target.value) })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Demandé: {formatFCFA(detailModal.requested_refund_amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Méthode de remboursement</Label>
                    <Select
                      value={processForm.refundMethod}
                      onValueChange={(v) => setProcessForm({ ...processForm, refundMethod: v })}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REFUND_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Référence de remboursement (optionnel)</Label>
                  <Input
                    placeholder="Ex: TXN-12345, WAV-67890..."
                    className="mt-1"
                    value={processForm.refundReference}
                    onChange={(e) => setProcessForm({ ...processForm, refundReference: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Note interne (optionnel)</Label>
                  <Textarea
                    placeholder="Note pour vous-même ou votre équipe..."
                    rows={2}
                    className="mt-1"
                    value={processForm.adminNotes}
                    onChange={(e) => setProcessForm({ ...processForm, adminNotes: e.target.value })}
                  />
                </div>

                {processForm.status === "refunded" && (
                  <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-yaa-green-600" />
                    Un SMS sera automatiquement envoyé au client pour l&apos;informer du remboursement.
                  </div>
                )}
                {processForm.status === "rejected" && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-rose-600" />
                    Le client sera informé que sa demande a été refusée.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailModal(null)}>Fermer</Button>
            <Button
              onClick={handleProcess}
              disabled={processing}
              className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
            >
              {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
