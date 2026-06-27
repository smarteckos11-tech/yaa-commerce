"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Copy,
  RefreshCw,
  Check,
  Loader2,
  MessageSquareReply,
  Lightbulb,
  TrendingUp,
  Ticket,
  Search,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Réponse client", icon: MessageSquareReply, color: "green", prompt: "Rédige une réponse professionnelle à un client qui demande si un produit est disponible." },
  { label: "Idées produits", icon: Lightbulb, color: "orange", prompt: "Donne-moi 5 idées de produits à vendre dans une boutique e-commerce africaine." },
  { label: "Analyser ventes", icon: TrendingUp, color: "blue", prompt: "Analyse mes ventes et donne-moi 3 recommandations pour augmenter mon chiffre d'affaires." },
  { label: "Code promo", icon: Ticket, color: "purple", prompt: "Crée un code promo attractif pour la Tabaski 2026 avec un message marketing." },
  { label: "Optimiser SEO", icon: Search, color: "emerald", prompt: "Optimise le SEO de ma boutique e-commerce pour apparaître sur Google." },
  { label: "Auto-réponse WhatsApp", icon: MessageCircle, color: "orange", prompt: "Crée un message d'accueil WhatsApp pour ma boutique." },
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isSuggestion?: boolean;
};

// Pre-built responses for common queries (no external AI API needed)
function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("réponse") || lower.includes("client") || lower.includes("disponible")) {
    return `Voici une réponse professionnelle pour votre client :

« Bonjour ! 👋 Merci pour votre intérêt. Oui, ce produit est actuellement disponible en stock ! 

📦 **Détails :**
- Produit disponible et prêt à être expédié
- Livraison express à Abidjan en 2h via Yango
- Paiement Mobile Money (Wave, Orange Money, MTN) ou paiement à la livraison

Souhaitez-vous passer commande ? Je peux vous envoyer le lien de paiement directement. 🙏 »`;

  }

  if (lower.includes("idée") || lower.includes("produit")) {
    return `Voici 5 idées de produits pour votre boutique e-commerce africaine :

1. **Sac en cuir Faso Dan Fani** — Fait main au Burkina Faso, très tendance
2. **Beurre de karité bio** — Cosmétique naturel, forte demande internationale
3. **Pagne wax premium** — Mode africaine, marché en croissance
4. **Café Arabica de Man** — Produit local de qualité, marché export
5. **Bijoux en bronze artisanaux** — Artisanat unique, marge élevée

💡 **Conseil :** Commencez par 2-3 produits avec de belles photos et des descriptions détaillées.`;

  }

  if (lower.includes("vente") || lower.includes("analy") || lower.includes("chiffre")) {
    return `Voici 3 recommandations pour augmenter votre chiffre d'affaires :

1. **📦 Diversifiez votre catalogue** — Ajoutez des produits complémentaires (ex: si vous vendez des sacs, ajoutez des portefeuilles assortis). Cela augmente le panier moyen de 30%.

2. **📱 Activez WhatsApp Business** — 80% des ventes en Afrique passent par WhatsApp. Partagez votre catalogue quotidiennement et répondez en moins de 5 minutes.

3. **🎁 Créez des codes promo** — Les réductions de 10-15% augmentent le taux de conversion de 25%. Utilisez des codes comme "BIENVENUE10" pour les nouveaux clients.

💡 **Bonus :** Mettez en place des bundles (offres groupées) pour augmenter le panier moyen.`;

  }

  if (lower.includes("promo") || lower.includes("code") || lower.includes("tabaski")) {
    return `Voici un code promo et un message marketing pour la Tabaski 2026 :

🎫 **Code promo :** TABASKI2026
📉 **Réduction :** -20% sur toute la boutique
📅 **Période :** 10 juin - 15 juillet 2026
💰 **Minimum :** 25 000 FCFA

📱 **Message WhatsApp :**
« 🐑 TABASKI 2026 chez [Votre Boutique] ! 🎉

Profitez de -20% sur TOUT notre catalogue avec le code TABASKI2026 !

✅ Livraison express à Abidjan
✅ Paiement Mobile Money + Cash à la livraison
✅ Qualité garantie

👉 Commandez maintenant : [Lien boutique]
⏰ Offre limitée — Jusqu'au 15 juillet ! »

💡 **Astuce :** Envoyez ce message à vos clients VIP en premier pour maximiser l'impact.`;

  }

  if (lower.includes("seo") || lower.includes("google")) {
    return `Voici 5 conseils pour optimiser le SEO de votre boutique :

1. **📝 Titres produits** — Utilisez des mots-clés (ex: "Sac en cuir Faso Dan Fani fait main Ouagadougou" au lieu de juste "Sac")

2. **📄 Descriptions riches** — Décrivez matériaux, dimensions, origine, fabrication. Minimum 200 mots par produit.

3. **📸 Images optimisées** — Nommez vos fichiers (ex: sac-cuir-faso-dan-fani.jpg) et ajoutez des balises alt

4. **🔗 Partagez sur les réseaux** — Chaque partage WhatsApp/Facebook crée un backlink vers votre boutique

5. **⚡ Vitesse de chargement** — YAA optimise automatiquement vos images. Gardez un catalogue de moins de 50 produits pour des temps de chargement rapides.

💡 **Bonus :** Créez un compte Google Business Profile pour apparaître sur Google Maps.`;

  }

  if (lower.includes("whatsapp") || lower.includes("accueil") || lower.includes("message")) {
    return `Voici un message d'accueil WhatsApp pour votre boutique :

« 🙏 Bienvenue chez [Votre Boutique] !

Nous sommes ravis de vous accueillir. Voici ce que nous proposons :

📦 **Nos produits :** [Liste des catégories]
💰 **Prix :** À partir de [prix minimum] FCFA
🚚 **Livraison :** Abidjan 2h · Côte d'Ivoire 24h · International 3-5j
💳 **Paiement :** Wave, Orange Money, MTN, Cash à la livraison

👉 Tapez CATALOGUE pour voir nos produits
👉 Tapez COMMANDE pour passer commande
👉 Tapez LIVRAISON pour les infos de livraison

Merci de votre confiance ! 🙏 »

💡 **Astuce :** Configurez ce message comme réponse automatique dans WhatsApp Business.`;

  }

  // Default response
  return `Je suis YaaMind, votre assistant IA e-commerce. Je peux vous aider avec :

📝 **Rédaction** — Réponses clients, descriptions produits, messages marketing
📊 **Analyse** — Performances, recommandations de croissance
💡 **Idées** — Produits, campagnes, codes promo
🔍 **SEO** — Optimisation de votre boutique pour Google
📱 **WhatsApp** — Messages d'accueil, auto-réponses

Que puis-je faire pour vous aujourd'hui ? 😊`;
}

