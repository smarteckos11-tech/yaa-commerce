"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Store, Clock, CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui-bits";
import { formatFCFA } from "@/lib/admin-data";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  boutique_name: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

const SUBJECT_LABELS: Record<string, string> = {
  demo: "Demander une démo",
  sales: "Tarifs & abonnement",
  support: "Support technique",
  partnership: "Partenariat",
  other: "Autre",
};

export default function MessagesPage() {
  const [messages, setMessages] = React.useState<ContactMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Messages de contact"
        subtitle={`${messages.length} messages reçus · ${unreadCount} non lus`}
        actions={
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Rafraîchir
          </Button>
        }
      />

      {loading ? (
        <Card className="p-12 text-center">
          <div className="animate-pulse">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Chargement des messages...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-rose-600 mb-2">⚠️ {error}</p>
          <p className="text-xs text-muted-foreground">
            Vérifiez que Supabase est configuré (variables d'environnement + schéma SQL exécuté).
          </p>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">Aucun message pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">
            Les messages envoyés via le formulaire /contact apparaîtront ici.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className={`p-4 lg:p-5 ${!msg.is_read ? "border-l-4 border-l-yaa-green-500" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      msg.is_read ? "bg-muted text-muted-foreground" : "bg-yaa-green-100 text-yaa-green-700"
                    }`}>
                      {msg.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        {msg.name}
                        {!msg.is_read && (
                          <span className="w-2 h-2 rounded-full bg-yaa-green-500" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {msg.subject && (
                      <Badge variant="outline" className="mb-1">
                        {SUBJECT_LABELS[msg.subject] || msg.subject}
                      </Badge>
                    )}
                    <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(msg.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-line">
                  {msg.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                  {msg.phone && (
                    <a
                      href={`tel:${msg.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-3 h-3" />
                      {msg.phone}
                    </a>
                  )}
                  {msg.boutique_name && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Store className="w-3 h-3" />
                      {msg.boutique_name}
                    </span>
                  )}
                  <div className="ml-auto flex gap-1.5">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Contact YAA"}`}>
                        <Mail className="w-3 h-3" /> Répondre
                      </a>
                    </Button>
                    {msg.phone && (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <a href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                          WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
