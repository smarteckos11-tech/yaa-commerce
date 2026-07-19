"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  sender: "customer" | "merchant" | "bot";
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  user_id: string;
  customer_name: string;
  status: string;
};

/**
 * Widget Live Chat à afficher sur la boutique publique.
 * Bouton flottant en bas à droite → ouvre une fenêtre de chat.
 *
 * Usage: <LiveChatWidget userId={boutique.user_id} />
 */
export function LiveChatWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [showNameForm, setShowNameForm] = React.useState(false);
  const [sessionId] = React.useState(() => {
    // Generate or retrieve session ID
    const key = "yaa_chat_session";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(key, sid);
    }
    return sid;
  });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load or create conversation when widget opens
  React.useEffect(() => {
    if (!isOpen || !userId) return;
    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // Poll for new messages every 3s when open
  React.useEffect(() => {
    if (!isOpen || !conversation) return;
    const interval = setInterval(() => loadMessages(), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversation]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation() {
    setLoading(true);
    try {
      // Try to find existing conversation by session_id
      const res = await fetch(`/api/chat/conversations?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        const conv = data.conversations[0];
        // Filter to this boutique's user_id
        if (conv.user_id === userId) {
          setConversation(conv);
          // Load customer name from localStorage
          const savedName = localStorage.getItem("yaa_chat_customer_name") || conv.customer_name;
          if (savedName) setCustomerName(savedName);
          await loadMessages(conv.id);
          return;
        }
      }
      // No existing conversation → show name form
      const savedName = localStorage.getItem("yaa_chat_customer_name");
      if (savedName) {
        setCustomerName(savedName);
        await createConversation(savedName);
      } else {
        setShowNameForm(true);
      }
    } catch (err) {
      console.error("[LiveChat] Load conv error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createConversation(name: string) {
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          customer_name: name,
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (data.conversation) {
        setConversation(data.conversation);
        localStorage.setItem("yaa_chat_customer_name", name);
        setShowNameForm(false);
      }
    } catch (err) {
      console.error("[LiveChat] Create conv error:", err);
    }
  }

  async function loadMessages(convId?: string) {
    const id = convId || conversation?.id;
    if (!id) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        // Mark as read
        fetch("/api/chat/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: id, reader: "customer" }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[LiveChat] Load messages error:", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !conversation) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Optimistic
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender: "customer",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation.id,
          sender: "customer",
          content,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? data.message : m)));
        // If auto-reply
        if (data.autoReply) {
          await new Promise((r) => setTimeout(r, 500));
          setMessages((prev) => [...prev, data.autoReply]);
        }
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-yaa-green-500 hover:bg-yaa-green-600 shadow-lg flex items-center justify-center text-white transition-colors"
        aria-label="Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && messages.some((m) => m.sender !== "customer") && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            !
          </span>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-yaa-green-500 text-white p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Chat en direct</p>
                <p className="text-[10px] opacity-90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  En ligne · Réponse sous 5 min
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : showNameForm ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-yaa-green-100 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-yaa-green-600" />
                  </div>
                  <p className="text-sm font-semibold mb-1">Bonjour 👋</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Comment vous appelez-vous ? Notre équipe est prête à vous aider.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customerName.trim()) createConversation(customerName.trim());
                    }}
                  >
                    <Input
                      placeholder="Votre nom"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="text-center mb-2"
                      autoFocus
                    />
                    <Button type="submit" className="w-full bg-yaa-green-500 hover:bg-yaa-green-600" disabled={!customerName.trim()}>
                      Commencer la conversation
                    </Button>
                  </form>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Posez votre question, on vous répond !
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.sender === "customer" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] px-3 py-2 text-sm rounded-2xl",
                        m.sender === "customer"
                          ? "bg-yaa-green-500 text-white rounded-br-md"
                          : m.sender === "bot"
                          ? "bg-yaa-orange-100 dark:bg-yaa-orange-950/30 text-foreground rounded-bl-md border border-yaa-orange-200"
                          : "bg-white dark:bg-slate-800 border rounded-bl-md"
                      )}
                    >
                      {m.sender === "bot" && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <Bot className="w-3 h-3 text-yaa-orange-500" />
                          <span className="text-[9px] font-bold text-yaa-orange-600">Assistant</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{m.content}</p>
                      <p className={cn("text-[9px] mt-0.5", m.sender === "customer" ? "text-white/70" : "text-muted-foreground")}>
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {conversation && !showNameForm && (
              <div className="p-2 border-t bg-white dark:bg-slate-900 flex items-center gap-2">
                <Input
                  placeholder="Votre message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 text-sm h-9"
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
