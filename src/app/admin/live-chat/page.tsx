"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  RefreshCw,
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Conversation = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  last_message: string | null;
  last_message_at: string;
  unread_by_merchant: number;
  created_at: string;
};

type Message = {
  id: string;
  sender: "customer" | "merchant" | "bot";
  content: string;
  created_at: string;
};

export default function LiveChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll for new conversations every 10s
  React.useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => loadConversations(true), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll for new messages every 3s
  React.useEffect(() => {
    if (!activeConvo) return;
    const interval = setInterval(() => loadMessages(activeConvo.id, true), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations(silent = false) {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/chat/conversations?userId=${user.id}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("[LiveChat] Load convos error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadMessages(convoId: string, silent = false) {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convoId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Mark as read
        fetch("/api/chat/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: convoId, reader: "merchant" }),
        }).catch(() => {});

        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === convoId ? { ...c, unread_by_merchant: 0 } : c))
        );
      }
    } catch (err) {
      console.error("[LiveChat] Load messages error:", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeConvo) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender: "merchant",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeConvo.id,
          sender: "merchant",
          content,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
        // Update conversation last message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvo.id
              ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast({ title: "Erreur", description: "Message non envoyé", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  const openConversation = (convo: Conversation) => {
    setActiveConvo(convo);
    loadMessages(convo.id);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diff < 60) return "À l'instant";
      if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
      return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    } catch { return "—"; }
  };

  const filteredConvos = conversations.filter((c) =>
    !search ||
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.customer_email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_by_merchant || 0), 0);

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
        title="Live Chat"
        subtitle={`${conversations.length} conversation${conversations.length > 1 ? "s" : ""} · ${totalUnread} non lue${totalUnread > 1 ? "s" : ""}`}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadConversations()}>
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        }
      />

      <motion.div variants={item}>
        <Card className="overflow-hidden p-0">
          <div className="flex h-[600px]">
            {/* Left panel — conversations list */}
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
                {filteredConvos.length === 0 ? (
                  <div className="text-center py-8 px-3">
                    <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">Aucune conversation</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Les messages des clients apparaîtront ici
                    </p>
                  </div>
                ) : (
                  filteredConvos.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openConversation(c)}
                      className={cn(
                        "w-full flex items-center gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 text-left transition-colors",
                        activeConvo?.id === c.id && "bg-muted/70"
                      )}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-yaa-green-100 text-xs font-bold text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400">
                          {c.customer_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{c.customer_name}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(c.last_message_at || c.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground truncate pr-1">
                            {c.last_message || "Nouvelle conversation"}
                          </p>
                          {c.unread_by_merchant > 0 && (
                            <span className="flex-shrink-0 text-[10px] font-bold text-white bg-rose-500 rounded-full px-1.5 py-0.5">
                              {c.unread_by_merchant}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right panel — chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeConvo ? (
                <>
                  {/* Chat header */}
                  <div className="h-14 px-4 border-b flex items-center gap-2.5 bg-muted/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-yaa-green-100 text-xs font-bold text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400">
                        {activeConvo.customer_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{activeConvo.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {activeConvo.customer_email || activeConvo.customer_phone || "—"}
                      </p>
                    </div>
                    {activeConvo.status === "open" ? (
                      <Badge className="bg-yaa-green-100 text-yaa-green-700 gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yaa-green-500 animate-pulse" /> Ouvert
                      </Badge>
                    ) : (
                      <Badge variant="outline">Fermé</Badge>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                    {loadingMessages ? (
                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-8">
                        Aucun message. Envoyez le premier !
                      </div>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn("flex", m.sender === "merchant" ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] px-3 py-2 text-sm",
                              m.sender === "merchant"
                                ? "bg-yaa-green-500 text-white rounded-2xl rounded-br-md"
                                : m.sender === "bot"
                                ? "bg-yaa-orange-50 dark:bg-yaa-orange-950/30 border-2 border-yaa-orange-200 rounded-2xl rounded-bl-md"
                                : "bg-background border rounded-2xl rounded-bl-md"
                            )}
                          >
                            {m.sender === "bot" && (
                              <div className="flex items-center gap-1 mb-1">
                                <Bot className="w-3 h-3 text-yaa-orange-500" />
                                <span className="text-[10px] font-bold text-yaa-orange-600">Auto-réponse</span>
                              </div>
                            )}
                            <p className="whitespace-pre-line">{m.content}</p>
                            <p className={cn("text-[10px] mt-1", m.sender === "merchant" ? "text-white/70" : "text-muted-foreground")}>
                              {formatTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t bg-background flex items-center gap-2">
                    <Input
                      placeholder="Répondre au client..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 bg-yaa-green-500 hover:bg-yaa-green-600 flex-shrink-0"
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground">
                  <div>
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    Sélectionnez une conversation
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Info card */}
      <motion.div variants={item} className="mt-4">
        <Card className="p-4 bg-gradient-to-br from-yaa-green-50 to-blue-50 dark:from-yaa-green-950/30 dark:to-blue-950/30 border-yaa-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yaa-green-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm mb-1">Live Chat automatique</h3>
              <p className="text-xs text-muted-foreground">
                Le widget Live Chat apparaît sur votre boutique publique. Les clients peuvent discuter
                en temps réel sans créer de compte. L'IA répond automatiquement au premier message
                pendant que vous êtes hors ligne.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
