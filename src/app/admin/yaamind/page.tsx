"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Copy, RefreshCw, Check, Trash2, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-600 dark:text-yaa-green-400" },
  orange: { bg: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-600 dark:text-yaa-orange-400" },
  blue: { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-600 dark:text-purple-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400" },
};

const QUICK_ACTIONS = [
  { label: "Analyser ventes", icon: "TrendingUp", color: "green", prompt: "Analyse mes ventes et donne-moi 3 conseils pour augmenter mon revenu" },
  { label: "Idées produits", icon: "Sparkles", color: "orange", prompt: "Donne-moi 5 idées de produits qui pourraient bien se vendre en Afrique" },
  { label: "Description produit", icon: "FileText", color: "blue", prompt: "Aide-moi à rédiger une description vendeuse pour un produit" },
  { label: "Réponse client", icon: "MessageCircle", color: "purple", prompt: "Aide-moi à répondre à un client mécontent professionnellement" },
  { label: "Stratégie prix", icon: "DollarSign", color: "emerald", prompt: "Comment optimiser mes prix pour augmenter ma marge ?" },
  { label: "Marketing WhatsApp", icon: "Megaphone", color: "orange", prompt: "Rédige un message WhatsApp marketing pour mes clients VIP" },
];

type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

export default function YaaMindPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [model, setModel] = React.useState("yaa-mind-v1");
  const [stats, setStats] = React.useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Load chat history from localStorage
  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("yaa_yaamind_chat") || "[]");
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        // Welcome message
        setMessages([{
          id: "welcome",
          sender: "assistant",
          text: "Bonjour 👋 Je suis YaaMind, votre assistant IA e-commerce. Je peux analyser vos ventes, rédiger des descriptions produits, suggérer des stratégies marketing et plus encore.\n\nComment puis-je vous aider aujourd'hui ?",
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {}

    // Load real boutique stats for context
    if (user) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadStats() {
    if (!user) return;
    try {
      const [prodRes, orderRes] = await Promise.all([
        supabase.from("products").select("id, name, price, sold", { count: "exact" }).eq("user_id", user.id),
        supabase.from("orders").select("amount").eq("user_id", user.id),
      ]);
      const revenue = (orderRes.data || []).reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
      const customers = new Set((orderRes.data || []).map((o: any) => o.customer_phone).filter(Boolean)).size;
      setStats({
        products: prodRes.count || 0,
        orders: orderRes.data?.length || 0,
        revenue,
        customers,
      });
    } catch (err) {
      console.warn("[YaaMind] Stats error:", err);
    }
  }

  // Save chat history to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("yaa_yaamind_chat", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    if (!confirm("Effacer toute la conversation ?")) return;
    setMessages([{
      id: "welcome",
      sender: "assistant",
      text: "Conversation réinitialisée. Comment puis-je vous aider ?",
      timestamp: new Date().toISOString(),
    }]);
    toast({ title: "Conversation effacée" });
  };

  // Generate a smart response based on the user's input + real boutique data
  function generateResponse(userText: string): string {
    const q = userText.toLowerCase();
    const ctx = `Boutique: ${stats.products} produits, ${stats.orders} commandes, ${formatFCFA(stats.revenue)} revenus, ${stats.customers} clients`;

    if (q.includes("vente") || q.includes("revenu") || q.includes("analy")) {
      if (stats.orders === 0) {
        return `📊 **Analyse de vos ventes**\n\nVous n'avez pas encore de commandes. Voici 3 conseils pour démarrer :\n\n1. **Ajoutez 5-10 produits** avec photos professionnelles et descriptions détaillées\n2. **Partagez votre boutique** sur WhatsApp et les réseaux sociaux\n3. **Activez le COD** (paiement à la livraison) — 70% des clients africains préfèrent payer en cash\n\n\n(Contexte: ${ctx})`;
      }
      return `📊 **Analyse de vos ventes**\n\nAvec ${stats.orders} commandes et ${formatFCFA(stats.revenue)} de revenus, vos performances sont à suivre. 3 conseils :\n\n1. **Analysez vos meilleurs produits** — concentrez-vous sur les top sellers\n2. **Optimisez votre panier moyen** avec des bundles (-15% sur 2 produits)\n3. **Relancez les clients VIP** avec un code promo personnalisé\n\n\n(Contexte: ${ctx})`;
    }

    if (q.includes("description") || q.includes("produit")) {
      return `✍️ **Rédaction de description produit**\n\nVoici un template performant pour l'Afrique :\n\n---\n**[Nom du produit]** — Qualité premium, idéal pour [usage]\n\n✅ Caractéristiques principales :\n- Matériau de première qualité\n- Fabrication artisanale / industrielle\n- Design moderne et élégant\n\n🚚 **Livraison** : Abidjan 2h, partout en Côte d'Ivoire 24h\n💳 **Paiement** : Wave, Orange Money, MTN MoMo, Cash à la livraison\n🔄 **Retour gratuit** sous 7 jours\n\nAdaptez-le avec vos propres caractéristiques !`;
    }

    if (q.includes("prix") || q.includes("marge") || q.includes("tarif")) {
      return `💰 **Stratégie de prix**\n\nPour optimiser vos marges :\n\n1. **Calculez votre coût de revient** : prix achat + livraison + emballage + 10% marge min\n2. **Psychologie des prix** : 24 500 FCFA > 25 000 FCFA (effet "prix rond")\n3. **Bundles** : -10% sur 2 produits augmente le panier moyen de 30%\n4. **Promo ciblée** : -15% aux VIP +10% aux nouveaux (codes promo disponibles dans l'admin)\n5. **Surveillez la concurrence** sur WhatsApp & Jumia`;
    }

    if (q.includes("whatsapp") || q.includes("marketing") || q.includes("client")) {
      return `📣 **Message marketing WhatsApp**\n\nVoici 3 templates prêts à l'emploi :\n\n**1. Promo Flash (24h)** :\n"🚨 PROMO FLASH 24h ! {{produit}} à {{prix_promo}} au lieu de {{prix_normal}}. Code: FLASH24. Stock limité — first come, first served !"\n\n**2. Nouveau client** :\n"Bienvenue {{prenom}} ! 🎉 Profitez de -10% sur votre 1ère commande avec le code BIENVENUE. Découvrez notre boutique: {{lien}}"\n\n**3. Réactivation VIP** :\n"{{prenom}}, on vous a manqué ! 🙏 En exclusivité pour nos VIP: -15% sur tout avec le code VIP15, valable 48h."`;
    }

    if (q.includes("idée") || q.includes("idee") || q.includes("produit") && q.includes("vendre")) {
      return `💡 **Idées de produits pour l'Afrique**\n\nBasé sur les tendances 2025-2026 :\n\n1. **Mode africaine moderne** — boubous contemporains, wax premium\n2. **Cosmétiques naturels** — karité, baobab, beurre de mangue\n3. **Accessoires tech** — coques iPhone/Samsung, chargeurs, écouteurs\n4. **Alimentation transformée** — café local, épices, miel\n5. **Mobilier artisanal** — tabourets sculptés, paniers tressés\n6. **Produits digitaux** — formations, e-books, templates\n\nChoisissez une niche où vous avez de l'expertise + accès facile aux fournisseurs.`;
    }

    if (q.includes("réponse") || q.includes("reponse") || q.includes("mécontent") || q.includes("client")) {
      return `💬 **Réponse à un client mécontent**\n\nTemplate professionnel :\n\n"Bonjour {{prenom}},\n\nJe suis vraiment désolé(e) que votre expérience n'ait pas été à la hauteur. Nous prenons chaque retour très au sérieux.\n\nPour résoudre ce problème rapidement :\n1. Pouvez-vous m'envoyer une photo du produit ?\n2. Nous vous proposons un [remplacement / remboursement complet]\n3. Un code promo -15% sur votre prochaine commande\n\nVotre satisfaction est notre priorité. Dites-moi comment vous souhaitez procéder.\n\nCordialement,\n{{votre_nom}}"`;
    }

    // Default response
    return `🤖 J'ai bien reçu votre question : "${userText}"\n\nJe suis YaaMind, votre assistant IA. Je peux vous aider avec :\n\n- 📊 **Analyse des ventes**\n- ✍️ **Rédaction de descriptions produits**\n- 💰 **Stratégie de prix**\n- 📣 **Marketing WhatsApp**\n- 💡 **Idées de produits**\n- 💬 **Réponses clients**\n\nPosez-moi une question plus spécifique sur l'un de ces sujets !\n\n(Contexte: ${ctx})`;
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const responseText = generateResponse(messageText);
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      sender: "assistant",
      text: responseText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setThinking(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="IA YaaMind"
        subtitle="Votre assistant IA — connecté à vos vraies données boutique"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={clearChat}>
              <Trash2 className="h-4 w-4" /> Effacer
            </Button>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-44 gap-2">
                <Sparkles className="h-3.5 w-3.5 text-yaa-orange-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yaa-mind-v1">YaaMind v1 (par défaut)</SelectItem>
                <SelectItem value="yaa-mind-pro">YaaMind Pro (bientôt)</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {QUICK_ACTIONS.map((a) => {
          const col = ACTION_COLORS[a.color];
          return (
            <Card
              key={a.label}
              className="p-3 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => sendMessage(a.prompt)}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform", col.bg, col.text)}>
                <DynamicIcon name={a.icon} className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold leading-tight">{a.label}</p>
            </Card>
          );
        })}
      </motion.div>

      {/* Chat */}
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.sender === "user" ? "justify-end" : "justify-start")}>
                {m.sender === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div
                    className={cn(
                      "px-3 py-2 text-sm whitespace-pre-line",
                      m.sender === "user"
                        ? "bg-yaa-green-500 text-white rounded-2xl rounded-br-md"
                        : "bg-background border rounded-2xl rounded-bl-md"
                    )}
                  >
                    {renderText(m.text)}
                  </div>
                  {m.sender === "assistant" && (
                    <div className="flex items-center gap-3 mt-1 ml-1">
                      <button
                        onClick={() => copyText(m.text, m.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      >
                        {copied === m.id ? <><Check className="h-3 w-3" /> Copié</> : <><Copy className="h-3 w-3" /> Copier</>}
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(m.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-background border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-background flex items-center gap-2">
            <Input
              placeholder="Posez votre question à YaaMind..."
              className="flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-yaa-orange-500 hover:bg-yaa-orange-600"
              onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Info card */}
      <motion.div variants={item} className="mt-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm mb-1">À propos de YaaMind</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                YaaMind est votre assistant IA e-commerce intégré. Il connaît le contexte de votre boutique
                ({stats.products} produits, {stats.orders} commandes, {stats.customers} clients) et peut
                vous aider à analyser vos ventes, rédiger du contenu, et optimiser votre stratégie marketing.
                Les conversations sont sauvegardées localement dans votre navigateur.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
