"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, LogOut, User as UserIcon, Settings, CreditCard, Loader2, ShoppingCart, Mail, AlertTriangle, Users, CreditCard as CardIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "order" | "payment" | "warning" | "customer" | "return" | "message";
  href?: string;
};

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
  } catch {
    return "—";
  }
}

export function AdminTopbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(true);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = profile?.full_name || profile?.boutique_name || user?.email?.split("@")[0] || "Marchand";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Load real notifications from Supabase
  const loadNotifications = React.useCallback(async () => {
    if (!user) {
      setLoadingNotifs(false);
      return;
    }
    try {
      const notifs: Notification[] = [];

      // 1. Recent orders (last 5, mark new ones as unread)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      (orders || []).forEach((o: any) => {
        const isRecent = Date.now() - new Date(o.created_at).getTime() < 24 * 60 * 60 * 1000;
        notifs.push({
          id: `order-${o.id}`,
          title: `Commande ${o.status === "nouveau" ? "reçue" : "mise à jour"}`,
          desc: `${o.customer_name} · ${formatFCFA(o.amount)}`,
          time: timeAgo(o.created_at),
          unread: isRecent && o.status === "nouveau",
          type: "order",
          href: "/admin/commandes",
        });
      });

      // 2. Low stock products
      const { data: lowStock } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("user_id", user.id)
        .eq("status", "actif")
        .lte("stock", 10)
        .gte("stock", 0)
        .limit(3);

      (lowStock || []).forEach((p: any) => {
        notifs.push({
          id: `stock-${p.id}`,
          title: "Stock faible",
          desc: `${p.name} — ${p.stock} unité(s) restante(s)`,
          time: "Récemment",
          unread: p.stock <= 5,
          type: "warning",
          href: "/admin/produits",
        });
      });

      // 3. Unread contact messages
      const { data: messages } = await supabase
        .from("contact_messages")
        .select("id, name, subject, created_at, is_read")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(3);

      (messages || []).forEach((m: any) => {
        notifs.push({
          id: `msg-${m.id}`,
          title: "Nouveau message",
          desc: `${m.name}${m.subject ? " · " + m.subject : ""}`,
          time: timeAgo(m.created_at),
          unread: true,
          type: "message",
          href: "/admin/messages",
        });
      });

      // 4. Pending returns
      const { data: returns } = await supabase
        .from("returns")
        .select("id, customer_name, reason, created_at, status")
        .eq("user_id", user.id)
        .in("status", ["requested", "under_review"])
        .order("created_at", { ascending: false })
        .limit(3);

      (returns || []).forEach((r: any) => {
        notifs.push({
          id: `return-${r.id}`,
          title: "Demande de retour",
          desc: `${r.customer_name} · ${r.reason}`,
          time: timeAgo(r.created_at),
          unread: true,
          type: "return",
          href: "/admin/retours",
        });
      });

      // Sort by recency (orders + returns by created_at, others last)
      notifs.sort((a, b) => {
        const aTime = a.time === "Récemment" ? 0 : 1;
        const bTime = b.time === "Récemment" ? 0 : 1;
        return aTime - bTime;
      });

      setNotifications(notifs);
    } catch (err) {
      console.warn("[Topbar] Notifications error:", err);
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadNotifications();
    // Refresh every 60s
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return ShoppingCart;
      case "payment": return CardIcon;
      case "warning": return AlertTriangle;
      case "customer": return Users;
      case "return": return RotateCcw;
      case "message": return Mail;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "order": return "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400";
      case "payment": return "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400";
      case "warning": return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";
      case "customer": return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400";
      case "return": return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400";
      case "message": return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 md:px-6 bg-background/80 backdrop-blur-lg border-b border-border">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border" />
      </div>

      <div className="flex-1" />

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yaa-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="p-3 border-b">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""} sur {notifications.length}
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loadingNotifs ? (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Aucune notification pour le moment</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Les nouvelles commandes, messages et alertes stock apparaîtront ici.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = getIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => n.href && router.push(n.href)}
                    className={cn(
                      "flex items-start gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 cursor-pointer",
                      n.unread && "bg-yaa-green-50/50 dark:bg-yaa-green-950/20"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", getIconColor(n.type))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{n.desc}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-yaa-orange-500 mt-1 flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="justify-center text-sm font-medium text-yaa-green-600"
            onClick={() => router.push("/admin/commandes")}
          >
            Voir toutes les notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 px-1.5 gap-2 hover:bg-muted" aria-label="User menu">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-yaa-orange-500 text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            {profile?.plan && (
              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 capitalize">
                Plan {profile.plan}
              </span>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
            <UserIcon className="h-4 w-4 mr-2" /> Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
            <Settings className="h-4 w-4 mr-2" /> Paramètres
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/super-admin")}>
            <CreditCard className="h-4 w-4 mr-2" /> Facturation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
            {signingOut ? "Déconnexion..." : "Déconnexion"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
