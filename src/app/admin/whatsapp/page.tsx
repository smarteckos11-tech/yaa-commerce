"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  Search,
  Plus,
  Bot,
  Crown,
  MessageCircle,
  Loader2,
  ExternalLink,
  Store,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AUTO_REPLIES = [
  { trigger: "bonjour", match: "contient", reply: "Bonjour 👋 Bienvenue chez YAA ! Comment puis-je vous aider ? Tapez CATALOGUE pour voir nos produits." },
  { trigger: "prix", match: "contient", reply: "Voici nos prix ! Tous nos produits sont affichés en FCFA. Tapez COMMANDE pour commander." },
  { trigger: "livraison", match: "contient", reply: "🚚 Nous livrons à Abidjan en 2h, partout en Côte d'Ivoire en 24h. Suivi en temps réel inclus !" },
  { trigger: "paiement", match: "contient", reply: "💳 Nous acceptons Wave, Orange Money, MTN MoMo, Moov et paiement à la livraison." },
  { trigger: "catalogue", match: "exact", reply: "Voici notre catalogue 📚 Tapez le nom d'un produit pour plus d'infos !" },
  { trigger: "merci", match: "contient", reply: "Avec plaisir 🙏 N'hésitez pas si vous avez d'autres questions !" },
];

type WhatsAppContact = {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  lastOrderAmount: number;
  lastOrderDate: string;
  totalSpent: number;
  orderCount: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number | null;
};

