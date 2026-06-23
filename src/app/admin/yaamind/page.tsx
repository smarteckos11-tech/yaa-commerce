"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Copy, RefreshCw, Check } from "lucide-react";
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
import { YAAMIND_MODELS, YAAMIND_QUICK_ACTIONS, YAAMIND_CHAT } from "@/lib/admin-data";
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

// Parse **bold** markdown
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
  const [copied, setCopied] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="IA YaaMind"
        subtitle="Votre assistant IA pour piloter votre boutique"
        actions={
          <Select defaultValue="gpt-4o">
            <SelectTrigger className="w-48 gap-2">
              <Sparkles className="h-3.5 w-3.5 text-yaa-orange-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YAAMIND_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Quick actions */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {YAAMIND_QUICK_ACTIONS.map((a) => {
          const col = ACTION_COLORS[a.color];
          return (
            <Card key={a.label} className="p-3 hover:shadow-md transition-shadow cursor-pointer group">
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
            {YAAMIND_CHAT.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.sender === "user" ? "justify-end" : "justify-start")}>
                {m.sender === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={cn("max-w-[75%]", !m.text && "hidden")}>
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
                  {m.sender === "assistant" && m.text && (
                    <div className="flex items-center gap-1 mt-1 ml-1">
                      <button onClick={() => copyText(m.text, m.id)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                        {copied === m.id ? <><Check className="h-3 w-3" /> Copié</> : <><Copy className="h-3 w-3" /> Copier</>}
                      </button>
                      <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                        <RefreshCw className="h-3 w-3" /> Régénérer
                      </button>
                    </div>
                  )}
                  {m.iaSuggestion && (
                    <div className="mt-2 p-2.5 border-2 border-yaa-orange-300 dark:border-yaa-orange-700 rounded-lg bg-yaa-orange-50/50 dark:bg-yaa-orange-950/20">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3 text-yaa-orange-500" />
                        <span className="text-[10px] font-bold text-yaa-orange-600">Suggestion IA</span>
                      </div>
                      <p className="text-xs mb-2">{m.iaSuggestion}</p>
                      <div className="flex gap-1">
                        <Button size="sm" className="h-6 text-[10px] bg-yaa-green-500 hover:bg-yaa-green-600">Appliquer</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]">Modifier</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-background flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9"><Copy className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
            <Input placeholder="Posez votre question à YaaMind..." className="flex-1" />
            <Button size="icon" className="h-9 w-9 bg-yaa-orange-500 hover:bg-yaa-orange-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
