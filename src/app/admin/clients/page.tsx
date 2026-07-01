"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Crown,
  Trash2,
  Loader2,
  Users,
  Wallet,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatCard, PageHeader, getLoyaltyColor } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ---------- Types ----------
type CustomerSegment = "vip" | "regulier" | "actif" | "nouveau";

type Customer = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  country: string | null;
  total_spent: number;
  orders_count: number;
  loyalty: number;
  segment: CustomerSegment;
  last_order_at: string | null;
  created_at: string;
};

// ---------- Constants ----------
const SEGMENT_LABELS: Record<CustomerSegment | "all", string> = {
  all: "Tous",
  vip: "VIP",
  regulier: "Régulier",
  actif: "Actif",
  nouveau: "Nouveau",
};

const SEGMENT_COLORS: Record<CustomerSegment, { bg: string; text: string }> = {
  vip: { bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300" },
  regulier: { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300" },
  actif: { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300" },
  nouveau: { bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-300" },
};

const SEGMENT_OPTIONS: { value: CustomerSegment; label: string }[] = [
  { value: "vip", label: "VIP" },
  { value: "regulier", label: "Régulier" },
  { value: "actif", label: "Actif" },
  { value: "nouveau", label: "Nouveau" },
];

const DEFAULT_COUNTRIES = [
  "Côte d'Ivoire",
  "Sénégal",
  "Ghana",
  "Mali",
  "Nigeria",
  "Bénin",
  "Burkina Faso",
  "Togo",
  "Guinée",
  "Cameroun",
];

// ---------- Helpers ----------
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffD = Math.floor(diffMs / 86400000);
    if (diffD < 1) return "Aujourd'hui";
    if (diffD === 1) return "Hier";
    if (diffD < 7) return `Il y a ${diffD}j`;
    if (diffD < 30) return `Il y a ${Math.floor(diffD / 7)} sem.`;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  // Remove spaces, dashes, parentheses; keep leading +
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!cleaned) return null;
  // If it starts with 00, replace with +
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  // If it doesn't start with + and length is 8-15 digits, assume local and prepend +225 (CI default)
  if (!cleaned.startsWith("+") && /^\d{8,15}$/.test(cleaned)) return "+225" + cleaned;
  return cleaned;
}

// ---------- Component ----------
export default function ClientsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [segmentFilter, setSegmentFilter] = React.useState<CustomerSegment | "all">("all");
  const [countryFilter, setCountryFilter] = React.useState<string>("all");

  // Add customer dialog
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    country: "Côte d'Ivoire",
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<Customer | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // ---------- Load customers ----------
  const loadCustomers = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers((data || []) as Customer[]);
    } catch (err) {
      console.error("[Clients] Erreur de chargement:", err);
      toast({
        title: "Erreur de chargement",
        description: err instanceof Error ? err.message : "Impossible de charger les clients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ---------- Computed stats ----------
  const stats = React.useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const vipCount = customers.filter((c) => c.segment === "vip").length;
    const newCount = customers.filter((c) => c.segment === "nouveau").length;
    return { total, totalSpent, vipCount, newCount };
  }, [customers]);

  // Dynamic list of countries from data
  const countries = React.useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort();
  }, [customers]);

  // ---------- Filtered customers ----------
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      // Segment filter
      if (segmentFilter !== "all" && c.segment !== segmentFilter) return false;
      // Country filter
      if (countryFilter !== "all" && c.country !== countryFilter) return false;
      // Search filter
      if (q) {
        const haystack = [c.name, c.email, c.phone, c.whatsapp]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [customers, search, segmentFilter, countryFilter]);

  // ---------- Create customer ----------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        city: form.city.trim() || null,
        country: form.country || null,
        total_spent: 0,
        orders_count: 0,
        loyalty: 0,
        segment: "nouveau" as CustomerSegment,
      };

      const { data, error } = await supabase
        .from("customers")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setCustomers((prev) => [data as Customer, ...prev]);
      setShowAddModal(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        city: "",
        country: "Côte d'Ivoire",
      });
      toast({
        title: "Client ajouté ! 🎉",
        description: `${(data as Customer).name} a été ajouté à votre base clients.`,
      });
    } catch (err) {
      console.error("[Clients] Erreur à la création:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'ajouter le client.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // ---------- Delete customer ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({
        title: "Client supprimé",
        description: `${deleteTarget.name} a été supprimé de votre base.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("[Clients] Erreur à la suppression:", err);
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de supprimer le client.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Actions per row ----------
  const openWhatsApp = (c: Customer) => {
    const phone = normalizePhone(c.whatsapp || c.phone);
    if (!phone) {
      toast({ title: "Aucun numéro WhatsApp disponible", variant: "destructive" });
      return;
    }
    const num = phone.replace(/[^\d]/g, "");
    window.open(`https://wa.me/${num}`, "_blank", "noopener,noreferrer");
  };

  const openEmail = (c: Customer) => {
    if (!c.email) {
      toast({ title: "Aucun email disponible", variant: "destructive" });
      return;
    }
    window.location.href = `mailto:${c.email}`;
  };

  // ---------- Render: Loading ----------
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
        title="Clients"
        subtitle="Votre base de clients et leur fidélité"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={loadCustomers}>
              <Loader2 className="h-4 w-4" /> Actualiser
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" /> Ajouter client
            </Button>
          </>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <StatCard
          label="Total Clients"
          value={stats.total}
          color="green"
          icon="Users"
        />
        <StatCard
          label="Total Dépensé"
          value={stats.totalSpent}
          format="fcfa"
          color="orange"
          icon="Wallet"
        />
        <StatCard
          label="Clients VIP"
          value={stats.vipCount}
          color="amber"
          icon="Crown"
        />
        <StatCard
          label="Nouveaux Clients"
          value={stats.newCount}
          color="purple"
          icon="UserPlus"
        />
      </motion.div>

      {/* Main card with table / empty state */}
      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={segmentFilter}
              onValueChange={(v) => setSegmentFilter(v as CustomerSegment | "all")}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les segments</SelectItem>
                {SEGMENT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={countryFilter}
              onValueChange={setCountryFilter}
            >
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empty state */}
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">Aucun client pour le moment</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Ajoutez votre premier client manuellement, ou il sera automatiquement créé
                lorsqu'une commande sera passée sur votre boutique.
              </p>
              <Button
                className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" /> Ajouter un client
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            // Search returned no results
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">Aucun résultat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aucun client ne correspond à votre recherche ou vos filtres.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSegmentFilter("all");
                  setCountryFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Ville / Pays</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Contact</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Dépenses</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Commandes</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell min-w-[120px]">Fidélité</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Segment</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => {
                    const colors = SEGMENT_COLORS[c.segment] || SEGMENT_COLORS.nouveau;
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-xs font-bold">
                                {getInitials(c.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Dernière: {formatRelative(c.last_order_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">
                          {c.city ? c.city : "—"}
                          {c.country ? `, ${c.country}` : ""}
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <p className="text-xs text-muted-foreground truncate">
                            {c.email || "—"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.whatsapp || c.phone || "—"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">
                          {formatFCFA(c.total_spent || 0)}
                        </td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell text-muted-foreground">
                          {c.orders_count || 0}
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
                              <div
                                className={cn("h-full rounded-full", getLoyaltyColor(c.loyalty || 0))}
                                style={{ width: `${c.loyalty || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground w-6">
                              {c.loyalty || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded",
                              colors.bg,
                              colors.text
                            )}
                          >
                            {c.segment === "vip" && <Crown className="h-3 w-3" />}
                            {SEGMENT_LABELS[c.segment]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" /> Voir profil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openWhatsApp(c)}>
                                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEmail(c)}>
                                <Mail className="h-4 w-4 mr-2" /> Envoyer email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => setDeleteTarget(c)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {customers.length > 0 && (
            <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>
                {filtered.length} client{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
                {filtered.length !== customers.length && ` sur ${customers.length}`}
              </span>
              <span className="hidden sm:inline">
                Ajouté le {customers.length > 0 ? formatDate(customers[customers.length - 1].created_at) : "—"}
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Customer Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un client</DialogTitle>
            <DialogDescription>
              Renseignez les informations de votre nouveau client. Vous pourrez les modifier ultérieurement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="c-name" className="text-xs font-semibold">
                Nom complet *
              </Label>
              <Input
                id="c-name"
                placeholder="Ex: Aïcha Koffi"
                required
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="c-email" className="text-xs font-semibold">
                Email
              </Label>
              <Input
                id="c-email"
                type="email"
                placeholder="client@exemple.com"
                className="mt-1"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-phone" className="text-xs font-semibold">
                  Téléphone
                </Label>
                <Input
                  id="c-phone"
                  placeholder="+225 07 00 00 00"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="c-wa" className="text-xs font-semibold">
                  WhatsApp
                </Label>
                <Input
                  id="c-wa"
                  placeholder="+225 07 00 00 00"
                  className="mt-1"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="c-city" className="text-xs font-semibold">
                  Ville
                </Label>
                <Input
                  id="c-city"
                  placeholder="Abidjan"
                  className="mt-1"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="c-country" className="text-xs font-semibold">
                  Pays
                </Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
                >
                  <SelectTrigger id="c-country" className="mt-1">
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground flex items-start gap-2">
              <UserCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Le client sera créé avec le segment <strong>Nouveau</strong> et une fidélité de 0%.
                Ces données se mettront à jour automatiquement avec les commandes.
              </span>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Ajouter le client</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer{" "}
              <strong>{deleteTarget?.name}</strong> de votre base clients.
              Cette action est irréversible. Les commandes associées ne seront pas supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Suppression...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-1" /> Supprimer</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
