"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  Search,
  Bot,
  Crown,
  Loader2,
  MessageCircle,
  Circle,
  ExternalLink,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ------------------------------------------------------------
// Static system templates — these are NOT user data
// ------------------------------------------------------------
const AUTO_REPLIES = [
  {
    trigger: "bonjour",
    match: "contient",
    reply:
      "Bonjour 👋 Bienvenue chez YAA Boutique ! Comment puis-je vous aider aujourd'hui ? Vous pouvez consulter notre catalogue en tapant CATALOGUE.",
  },
  {
    trigger: "prix",
    match: "contient",
    reply:
      "Voici nos meilleurs prix du moment ! Tous nos produits sont affichés en FCFA. Paiement Wave, Orange Money, MTN MoMo acceptés. Tapez COMMANDE pour commander.",
  },
  {
    trigger: "livraison",
    match: "contient",
    reply:
      "🚚 Nous livrons à Abidjan en 2h, partout en Côte d'Ivoire en 24h. Frais calculés automatiquement. Suivi en temps réel inclus !",
  },
  {
    trigger: "paiement",
    match: "contient",
    reply:
      "💳 Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money et cartes bancaires. Paiement 100% sécurisé via YAA.",
  },
  {
    trigger: "stock",
    match: "contient",
    reply:
      "📦 Notre catalogue est mis à jour en temps réel. Si un produit est affiché, il est en stock ! Réservez vite en tapant COMMANDE.",
  },
  {
    trigger: "merci",
    match: "contient",
    reply:
      "Avec plaisir 🙏 N'hésitez pas si vous avez d'autres questions. Merci pour votre confiance !",
  },
];