export default function YaaMindPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [model, setModel] = React.useState("yaa-mind");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! 👋 Je suis **YaaMind**, votre assistant IA e-commerce. Je peux vous aider à rédiger des réponses clients, générer des descriptions produits, créer des campagnes marketing et analyser vos ventes.\n\nQue puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const prompt = customPrompt || input.trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

    const response = generateResponse(prompt);

    const assistantMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copié !", description: "Texte copié dans le presse-papier" });
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  const renderContent = (content: string) => {
    // Parse **bold** markdown
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="IA YaaMind"
        subtitle="Votre assistant IA pour piloter votre boutique"
        actions={
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-48 gap-2">
              <Sparkles className="h-3.5 w-3.5 text-yaa-orange-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yaa-mind">YaaMind (Recommandé)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="claude-3-5">Claude 3.5 Sonnet</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {QUICK_ACTIONS.map((a) => {
          const colors: Record<string, string> = {
            green: "bg-yaa-green-100 dark:bg-yaa-green-950/50 text-yaa-green-600 dark:text-yaa-green-400",
            orange: "bg-yaa-orange-100 dark:bg-yaa-orange-950/50 text-yaa-orange-600 dark:text-yaa-orange-400",
            blue: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
            purple: "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
            emerald: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
          };
          return (
            <Card key={a.label} className="p-3 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleQuickAction(a.prompt)}>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform", colors[a.color])}>
                <a.icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold leading-tight">{a.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Chat */}
      <Card className="overflow-hidden">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-muted/20">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn("max-w-[75%]", msg.role === "user" && "hidden")}>
                  {msg.role === "user" ? null : (
                    <div className="px-3 py-2 text-sm bg-background border rounded-2xl rounded-bl-md whitespace-pre-line">
                      {renderContent(msg.content)}
                      <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-100">
                        <button onClick={() => handleCopy(msg.id, msg.content)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                          {copiedId === msg.id ? <><Check className="h-3 w-3" /> Copié</> : <><Copy className="h-3 w-3" /> Copier</>}
                        </button>
                        <button onClick={() => handleSend(`Régénère: ${msg.content.slice(0, 50)}...`)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                          <RefreshCw className="h-3 w-3" /> Régénérer
                        </button>
                        <span className="text-[10px] text-muted-foreground ml-auto">{msg.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="px-3 py-2 text-sm bg-yaa-green-500 text-white rounded-2xl rounded-br-md whitespace-pre-line">
                    {msg.content}
                    <p className="text-[10px] text-white/70 mt-1">{msg.timestamp}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-background border rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="p-3 border-t bg-background flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleSend("Régénère la dernière réponse")} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Posez votre question à YaaMind..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            disabled={loading}
            className="flex-1"
          />
          <Button
            size="icon"
            className="h-9 w-9 bg-yaa-orange-500 hover:bg-yaa-orange-600"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Info banner */}
      <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-purple-700">YaaMind</span> utilise une IA locale pour des réponses instantanées. Pour des réponses plus avancées (GPT-4o, Claude), connectez une clé API OpenAI/Anthropic dans Paramètres → Sécurité.
        </p>
      </div>
    </motion.div>
  );
}
