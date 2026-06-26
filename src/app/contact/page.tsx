"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MapPin, Mail, Phone, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { YaaLogo } from "@/components/landing/YaaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success("Message envoyé ! Nous vous répondons sous 24h.");
      form.reset();
    } catch {
      toast.error("Erreur. Réessayez ou contactez-nous par WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-yaa-green">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <YaaLogo size="md" />
          <Link href="/signup" className="text-sm font-semibold text-white bg-yaa-green-500 hover:bg-yaa-green-600 px-3 py-1.5 rounded-lg">
            Créer ma boutique
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
            Parlons de votre <span className="text-gradient-green">projet</span>
          </h1>
          <p className="text-base text-muted-foreground mt-3">
            Notre équipe vous accompagne dans le lancement de votre boutique e-commerce en Afrique.
            Réponse sous 24h ouvrées.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-premium p-6 sm:p-8">
              {sent ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto rounded-full bg-yaa-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-yaa-green-600" />
                  </div>
                  <h2 className="font-display font-bold text-xl mb-2">Message envoyé !</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Merci de nous avoir contactés. Notre équipe vous répondra sous 24h.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/">Retour à l'accueil</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name" className="text-xs font-semibold">Nom complet *</Label>
                      <Input id="name" placeholder="Moussa Diallo" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs font-semibold">Email *</Label>
                      <Input id="email" type="email" placeholder="moussa@boutique.ci" required className="mt-1" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone" className="text-xs font-semibold">WhatsApp</Label>
                      <Input id="phone" type="tel" placeholder="+225 07 12 34 56" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-xs font-semibold">Sujet *</Label>
                      <Select defaultValue="demo">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Demander une démo</SelectItem>
                          <SelectItem value="sales">Tarifs & abonnement</SelectItem>
                          <SelectItem value="support">Support technique</SelectItem>
                          <SelectItem value="partnership">Partenariat</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="boutique" className="text-xs font-semibold">Nom de votre boutique (optionnel)</Label>
                    <Input id="boutique" placeholder="Moussa Boutique" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre projet, vos besoins, vos questions..."
                      required
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  >
                    {loading ? "Envoi..." : (
                      <>
                        Envoyer le message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-soft p-5">
              <h3 className="font-display font-semibold mb-4">Nos canaux</h3>
              <div className="space-y-3">
                <a href="mailto:contact@yaa-commerce.com" className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-yaa-green-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-yaa-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold">contact@yaa-commerce.com</p>
                  </div>
                </a>

                <a href="https://wa.me/22507123456" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#1da851]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp Business</p>
                    <p className="text-sm font-semibold">+225 07 12 34 56</p>
                  </div>
                </a>

                <a href="tel:+22507000000" className="flex items-center gap-3 hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-yaa-orange-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-yaa-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-semibold">+225 07 00 00 00</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yaa-green-500 to-yaa-green-700 text-white rounded-2xl shadow-soft p-5">
              <MapPin className="w-5 h-5 mb-2" />
              <p className="font-semibold text-sm">Abidjan, Côte d'Ivoire</p>
              <p className="text-xs text-white/80 mt-1">
                Plateau, Boulevard Latrille<br />
                Imm. YAA Commerce, 4e étage
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yaa-green-600" />
                <p className="font-semibold text-sm">Horaires support</p>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Lun - Ven</span>
                  <span className="font-semibold text-foreground">8h - 20h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-semibold text-foreground">9h - 17h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-semibold text-foreground">Fermé</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