// ------------------------------------------------------------
// Types (match Supabase schema)
// ------------------------------------------------------------
type Conversation = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string | null;
  last_message: string | null;
  unread_count: number;
  is_online: boolean;
  is_vip: boolean;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender: "boutique" | "client" | "ia";
  content: string;
  is_ia_suggestion: boolean;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  category: string | null;
  image_url: string | null;
  status: string;
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const waLink = (phone: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

export default function WhatsAppPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Conversations state
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingConvos, setLoadingConvos] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);

  // Products state (catalogue tab)
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);

  // Keep a ref of conversations so async handlers can read the latest value
  // without re-running effects.
  const conversationsRef = React.useRef<Conversation[]>([]);
  React.useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // ------------------------------------------------------------
  // Load conversations from Supabase (filtered by user_id via RLS)
  // ------------------------------------------------------------
  const loadConversations = React.useCallback(async () => {
    if (!user) return;
    setLoadingConvos(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setConversations((data || []) as Conversation[]);
    } catch (err) {
      console.error("[WhatsApp] load conversations error:", err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les conversations.",
        variant: "destructive",
      });
    } finally {
      setLoadingConvos(false);
    }
  }, [user, toast]);

  // ------------------------------------------------------------
  // Load products for catalogue tab (status = "actif" only)
  // ------------------------------------------------------------
  const loadProducts = React.useCallback(async () => {
    if (!user) return;
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock, category, image_url, status")
        .eq("user_id", user.id)
        .eq("status", "actif")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (err) {
      console.error("[WhatsApp] load products error:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ------------------------------------------------------------
  // Load messages when an active conversation is selected
  // + mark it as read (unread_count → 0)
  // ------------------------------------------------------------
  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingMessages(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("whatsapp_messages")
          .select("*")
          .eq("conversation_id", activeId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (cancelled) return;
        setMessages((data || []) as Message[]);

        // Mark conversation as read (only if it had unread messages)
        const active = conversationsRef.current.find(
          (c) => c.id === activeId
        );
        if (active && active.unread_count > 0) {
          const { error: updErr } = await supabase
            .from("whatsapp_conversations")
            .update({ unread_count: 0 })
            .eq("id", activeId);
          if (!updErr && !cancelled) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeId ? { ...c, unread_count: 0 } : c
              )
            );
          }
        }
      } catch (err) {
        console.error("[WhatsApp] load messages error:", err);
        if (!cancelled) {
          toast({
            title: "Erreur",
            description: "Messages indisponibles.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeId, toast]);

  // ------------------------------------------------------------
  // Send a message: insert into whatsapp_messages + update convo
  // ------------------------------------------------------------
  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeId || !user || sending) return;

    setSending(true);
    setDraft("");

    try {
      const { data, error } = await supabase
        .from("whatsapp_messages")
        .insert({
          conversation_id: activeId,
          sender: "boutique",
          content: text,
          is_ia_suggestion: false,
        })
        .select("*")
        .single();
      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);

      // Update conversation's last_message + updated_at so it sorts first
      const nowIso = new Date().toISOString();
      const { error: updErr } = await supabase
        .from("whatsapp_conversations")
        .update({
          last_message: text,
          updated_at: nowIso,
        })
        .eq("id", activeId);
      if (updErr) throw updErr;

      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === activeId
            ? { ...c, last_message: text, updated_at: nowIso }
            : c
        );
        // Move updated conversation to the top
        const moved = next.find((c) => c.id === activeId);
        if (moved) {
          return [moved, ...next.filter((c) => c.id !== activeId)];
        }
        return next;
      });
    } catch (err) {
      console.error("[WhatsApp] send error:", err);
      toast({
        title: "Envoi échoué",
        description: "Le message n'a pas pu être envoyé.",
        variant: "destructive",
      });
      setDraft(text); // restore draft on failure
    } finally {
      setSending(false);
    }
  };

  // ------------------------------------------------------------
  // Filtered conversations (search)
  // ------------------------------------------------------------
  const filteredConvos = React.useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(q) ||
        (c.last_message?.toLowerCase().includes(q) ?? false)
    );
  }, [conversations, search]);

  const activeConvo =
    conversations.find((c) => c.id === activeId) || null;

  // ------------------------------------------------------------
  // Stats computed from REAL data
  // ------------------------------------------------------------
  const stats = React.useMemo(
    () => [
      {
        label: "Conversations",
        value: conversations.length,
        color: "green" as const,
        icon: "MessageCircle",
      },
      {
        label: "Non lus",
        value: conversations.reduce(
          (s, c) => s + (c.unread_count || 0),
          0
        ),
        color: "orange" as const,
        icon: "Circle",
      },
      {
        label: "En ligne",
        value: conversations.filter((c) => c.is_online).length,
        color: "emerald" as const,
        icon: "Zap",
      },
      {
        label: "VIP",
        value: conversations.filter((c) => c.is_vip).length,
        color: "amber" as const,
        icon: "Crown",
      },
    ],
    [conversations]
  );

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
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => loadConversations()}
              disabled={loadingConvos}
            >
              {loadingConvos ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Rafraîchir
            </Button>
          </>
        }
      />

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6"
      >
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="conversations">
          <TabsList className="mb-4">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="auto">Réponses Auto</TabsTrigger>
          </TabsList>

          {/* =================================================== */}
          {/* TAB — CONVERSATIONS                                  */}
          {/* =================================================== */}
          <TabsContent value="conversations" className="mt-0">
            <Card className="overflow-hidden p-0">
              <div className="flex h-[560px]">
                {/* ---------- Left panel — list ---------- */}
                <div className="w-72 lg:w-80 border-r flex flex-col flex-shrink-0">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-9 h-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loadingConvos ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-yaa-green-500" />
                      </div>
                    ) : filteredConvos.length === 0 ? (
                      <div className="text-center py-16 px-4">
                        <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm font-semibold">
                          {conversations.length === 0
                            ? "Aucune conversation"
                            : "Aucun résultat"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversations.length === 0
                            ? "Les conversations WhatsApp de vos clients apparaîtront ici."
                            : "Essayez un autre terme de recherche."}
                        </p>
                      </div>
                    ) : (
                      filteredConvos.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setActiveId(c.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 text-left transition-colors",
                            activeId === c.id && "bg-muted/70"
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">
                                {initialsOf(c.customer_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background",
                                c.is_online ? "bg-yaa-green-500" : "bg-muted"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold truncate flex items-center gap-1">
                                {c.is_vip && (
                                  <Crown className="h-3 w-3 text-amber-500" />
                                )}
                                {c.customer_name}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTime(c.updated_at)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-muted-foreground truncate pr-1">
                                {c.last_message || "—"}
                              </p>
                              {c.unread_count > 0 && (
                                <span className="flex-shrink-0 text-[10px] font-bold text-white bg-yaa-green-500 rounded-full px-1.5 py-0.5">
                                  {c.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* ---------- Right panel — chat ---------- */}
                <div className="flex-1 flex flex-col min-w-0">
                  {activeConvo ? (
                    <>
                      {/* Chat header */}
                      <div className="h-14 px-4 border-b flex items-center gap-2.5 bg-muted/30">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">
                            {initialsOf(activeConvo.customer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-1">
                            {activeConvo.is_vip && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                            {activeConvo.customer_name}
                          </p>
                          <p className="text-[10px] text-yaa-green-600">
                            {activeConvo.is_online
                              ? "● En ligne"
                              : "Hors ligne"}
                          </p>
                        </div>
                        {activeConvo.is_vip && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                        {activeConvo.customer_phone && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                          >
                            <a
                              href={waLink(activeConvo.customer_phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" /> Ouvrir WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-yaa-green-500" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-center">
                            <div>
                              <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Aucun message. Démarrez la conversation !
                              </p>
                            </div>
                          </div>
                        ) : (
                          messages.map((m) => {
                            const isBoutique = m.sender === "boutique";
                            const isIa = m.sender === "ia";
                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "flex",
                                  isBoutique ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[75%] px-3 py-2 text-sm",
                                    isBoutique
                                      ? "bg-yaa-green-500 text-white rounded-2xl rounded-br-md"
                                      : "bg-background rounded-2xl rounded-bl-md border",
                                    isIa && "border-yaa-orange-300"
                                  )}
                                >
                                  {(isIa || m.is_ia_suggestion) && (
                                    <div className="flex items-center gap-1 mb-1 opacity-80">
                                      <Sparkles className="h-3 w-3" />
                                      <span className="text-[10px] font-bold">
                                        Suggestion IA
                                      </span>
                                    </div>
                                  )}
                                  <p className="whitespace-pre-line">
                                    {m.content}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-[10px] mt-1",
                                      isBoutique
                                        ? "text-white/70"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {formatTime(m.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Input bar */}
                      <div className="p-3 border-t bg-background flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50"
                          title="Suggestion IA"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="Tapez votre message..."
                          className="flex-1"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          disabled={sending}
                        />
                        <Button
                          size="icon"
                          className="h-9 w-9 bg-yaa-green-500 hover:bg-yaa-green-600"
                          onClick={handleSend}
                          disabled={!draft.trim() || sending}
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center px-6">
                      <div>
                        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="font-semibold">
                          Sélectionnez une conversation
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          Choisissez une conversation dans la liste de gauche
                          pour afficher les messages et répondre à votre client.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* =================================================== */}
          {/* TAB — CATALOGUE                                      */}
          {/* =================================================== */}
          <TabsContent value="catalogue" className="mt-0">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
              </div>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-semibold">Aucun produit actif</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Ajoutez des produits avec le statut « actif » dans la section
                  Produits pour les afficher dans votre catalogue WhatsApp.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {products.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="p-3 text-center hover:shadow-md transition-shadow">
                      <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center text-3xl mb-2 overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {p.category || "—"}
                      </p>
                      <p className="text-sm font-bold text-yaa-green-600">
                        {formatFCFA(p.price)}
                      </p>
                      <span
                        className={cn(
                          "inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1",
                          p.stock !== null && p.stock <= 10
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        Stock: {p.stock === null ? "∞" : p.stock}
                      </span>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* =================================================== */}
          {/* TAB — RÉPONSES AUTO                                  */}
          {/* =================================================== */}
          <TabsContent value="auto" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTO_REPLIES.map((a, idx) => (
                <motion.div
                  key={a.trigger}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 text-yaa-orange-600 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs font-bold bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded">
                        {a.trigger}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Match: <span className="font-semibold">{a.match}</span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {a.reply}
                    </p>
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
