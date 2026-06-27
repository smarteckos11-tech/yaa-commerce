"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, LogOut, User as UserIcon, Settings, CreditCard, Loader2 } from "lucide-react";
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
import { DynamicIcon } from "./dynamic-icon";
import { useAuth } from "@/hooks/use-auth";
import { NOTIFICATIONS } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export function AdminTopbar({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = profile?.full_name || profile?.boutique_name || user?.email?.split("@")[0] || "Marchand";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

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
            <p className="text-xs text-muted-foreground">{unreadCount} non lues sur {NOTIFICATIONS.length}</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className={cn("flex items-start gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 cursor-pointer", n.unread && "bg-yaa-green-50/50 dark:bg-yaa-green-950/20")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  n.type === "order" && "bg-yaa-green-100 text-yaa-green-700",
                  n.type === "payment" && "bg-yaa-orange-100 text-yaa-orange-700",
                  n.type === "warning" && "bg-amber-100 text-amber-700",
                  n.type === "customer" && "bg-sky-100 text-sky-700",
                  n.type === "marketing" && "bg-purple-100 text-purple-700"
                )}>
                  <DynamicIcon name={n.type === "order" ? "ShoppingCart" : n.type === "payment" ? "CreditCard" : n.type === "warning" ? "AlertTriangle" : n.type === "customer" ? "Users" : "Megaphone"} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{n.desc}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{n.time}</p>
                </div>
                {n.unread && <span className="w-2 h-2 rounded-full bg-yaa-orange-500 mt-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-sm font-medium text-yaa-green-600">Voir toutes les notifications</DropdownMenuItem>
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
              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 capitalize">Plan {profile.plan}</span>
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
