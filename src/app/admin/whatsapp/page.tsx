"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Search, Plus, Bot, Crown, Zap, Mail, Smartphone, Bell, Megaphone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { WHATSAPP_STATS, WHATSAPP_CONVERSATIONS, CHAT_MESSAGES, WHATSAPP_CATALOG, AUTO_REPLIES, WHATSAPP_CAMPAIGNS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function WhatsAppPage() {
  const [activeConvo, setActiveConvo] = React.useState(WHATSAPP_CONVERSATIONS[0]);

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
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><Plus className="h-4 w-4" /> Nouvelle campagne</Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {WHATSAPP_STATS.map((s) => (
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

      <motion.div variants={item}>
        <Tabs defaultValue="conversations">
          <TabsList className="mb-4">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="auto">Réponses Auto</TabsTrigger>
            <TabsTrigger value="campagnes">Campagnes</TabsTrigger>
          </TabsList>

          {/* Conversations */}
          <TabsContent value="conversations" className="mt-0">
            <Card className="overflow-hidden p-0">
              <div className="flex h-[500px]">
                {/* Left panel — list */}
                <div className="w-72 lg:w-80 border-r flex flex-col flex-shrink-0">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Rechercher..." className="pl-9 h-8" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {WHATSAPP_CONVERSATIONS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveConvo(c)}
                        className={cn(
                          "w-full flex items-center gap-2.5 p-3 hover:bg-muted/50 border-b last:border-b-0 text-left transition-colors",
                          activeConvo.id === c.id && "bg-muted/70"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">{c.avatar}</AvatarFallback>
                          </Avatar>
                          <span className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background", c.online ? "bg-yaa-green-500" : "bg-muted")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold truncate flex items-center gap-1">
                              {c.vip && <Crown className="h-3 w-3 text-amber-500" />}
                              {c.name}
                            </p>
                            <span className="text-[10px] text-muted-foreground">{c.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-muted-foreground truncate pr-1">{c.lastMessage}</p>
                            {c.unread > 0 && (
                              <span className="flex-shrink-0 text-[10px] font-bold text-white bg-yaa-green-500 rounded-full px-1.5 py-0.5">{c.unread}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right panel — chat */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Chat header */}
                  <div className="h-14 px-4 border-b flex items-center gap-2.5 bg-muted/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#25D366]/20 text-xs font-bold text-[#1da851]">{activeConvo.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold flex items-center gap-1">
                        {activeConvo.vip && <Crown className="h-3 w-3 text-amber-500" />}
                        {activeConvo.name}
                      </p>
                      <p className="text-[10px] text-yaa-green-600">{activeConvo.online ? "● En ligne" : "Hors ligne"}</p>
                    </div>
                    {activeConvo.vip && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded">VIP</span>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                    {CHAT_MESSAGES.map((m) => (
                      <div key={m.id} className={cn("flex", m.sender === "boutique" ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[75%] px-3 py-2 text-sm",
                            m.sender === "boutique"
                              ? "bg-yaa-green-500 text-white rounded-2xl rounded-br-md"
                              : "bg-background rounded-2xl rounded-bl-md border"
                          )}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          {m.text && <p className={cn("text-[10px] mt-1", m.sender === "boutique" ? "text-white/70" : "text-muted-foreground")}>{m.time}</p>}
                          {m.iaSuggestion && (
                            <div className="mt-2 p-2 bg-white/95 dark:bg-slate-900/95 border-2 border-yaa-orange-300 rounded-lg text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="h-3 w-3 text-yaa-orange-500" />
                                <span className="text-[10px] font-bold text-yaa-orange-600">Suggestion IA</span>
                              </div>
                              <p className="text-xs mb-2">{m.iaSuggestion}</p>
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 text-[10px] bg-yaa-green-500 hover:bg-yaa-green-600">Utiliser</Button>
                                <Button size="sm" variant="outline" className="h-6 text-[10px]">Modifier</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t bg-background flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Input placeholder="Tapez votre message..." className="flex-1" />
                    <Button size="icon" className="h-9 w-9 bg-yaa-green-500 hover:bg-yaa-green-600">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Catalogue */}
          <TabsContent value="catalogue" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {WHATSAPP_CATALOG.map((p, idx) => (
                <motion.div key={p.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-3 text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center text-3xl mb-2">{p.emoji}</div>
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-1">{p.category}</p>
                    <p className="text-sm font-bold text-yaa-green-600">{formatFCFA(p.price)}</p>
                    <span className={cn("inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1", p.stock <= 10 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" : "bg-muted text-muted-foreground")}>
                      Stock: {p.stock}
                    </span>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Auto replies */}
          <TabsContent value="auto" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUTO_REPLIES.map((a, idx) => (
                <motion.div key={a.trigger} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-yaa-orange-100 text-yaa-orange-600 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
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

          {/* Campagnes */}
          <TabsContent value="campagnes" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {WHATSAPP_CAMPAIGNS.map((c, idx) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{c.name}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", c.status === "Active" ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground")}>{c.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div><p className="text-[10px] text-muted-foreground">Envoyés</p><p className="text-sm font-bold">{c.sent}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Délivrés</p><p className="text-sm font-bold">{c.delivered}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Ouverts</p><p className="text-sm font-bold">{c.opened}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Cliqués</p><p className="text-sm font-bold">{c.clicked}</p></div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-[10px] text-muted-foreground">Revenu généré</p>
                      <p className="text-lg font-bold text-yaa-green-600">{formatFCFA(c.revenue)}</p>
                    </div>
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