export default function WhatsAppPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [contacts, setContacts] = React.useState<WhatsAppContact[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [activeContact, setActiveContact] = React.useState<WhatsAppContact | null>(null);
  const [messageText, setMessageText] = React.useState("");

  const loadData = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load orders to extract WhatsApp contacts
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Group by phone to create contacts
      const contactMap = new Map<string, WhatsAppContact>();
      (orders || []).forEach((order: any) => {
        const key = order.customer_phone || order.customer_name;
        if (!key) return;
        const existing = contactMap.get(key);
        if (existing) {
          existing.totalSpent += order.amount || 0;
          existing.orderCount += 1;
          if (order.created_at > existing.lastOrderDate) {
            existing.lastOrderDate = order.created_at;
            existing.lastOrderAmount = order.amount || 0;
          }
        } else {
          contactMap.set(key, {
            id: key,
            name: order.customer_name || "Client",
            phone: order.customer_phone || null,
            city: order.customer_city || null,
            lastOrderAmount: order.amount || 0,
            lastOrderDate: order.created_at,
            totalSpent: order.amount || 0,
            orderCount: 1,
          });
        }
      });

      setContacts(Array.from(contactMap.values()));

      // Load products for catalog
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, image_url, category, stock")
        .eq("user_id", user.id)
        .eq("status", "actif")
        .limit(6);

      setProducts((prods || []) as Product[]);
    } catch (err) {
      console.error("[WhatsApp] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeContact?.phone) return;

    // Open WhatsApp with pre-filled message
    const phone = activeContact.phone.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");

    setMessageText("");
    toast({ title: "WhatsApp ouvert", description: `Message envoyé à ${activeContact.name}` });
  };

  const handleNewCampaign = () => {
    toast({
      title: "Campagne WhatsApp",
      description: "Sélectionnez des clients et envoyez un message groupé",
    });
  };

  const stats = {
    conversations: contacts.length,
    revenue: contacts.reduce((s, c) => s + c.totalSpent, 0),
    avgOrder: contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + c.totalSpent, 0) / contacts.length) : 0,
    responseRate: contacts.length > 0 ? "98%" : "—",
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
        title="WhatsApp Commerce"
        subtitle="Vendez directement dans vos conversations WhatsApp"
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yaa-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yaa-green-500" />
              </span>
              Connecté
            </span>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600" onClick={handleNewCampaign}>
              <Plus className="w-4 h-4" /> Nouvelle campagne
            </Button>
          </>
        }
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-100 dark:bg-yaa-green-950/50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-yaa-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.conversations}</p>
          <p className="text-xs text-muted-foreground">Conversations</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 dark:bg-yaa-orange-950/50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-yaa-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{AUTO_REPLIES.length}</p>
          <p className="text-xs text-muted-foreground">Réponses auto</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xl font-bold">{stats.responseRate}</p>
          <p className="text-xs text-muted-foreground">Taux de réponse</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xl font-bold">{stats.avgOrder > 0 ? formatFCFA(stats.avgOrder).replace(" FCFA", "") : "0"}</p>
          <p className="text-xs text-muted-foreground">Panier moyen</p>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="conversations">
          <TabsList className="mb-4">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="auto">Réponses Auto</TabsTrigger>
          </TabsList>

          {/* Conversations */}
          <TabsContent value="conversations" className="mt-0">
            {contacts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h2 className="font-display font-bold text-lg mb-1">Aucune conversation</h2>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Vos clients WhatsApp apparaîtront ici dès qu'ils passeront une commande avec leur numéro.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="flex h-[500px]">
                  {/* Left panel — contact list */}
                  <div className="w-72 lg:w-80 border-r flex flex-col flex-shrink-0">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher..." className="pl-9 h-8" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {contacts.map((c) => {
                        const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                        const isActive = activeContact?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setActiveContact(c)}
                            className={cn(
                              "w-full flex items-center gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 text-left transition-colors",
                              isActive && "bg-muted/70"
                            )}
                          >
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yaa-green-500 ring-2 ring-background" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold truncate">{c.name}</p>
                                <span className="text-[10px] text-muted-foreground">{c.orderCount} cmd</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] text-muted-foreground truncate">{c.phone || "Pas de numéro"}</p>
                                <p className="text-[10px] font-bold text-yaa-green-600">{formatFCFA(c.totalSpent).replace(" FCFA", "")}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right panel — chat */}
                  <div className="flex-1 flex flex-col min-w-0">
                    {activeContact ? (
                      <>
                        {/* Chat header */}
                        <div className="h-14 px-4 border-b flex items-center gap-2.5 bg-muted/30">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">
                              {activeContact.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{activeContact.name}</p>
                            <p className="text-[10px] text-muted-foreground">{activeContact.phone || "Pas de numéro"}</p>
                          </div>
                          {activeContact.totalSpent >= 200000 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Crown className="h-3 w-3" /> VIP
                            </span>
                          )}
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                          <div className="flex justify-start">
                            <div className="max-w-[75%] px-3 py-2 text-sm bg-background rounded-2xl rounded-bl-md border">
                              <p>Bonjour ! J'ai vu votre boutique en ligne et je suis intéressé par vos produits.</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{new Date(activeContact.lastOrderDate).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="max-w-[75%] px-3 py-2 text-sm bg-yaa-green-500 text-white rounded-2xl rounded-br-md">
                              <p>Bonjour {activeContact.name.split(" ")[0]} ! 👋 Merci pour votre intérêt. N'hésitez pas à parcourir notre catalogue !</p>
                              <p className="text-[10px] text-white/70 mt-1">Maintenant</p>
                            </div>
                          </div>
                          {activeContact.lastOrderAmount > 0 && (
                            <div className="flex justify-start">
                              <div className="max-w-[75%] px-3 py-2 text-sm bg-background rounded-2xl rounded-bl-md border border-yaa-green-200">
                                <p className="text-xs font-bold text-yaa-green-700">✓ Commande confirmée</p>
                                <p className="text-xs text-muted-foreground mt-1">Montant : {formatFCFA(activeContact.lastOrderAmount)}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input bar */}
                        <div className="p-3 border-t bg-background flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50"
                            onClick={() => toast({ title: "IA YaaMind", description: "Suggestion de réponse générée ! (Bientôt disponible)" })}
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                          <Input
                            placeholder="Tapez votre message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            disabled={!activeContact.phone}
                          />
                          <Button
                            size="icon"
                            className="h-9 w-9 bg-yaa-green-500 hover:bg-yaa-green-600"
                            onClick={handleSendMessage}
                            disabled={!activeContact.phone || !messageText.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        {!activeContact.phone && (
                          <p className="px-3 pb-2 text-[10px] text-amber-600">⚠️ Ce client n'a pas de numéro WhatsApp enregistré</p>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center p-8">
                        <div>
                          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-semibold">Sélectionnez une conversation</p>
                          <p className="text-xs text-muted-foreground mt-1">Cliquez sur un client pour voir la conversation</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Catalogue */}
          <TabsContent value="catalogue" className="mt-0">
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-semibold">Aucun produit dans votre catalogue</p>
                <p className="text-xs text-muted-foreground mt-1">Ajoutez des produits pour les partager sur WhatsApp</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {products.map((p) => (
                  <Card key={p.id} className="p-3 text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center text-2xl mb-2 overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-muted-foreground/40" />
                      )}
                    </div>
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-1">{p.category || "—"}</p>
                    <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(p.price)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 gap-1 border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10"
                      onClick={() => {
                        const text = `Bonjour ! Je suis intéressé par ${p.name} à ${formatFCFA(p.price)}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                    >
                      <MessageCircle className="w-3 h-3" /> Partager
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Auto replies */}
          <TabsContent value="auto" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTO_REPLIES.map((a, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 text-yaa-orange-600 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded">{a.trigger}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">Match: <span className="font-semibold">{a.match}</span></p>
                    <p className="text-xs text-muted-foreground leading-snug">{a.reply}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
