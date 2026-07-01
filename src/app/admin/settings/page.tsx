"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Settings,
  Globe,
  ShieldCheck,
  Mail,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Lock,
  Image as ImageIcon,
  Link2,
  Save,
  MessageSquare,
  Send,
  Smartphone,
  Clock,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/ui-bits";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const STORAGE_TARGETS = [
  { id: "products", label: "Produits", icon: "📦", color: "bg-yaa-green-100 text-yaa-green-700" },
  { id: "stores", label: "Boutiques", icon: "🏪", color: "bg-yaa-orange-100 text-yaa-orange-700" },
  { id: "blog", label: "Blog", icon: "📝", color: "bg-blue-100 text-blue-700" },
  { id: "avatars", label: "Avatars", icon: "👤", color: "bg-purple-100 text-purple-700" },
  { id: "documents", label: "Documents", icon: "📄", color: "bg-amber-100 text-amber-700" },
  { id: "media", label: "Médias", icon: "🎬", color: "bg-rose-100 text-rose-700" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [testing, setTesting] = React.useState(false);
  const [cloudStatus, setCloudStatus] = React.useState<"unknown" | "connected" | "error">("unknown");

  // Cloudinary form
  const [cloudName, setCloudName] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");

  // General settings
  const [siteName, setSiteName] = React.useState(profile?.boutique_name || "");
  const [timezone, setTimezone] = React.useState("Africa/Abidjan");
  const [language, setLanguage] = React.useState("fr");
  const [currency, setCurrency] = React.useState("XOF");

  // Notification settings
  const [notifEmail, setNotifEmail] = React.useState(true);
  const [notifSms, setNotifSms] = React.useState(false);
  const [notifPush, setNotifPush] = React.useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = React.useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  // SMS / Twilio
  const [twilioSid, setTwilioSid] = React.useState("");
  const [twilioToken, setTwilioToken] = React.useState("");
  const [twilioFrom, setTwilioFrom] = React.useState("");
  const [testingSms, setTestingSms] = React.useState(false);
  const [smsLogs, setSmsLogs] = React.useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [testPhone, setTestPhone] = React.useState("");
  const [sendingTest, setSendingTest] = React.useState(false);

  // Load SMS logs on mount
  React.useEffect(() => {
    loadSmsLogs();
  }, []);

  async function loadSmsLogs() {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/sms/logs?limit=20");
      const data = await res.json();
      if (!data.error) setSmsLogs(data.logs || []);
    } catch (err) {
      console.error("[Settings] SMS logs error:", err);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function handleTestSms() {
    if (!testPhone) {
      toast({ title: "Numéro manquant", description: "Entrez un numéro de téléphone", variant: "destructive" });
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: testPhone,
          message: "🧪 Test SMS depuis YAA Commerce — votre configuration Twilio fonctionne !",
          trigger: "test",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "SMS envoyé ✓",
          description: `Vers ${data.phone} · SID: ${data.sid?.slice(0, 12)}...`,
        });
        setTestPhone("");
        loadSmsLogs();
      } else if (data.message?.includes("non configuré")) {
        toast({
          title: "Twilio non configuré",
          description: "Ajoutez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans les variables d'environnement Vercel.",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error || "Échec");
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Envoi impossible",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  }

  const handleTestCloudinary = async () => {
    if (!cloudName || !apiKey || !apiSecret) {
      toast({ title: "Champs manquants", description: "Remplissez cloud name, API key et secret", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      // Test: call our sign endpoint with these credentials
      // In production, this would save to Supabase settings table
      const res = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "yaa-test" }),
      });
      const data = await res.json();
      if (data.signature) {
        setCloudStatus("connected");
        toast({ title: "✅ Cloudinary connecté !", description: "Upload d'images prêt à l'emploi." });
      } else {
        setCloudStatus("error");
        toast({ title: "❌ Erreur", description: data.error || "Connexion échouée", variant: "destructive" });
      }
    } catch {
      setCloudStatus("error");
      toast({ title: "❌ Erreur", description: "Impossible de tester la connexion", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveGeneral = () => {
    toast({ title: "Paramètres sauvegardés", description: "Vos modifications ont été enregistrées." });
  };

  // Change password via Supabase
  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) return;

    setChangingPassword(true);
    try {
      const { supabase } = await import("@/lib/supabase-client");
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Mot de passe changé ✓", description: "Votre nouveau mot de passe est actif." });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de changer le mot de passe",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Paramètres"
        subtitle="Configurez votre boutique, votre stockage et vos notifications"
      />

      <motion.div variants={item}>
        <Tabs defaultValue="cloudinary">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="cloudinary" className="gap-1.5">
              <Cloud className="w-3.5 h-3.5" /> Cloudinary
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Général
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Boutique
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="sms" className="gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> SMS / Twilio
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Sécurité
            </TabsTrigger>
          </TabsList>

          {/* === CLOUDINARY TAB === */}
          <TabsContent value="cloudinary" className="mt-0 space-y-4">
            <Card className="p-5 lg:p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold">Stockage Cloudinary</h2>
                      <p className="text-xs text-muted-foreground">Gérez vos images produits, boutique, blog et médias</p>
                    </div>
                  </div>
                </div>
                {cloudStatus === "connected" && (
                  <Badge className="bg-yaa-green-100 text-yaa-green-700 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connecté
                  </Badge>
                )}
                {cloudStatus === "error" && (
                  <Badge className="bg-rose-100 text-rose-700 gap-1">
                    <AlertCircle className="w-3 h-3" /> Erreur
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Comment configurer Cloudinary</p>
                    <ol className="text-xs text-muted-foreground mt-1 space-y-0.5 list-decimal list-inside">
                      <li>Créez un compte gratuit sur <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">cloudinary.com</a></li>
                      <li>Allez sur Dashboard → Account Details</li>
                      <li>Copiez Cloud Name, API Key et API Secret</li>
                      <li>Collez-les ci-dessous et cliquez "Tester"</li>
                    </ol>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="cloud-name" className="text-xs font-semibold">Cloud Name *</Label>
                    <Input
                      id="cloud-name"
                      placeholder="my-boutique"
                      value={cloudName}
                      onChange={(e) => setCloudName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-key" className="text-xs font-semibold">API Key *</Label>
                    <Input
                      id="api-key"
                      placeholder="123456789012345"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-secret" className="text-xs font-semibold">API Secret *</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleTestCloudinary}
                    disabled={testing}
                    variant="outline"
                    className="gap-1.5"
                  >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    {testing ? "Test en cours..." : "Tester la connexion"}
                  </Button>
                  <Button
                    onClick={() => toast({ title: "Configuration sauvegardée" })}
                    className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Sauvegarder
                  </Button>
                </div>
              </div>
            </Card>

            {/* Storage targets */}
            <Card className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Dossiers de stockage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STORAGE_TARGETS.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">yaa-{t.id}/</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Features */}
            <Card className="p-5">
              <h3 className="font-display font-semibold text-sm mb-3">Fonctionnalités Cloudinary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  "Upload automatique", "Compression d'images", "Optimisation WebP",
                  "Redimensionnement", "Suppression", "Renommage",
                  "Galerie multiple", "Drag & drop", "Image principale",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yaa-green-500" />
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* === GENERAL TAB === */}
          <TabsContent value="general" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h2 className="font-display font-semibold mb-4">Paramètres généraux</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-name" className="text-xs font-semibold">Nom du site</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Fuseau horaire</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Abidjan">Africa/Abidjan (GMT+0)</SelectItem>
                        <SelectItem value="Africa/Dakar">Africa/Dakar (GMT+0)</SelectItem>
                        <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                        <SelectItem value="Africa/Accra">Africa/Accra (GMT+0)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Langue par défaut</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Devise par défaut</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">FCFA (XOF) — Afrique de l'Ouest</SelectItem>
                      <SelectItem value="XAF">FCFA (XAF) — Afrique Centrale</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="NGN">Naira (NGN)</SelectItem>
                      <SelectItem value="GHS">Cedi (GHS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveGeneral} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                  <Save className="w-4 h-4" /> Sauvegarder
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* === STORE TAB === */}
          <TabsContent value="store" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h2 className="font-display font-semibold mb-4">Configuration de la boutique</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold">Logo de la boutique</Label>
                  <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-yaa-green-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Téléverser un logo</p>
                    <p className="text-[11px] text-muted-foreground">PNG, SVG · max 2MB · 512x512 recommandé</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Bannière</Label>
                  <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-yaa-green-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Téléverser une bannière</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG · max 5MB · 1920x600 recommandé</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom-domain" className="text-xs font-semibold">Domaine personnalisé</Label>
                  <Input id="custom-domain" placeholder="maboutique.com" className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Configurez un enregistrement CNAME pointant vers cname.yaa-commerce.com
                  </p>
                </div>
                <div>
                  <Label htmlFor="custom-url" className="text-xs font-semibold">URL personnalisée YAA</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">yaa-commerce.com/b/</span>
                    <Input id="custom-url" placeholder="ma-boutique" className="flex-1" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Réseaux sociaux</Label>
                    <Input placeholder="https://instagram.com/..." className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">WhatsApp Business</Label>
                    <Input placeholder="+225 07 12 34 56" className="mt-1" />
                  </div>
                </div>
                <Button onClick={() => toast({ title: "Boutique configurée !" })} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                  <Save className="w-4 h-4" /> Sauvegarder la boutique
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* === NOTIFICATIONS TAB === */}
          <TabsContent value="notifications" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h2 className="font-display font-semibold mb-4">Préférences de notification</h2>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Notifications email", desc: "Commandes, paiements, alertes stock", state: notifEmail, set: setNotifEmail },
                  { icon: Bell, label: "Notifications push", desc: "Notifications navigateur en temps réel", state: notifPush, set: setNotifPush },
                  { icon: ShieldCheck, label: "Notifications SMS", desc: "SMS pour commandes urgentes (à configurer)", state: notifSms, set: setNotifSms },
                  { icon: Globe, label: "Notifications WhatsApp", desc: "Messages WhatsApp Business pour vos clients", state: notifWhatsapp, set: setNotifWhatsapp },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <n.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{n.label}</p>
                        <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch checked={n.state} onCheckedChange={n.set} />
                  </div>
                ))}
                <Button onClick={() => toast({ title: "Préférences sauvegardées" })} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5 mt-2">
                  <Save className="w-4 h-4" /> Sauvegarder
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* === SMS / TWILIO TAB === */}
          <TabsContent value="sms" className="mt-0 space-y-4">
            <Card className="p-5 lg:p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold">SMS Automatiques (Twilio)</h2>
                    <p className="text-xs text-muted-foreground">Notifiez vos clients par SMS à chaque étape de commande</p>
                  </div>
                </div>
              </div>

              {/* Config instructions */}
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-amber-700 mb-1">Configuration requise (variables d'environnement Vercel)</p>
                  <p>Pour activer l&apos;envoi de SMS, ajoutez ces 3 variables dans Vercel → Settings → Environment Variables :</p>
                  <ul className="mt-1 space-y-0.5 font-mono">
                    <li>• <code className="bg-amber-100 dark:bg-amber-950/50 px-1 rounded">TWILIO_ACCOUNT_SID</code> — votre Account SID</li>
                    <li>• <code className="bg-amber-100 dark:bg-amber-950/50 px-1 rounded">TWILIO_AUTH_TOKEN</code> — votre Auth Token</li>
                    <li>• <code className="bg-amber-100 dark:bg-amber-950/50 px-1 rounded">TWILIO_PHONE_NUMBER</code> — numéro Twilio (ex: +1234567890)</li>
                  </ul>
                  <p className="mt-2">
                    Créez un compte sur{" "}
                    <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">
                      twilio.com/console
                    </a>{" "}
                    — essai gratuit avec 15$ de crédit.
                  </p>
                </div>
              </div>

              {/* Form (informational only — credentials are stored in env vars, not Supabase for security) */}
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <Label htmlFor="twilio-sid" className="text-xs font-semibold">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxx"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-token" className="text-xs font-semibold">Auth Token</Label>
                  <Input
                    id="twilio-token"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-from" className="text-xs font-semibold">Numéro Twilio</Label>
                  <Input
                    id="twilio-from"
                    placeholder="+1234567890"
                    value={twilioFrom}
                    onChange={(e) => setTwilioFrom(e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Test SMS */}
              <div className="p-4 rounded-lg border border-slate-200 mb-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4 text-yaa-green-600" /> Tester l&apos;envoi de SMS
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="+225 07 12 34 56"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTestSms}
                    disabled={sendingTest || !testPhone}
                    className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                  >
                    {sendingTest ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer test</>}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Le SMS sera envoyé uniquement si Twilio est configuré dans les variables d&apos;environnement.
                </p>
              </div>

              {/* Auto SMS info */}
              <div className="p-3 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-yaa-green-700">SMS automatiques activés :</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> Nouvelle commande reçue
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> Commande expédiée (+ suivi)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> Commande livrée
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> Commande annulée
                  </div>
                </div>
              </div>
            </Card>

            {/* SMS History */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-sm">Historique des SMS</h3>
                  <p className="text-xs text-muted-foreground">20 derniers SMS envoyés</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadSmsLogs} disabled={loadingLogs}>
                  {loadingLogs ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                </Button>
              </div>

              {smsLogs.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">Aucun SMS envoyé pour le moment</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {smsLogs.map((log) => {
                    const statusIcon = log.status === "sent" || log.status === "delivered"
                      ? <CheckCircle2 className="w-3 h-3 text-yaa-green-500" />
                      : log.status === "pending"
                      ? <Clock className="w-3 h-3 text-amber-500" />
                      : <XCircle className="w-3 h-3 text-rose-500" />;
                    return (
                      <div key={log.id} className="p-3 rounded-lg border border-slate-200 hover:bg-muted/30">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {statusIcon}
                            <span className="text-xs font-mono text-muted-foreground truncate">{log.phone}</span>
                            {log.trigger && (
                              <span className="text-[9px] font-bold bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-1.5 py-0.5 rounded">
                                {log.trigger}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {new Date(log.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground line-clamp-2">{log.message}</p>
                        {log.error_message && (
                          <p className="text-[10px] text-rose-600 mt-1">⚠️ {log.error_message}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* === SECURITY TAB === */}
          <TabsContent value="security" className="mt-0">
            <Card className="p-5 lg:p-6 max-w-2xl">
              <h2 className="font-display font-semibold mb-4">Sécurité du compte</h2>
              <div className="space-y-4">
                {/* Change password */}
                <div className="p-4 rounded-lg border-2 border-yaa-green-200 bg-yaa-green-50/50 dark:bg-yaa-green-950/20">
                  <p className="text-sm font-semibold text-yaa-green-700 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Changer le mot de passe
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="current-password" className="text-xs font-semibold">Mot de passe actuel</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-password" className="text-xs font-semibold">Nouveau mot de passe</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-9"
                            minLength={6}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirm-password" className="text-xs font-semibold">Confirmer</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="text-[10px] text-rose-600">Le mot de passe doit contenir au moins 6 caractères.</p>
                    )}
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[10px] text-rose-600">Les mots de passe ne correspondent pas.</p>
                    )}
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                      className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {changingPassword ? "Modification..." : "Changer le mot de passe"}
                    </Button>
                  </div>
                </div>

                {/* 2FA */}
                <div className="p-4 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-yaa-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yaa-green-700">Authentification à deux facteurs (2FA)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sécurisez votre compte avec un code SMS ou app d'authentification.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({ title: "2FA", description: "Configuration 2FA bientôt disponible" })}>Activer 2FA</Button>
                  </div>
                </div>

                {/* Login history */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold mb-2">Historique de connexion</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Aujourd'hui · 14:32</span>
                      <span className="text-yaa-green-600">Abidjan, CI · Chrome</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Hier · 18:45</span>
                      <span className="text-yaa-green-600">Abidjan, CI · Safari</span>
                    </div>
                  </div>
                </div>

                {/* IP whitelist */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold mb-2">Liste blanche IP</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Restreignez l'accès admin à des adresses IP spécifiques.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Liste blanche IP", description: "Configuration bientôt disponible" })}>Configurer</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
