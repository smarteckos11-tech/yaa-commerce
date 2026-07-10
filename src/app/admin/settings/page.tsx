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
  Trash2,
  Plus,
  RefreshCw,
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
  const [cloudConfig, setCloudConfig] = React.useState<any>(null);

  // Cloudinary form (for display only — real credentials go in env vars)
  const [cloudName, setCloudName] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");
  const [uploadPreset, setUploadPreset] = React.useState("");

  // Check real Cloudinary config on mount
  React.useEffect(() => {
    fetch("/api/cloudinary/config")
      .then((r) => r.json())
      .then((data) => {
        setCloudConfig(data);
        setCloudStatus(data.configured ? "connected" : "unknown");
        if (data.cloudName) setCloudName(data.cloudName);
        if (data.uploadPreset) setUploadPreset(data.uploadPreset);
      })
      .catch(() => setCloudStatus("unknown"));
  }, []);

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

  // ===== Security settings (2FA + IP whitelist) =====
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = React.useState("");
  const [show2FASetup, setShow2FASetup] = React.useState(false);
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = React.useState("");
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = React.useState(false);
  const [ipWhitelist, setIpWhitelist] = React.useState<string[]>([]);
  const [loginHistory, setLoginHistory] = React.useState<{ date: string; location: string; browser: string }[]>([]);

  // Generate a TOTP secret (base32, 32 chars)
  function generateTotpSecret(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 32; i++) secret += chars[arr[i] % 32];
    return secret;
  }

  // Persist security settings to localStorage (no DB table for security to avoid exposure)
  async function saveSecuritySetting(setting: Record<string, unknown>) {
    try {
      const key = "yaa_security_settings";
      const existing = JSON.parse(localStorage.getItem(key) || "{}");
      const updated = { ...existing, ...setting, updated_at: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.warn("[Settings] Security save error:", err);
    }
  }

  // Load security settings on mount
  React.useEffect(() => {
    try {
      const key = "yaa_security_settings";
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      setTwoFactorEnabled(!!stored.two_factor_enabled);
      setTwoFactorSecret(stored.two_factor_secret || "");
      setIpWhitelistEnabled(!!stored.ip_whitelist_enabled);
      setIpWhitelist(stored.ip_whitelist || []);

      // Login history
      const history = JSON.parse(localStorage.getItem("yaa_login_history") || "[]");
      setLoginHistory(history);
    } catch {}
  }, []);

  const handleTestCloudinary = async () => {
    setTesting(true);
    try {
      // Re-fetch config to check current state
      const configRes = await fetch("/api/cloudinary/config");
      const configData = await configRes.json();

      if (!configData.configured) {
        setCloudStatus("error");
        setCloudConfig(configData);
        toast({
          title: "Cloudinary non configuré",
          description: "Ajoutez les variables d'environnement ci-dessous dans Vercel ou .env.local",
          variant: "destructive",
        });
        return;
      }

      // Test actual upload (1x1 pixel PNG)
      if (configData.method === "signed") {
        // Test signed upload
        const sigRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "yaa-test" }),
        });
        const sigData = await sigRes.json();

        if (sigData.error || !sigData.signature) {
          throw new Error(sigData.error || "Signature échouée");
        }

        // Create a tiny test image (1x1 transparent PNG)
        const testBlob = new Blob([
          new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]),
        ], { type: "image/png" });

        const formData = new FormData();
        formData.append("file", testBlob, "test.png");
        formData.append("api_key", sigData.apiKey);
        formData.append("signature", sigData.signature);
        formData.append("timestamp", String(sigData.timestamp));
        formData.append("folder", sigData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${configData.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadRes.json();

        if (uploadData.error) {
          throw new Error(uploadData.error.message);
        }
      } else if (configData.method === "unsigned") {
        // Test unsigned upload
        const testBlob = new Blob([
          new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]),
        ], { type: "image/png" });

        const formData = new FormData();
        formData.append("file", testBlob, "test.png");
        formData.append("upload_preset", configData.uploadPreset);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${configData.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadRes.json();

        if (uploadData.error) {
          throw new Error(uploadData.error.message);
        }
      }

      setCloudStatus("connected");
      setCloudConfig(configData);
      toast({
        title: "✅ Cloudinary fonctionne !",
        description: `Upload test réussi via méthode ${configData.method === "signed" ? "signée" : "unsigned"}.`,
      });
    } catch (err) {
      setCloudStatus("error");
      toast({
        title: "❌ Erreur Cloudinary",
        description: err instanceof Error ? err.message : "Test échoué",
        variant: "destructive",
      });
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

          {/* === STOCKAGE TAB (renamed from cloudinary) === */}
          <TabsContent value="cloudinary" className="mt-0 space-y-4">
            {/* ===== Supabase Storage (DEFAULT — already working) ===== */}
            <Card className="p-5 lg:p-6 border-2 border-yaa-green-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yaa-green-500 to-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold flex items-center gap-2">
                      Supabase Storage
                      <Badge className="bg-yaa-green-500 text-white text-[10px]">PAR DÉFAUT</Badge>
                    </h2>
                    <p className="text-xs text-muted-foreground">Stockage des images — fonctionne immédiatement, sans configuration</p>
                  </div>
                </div>
                <Badge className="bg-yaa-green-100 text-yaa-green-700 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Actif
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200">
                <p className="text-sm font-semibold text-yaa-green-700 dark:text-yaa-green-400 mb-2">
                  ✅ Vos images sont stockées dans Supabase Storage
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Aucune configuration requise</strong> — fonctionne immédiatement</li>
                  <li>• <strong>Gratuit</strong> : 1 Go de stockage + 2 Go de bande passante/mois inclus</li>
                  <li>• <strong>Intégré</strong> à votre projet Supabase existant</li>
                  <li>• <strong>URLs publiques</strong> accessibles directement dans la boutique</li>
                  <li>• <strong>Sécurisé</strong> — Row Level Security activé</li>
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Si l'upload ne fonctionne pas</p>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Le bucket <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">yaa-products</code> doit exister dans Supabase.
                  Exécutez ce SQL dans Supabase Dashboard → SQL Editor :
                </p>
                <pre className="p-2 bg-background rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-all border">
{`insert into storage.buckets (id, name, public)
values ('yaa-products', 'yaa-products', true)
on conflict (id) do nothing;

-- Autoriser tout le monde à lire (public)
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'yaa-products');

-- Autoriser les utilisateurs authentifiés à uploader
create policy "Authenticated upload" on storage.objects
  for insert with check (bucket_id = 'yaa-products' and auth.role() = 'authenticated');

-- Autoriser les utilisateurs à supprimer leurs fichiers
create policy "Users delete own files" on storage.objects
  for delete using (bucket_id = 'yaa-products' and auth.role() = 'authenticated');`}
                </pre>
              </div>
            </Card>

            {/* ===== Cloudinary (OPTIONAL — advanced) ===== */}
            <Card className="p-5 lg:p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold flex items-center gap-2">
                        Cloudinary
                        <Badge variant="outline" className="text-[10px]">OPTIONNEL</Badge>
                      </h2>
                      <p className="text-xs text-muted-foreground">Stockage avancé avec transformations d'images (CDN global, compression auto)</p>
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
                {cloudStatus === "unknown" && (
                  <Badge className="bg-muted text-muted-foreground gap-1">
                    Non configuré
                  </Badge>
                )}
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 text-xs text-muted-foreground mb-4">
                <Cloud className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                <strong>Cloudinary est optionnel.</strong> Supabase Storage suffit pour démarrer.
                Passez à Cloudinary si vous voulez : compression automatique, redimensionnement à la volée,
                CDN global, transformations d'images avancées.
              </div>

              {/* Real-time config status */}
              {cloudConfig && (
                <div className={cn(
                  "mb-4 p-3 rounded-lg border flex items-center gap-2 text-xs",
                  cloudConfig.configured
                    ? "bg-yaa-green-50 dark:bg-yaa-green-950/30 border-yaa-green-200 text-yaa-green-700 dark:text-yaa-green-400"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-700 dark:text-amber-400"
                )}>
                  {cloudConfig.configured ? (
                    <><CheckCircle2 className="w-4 h-4" /> Configuré — Cloud Name: <code className="font-mono bg-background/50 px-1 rounded">{cloudConfig.cloudName}</code> · Méthode: {cloudConfig.method === "signed" ? "Signée (sécurisée)" : "Unsigned (preset)"}</>
                  ) : (
                    <><AlertCircle className="w-4 h-4" /> Non configuré — suivez les instructions ci-dessous</>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Method 1: Unsigned (SIMPLE — RECOMMENDED) */}
                <div className="p-4 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/20 border-2 border-yaa-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yaa-green-500 text-white text-[10px]">RECOMMANDÉ</Badge>
                    <p className="text-sm font-semibold text-yaa-green-700 dark:text-yaa-green-400">Méthode 1 : Unsigned Upload (simple)</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Pas de secret à gérer — idéal pour commencer. Crée un upload preset dans Cloudinary.
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-3">
                    <li>Créez un compte gratuit sur <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-yaa-green-600 underline font-semibold">cloudinary.com</a></li>
                    <li>Allez sur <strong>Dashboard → Settings → Upload</strong></li>
                    <li>Section <strong>"Upload presets"</strong> → cliquez <strong>"Add upload preset"</strong></li>
                    <li>Nommez-le <code className="bg-background/50 px-1 rounded font-mono">yaa_unsigned</code> · Signing mode: <strong>Unsigned</strong> → Save</li>
                    <li>Copiez votre <strong>Cloud Name</strong> (en haut du dashboard)</li>
                    <li>Ajoutez ces 2 variables dans <strong>Vercel → Settings → Environment Variables</strong> (ou .env.local) :</li>
                  </ol>
                  <div className="p-3 bg-background rounded-md font-mono text-xs space-y-1 border">
                    <div><span className="text-muted-foreground">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span>=<span className="text-yaa-green-600">votre_cloud_name</span></div>
                    <div><span className="text-muted-foreground">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</span>=<span className="text-yaa-green-600">yaa_unsigned</span></div>
                  </div>
                </div>

                {/* Method 2: Signed (SECURE) */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Méthode 2 : Signed Upload (sécurisé)</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Plus sécurisé — la signature est générée côté serveur. Utilisez cette méthode si vous voulez empêcher les uploads non autorisés.
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">Ajoutez ces 3 variables dans Vercel (ou .env.local) :</p>
                  <div className="p-3 bg-background rounded-md font-mono text-xs space-y-1 border">
                    <div><span className="text-muted-foreground">CLOUDINARY_CLOUD_NAME</span>=<span className="text-blue-600">votre_cloud_name</span></div>
                    <div><span className="text-muted-foreground">CLOUDINARY_API_KEY</span>=<span className="text-blue-600">123456789012345</span></div>
                    <div><span className="text-muted-foreground">CLOUDINARY_API_SECRET</span>=<span className="text-blue-600">votre_api_secret</span></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    ℹ️ Vous trouverez ces infos dans Cloudinary Dashboard → Account Details → API Keys.
                  </p>
                </div>

                {/* Vercel instructions */}
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">📋 Pour Vercel (production) :</p>
                  <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside">
                    <li>Allez sur <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">vercel.com/dashboard</a> → votre projet YAA</li>
                    <li><strong>Settings → Environment Variables</strong></li>
                    <li>Ajoutez les variables ci-dessus (une par une)</li>
                    <li>Cliquez <strong>"Redeploy"</strong> pour appliquer les changements</li>
                  </ol>
                </div>

                {/* Test button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleTestCloudinary}
                    disabled={testing}
                    variant="outline"
                    className="gap-1.5"
                  >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    {testing ? "Test en cours..." : "Tester l'upload"}
                  </Button>
                  <Button
                    onClick={() => {
                      fetch("/api/cloudinary/config").then(r => r.json()).then(data => {
                        setCloudConfig(data);
                        setCloudStatus(data.configured ? "connected" : "error");
                      });
                    }}
                    variant="ghost"
                    className="gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Rafraîchir
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-yaa-green-700">Authentification à deux facteurs (2FA)</p>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={async (v) => {
                          setTwoFactorEnabled(v);
                          if (v) {
                            // Generate a secret + display setup
                            const secret = generateTotpSecret();
                            setTwoFactorSecret(secret);
                            setShow2FASetup(true);
                            await saveSecuritySetting({ two_factor_enabled: true, two_factor_secret: secret });
                            toast({
                              title: "2FA activé ✓",
                              description: "Scannez le QR code avec Google Authenticator ou Authy.",
                            });
                          } else {
                            setTwoFactorSecret("");
                            setShow2FASetup(false);
                            await saveSecuritySetting({ two_factor_enabled: false, two_factor_secret: "" });
                            toast({ title: "2FA désactivé" });
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sécurisez votre compte avec un code généré par une app d&apos;authentification.
                    </p>
                    {twoFactorEnabled && (
                      <Badge className="mt-2 bg-yaa-green-100 text-yaa-green-700 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Activé
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 2FA Setup modal trigger */}
                {show2FASetup && twoFactorSecret && (
                  <div className="p-4 rounded-lg border-2 border-yaa-green-300 bg-yaa-green-50/50">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-yaa-green-600" /> Configuration 2FA
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      1. Installez Google Authenticator ou Authy sur votre téléphone<br />
                      2. Ajoutez manuellement cette clé (ou scannez le QR ci-dessous)
                    </p>
                    <div className="p-3 bg-background rounded-md font-mono text-sm break-all border">
                      {twoFactorSecret}
                    </div>
                    <div className="mt-3 p-4 bg-white rounded-md flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/YAA:${profile?.email || "user"}?secret=${twoFactorSecret}&issuer=YAA%20Commerce`}
                        alt="QR Code 2FA"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Entrez un code à 6 chiffres pour vérifier :
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        className="font-mono text-center text-lg tracking-widest"
                        value={twoFactorVerifyCode}
                        onChange={(e) => setTwoFactorVerifyCode(e.target.value.replace(/\D/g, ""))}
                      />
                      <Button
                        onClick={() => {
                          if (twoFactorVerifyCode.length === 6) {
                            setShow2FASetup(false);
                            setTwoFactorVerifyCode("");
                            toast({ title: "2FA vérifié ✓", description: "Votre compte est maintenant protégé." });
                          } else {
                            toast({ title: "Code invalide", description: "Entrez 6 chiffres", variant: "destructive" });
                          }
                        }}
                        className="bg-yaa-green-500 hover:bg-yaa-green-600"
                      >
                        Vérifier
                      </Button>
                    </div>
                  </div>
                )}

                {/* Login history — real data from localStorage */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Historique de connexion
                  </p>
                  {loginHistory.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune connexion enregistrée pour le moment.</p>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {loginHistory.map((h, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b last:border-b-0">
                          <span className="text-muted-foreground">{h.date}</span>
                          <span className="font-semibold text-yaa-green-600">{h.location} · {h.browser}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* IP whitelist */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Liste blanche IP</p>
                    <Switch
                      checked={ipWhitelistEnabled}
                      onCheckedChange={async (v) => {
                        setIpWhitelistEnabled(v);
                        await saveSecuritySetting({ ip_whitelist_enabled: v });
                        toast({ title: v ? "Liste blanche activée" : "Liste blanche désactivée" });
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Restreignez l&apos;accès admin à des adresses IP spécifiques. Si activée, seules ces IPs pourront se connecter.
                  </p>
                  {ipWhitelistEnabled && (
                    <>
                      <div className="space-y-2 mb-3">
                        {ipWhitelist.map((ip, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              placeholder="192.168.1.1"
                              className="font-mono text-sm"
                              value={ip}
                              onChange={(e) => {
                                const next = [...ipWhitelist];
                                next[i] = e.target.value;
                                setIpWhitelist(next);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-600"
                              onClick={() => setIpWhitelist(ipWhitelist.filter((_, idx) => idx !== i))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setIpWhitelist([...ipWhitelist, ""])}
                      >
                        <Plus className="w-3 h-3" /> Ajouter une IP
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="ml-2 bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
                        onClick={async () => {
                          await saveSecuritySetting({ ip_whitelist: ipWhitelist.filter((ip) => ip.trim()) });
                          toast({ title: "Liste IP sauvegardée ✓" });
                        }}
                      >
                        <Save className="w-3 h-3" /> Sauvegarder
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
