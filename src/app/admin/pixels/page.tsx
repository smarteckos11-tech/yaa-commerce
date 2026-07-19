"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Save,
  Facebook,
  Music2,
  Search,
  Ghost,
  Twitter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PIXEL_INFO = [
  {
    key: "meta_pixel_id",
    label: "Meta Pixel (Facebook + Instagram)",
    icon: Facebook,
    color: "bg-blue-500",
    placeholder: "1234567890123456",
    helpUrl: "https://www.facebook.com/business/help/952192354843755",
    helpText: "Facebook → Events Manager → Data Sources → Pixel → ID",
  },
  {
    key: "tiktok_pixel_id",
    label: "TikTok Pixel",
    icon: Music2,
    color: "bg-black",
    placeholder: "C8XXXXXXXXXXXXXXXXXX",
    helpUrl: "https://ads.tiktok.com/i18n/events_manager",
    helpText: "TikTok Ads → Assets → Events → Pixel → ID",
  },
  {
    key: "google_ads_id",
    label: "Google Ads (Conversion ID)",
    icon: Search,
    color: "bg-red-500",
    placeholder: "AW-123456789",
    helpUrl: "https://ads.google.com",
    helpText: "Google Ads → Tools → Conversions → Setup tag → ID",
  },
  {
    key: "snapchat_pixel_id",
    label: "Snapchat Pixel",
    icon: Ghost,
    color: "bg-yellow-400",
    placeholder: "xxxxxxxx-xxxx-xxxx",
    helpUrl: "https://business.snapchat.com",
    helpText: "Snapchat Ads Manager → Events Manager → Pixel ID",
  },
  {
    key: "twitter_pixel_id",
    label: "X (Twitter) Pixel",
    icon: Twitter,
    color: "bg-slate-900",
    placeholder: "abcde",
    helpUrl: "https://ads.twitter.com",
    helpText: "X Ads → Tools → Conversion tracking → Pixel ID",
  },
];

export default function PixelsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [pixels, setPixels] = React.useState<Record<string, any>>({
    meta_pixel_id: "",
    tiktok_pixel_id: "",
    google_ads_id: "",
    snapchat_pixel_id: "",
    twitter_pixel_id: "",
    tracking_enabled: true,
  });

  React.useEffect(() => {
    if (!user) return;
    loadPixels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadPixels() {
    if (!user) return;
    try {
      const res = await fetch(`/api/pixels?userId=${user.id}`);
      const data = await res.json();
      if (data.pixels) {
        setPixels({
          meta_pixel_id: data.pixels.meta_pixel_id || "",
          tiktok_pixel_id: data.pixels.tiktok_pixel_id || "",
          google_ads_id: data.pixels.google_ads_id || "",
          snapchat_pixel_id: data.pixels.snapchat_pixel_id || "",
          twitter_pixel_id: data.pixels.twitter_pixel_id || "",
          tracking_enabled: data.pixels.tracking_enabled ?? true,
        });
      }
    } catch (err) {
      console.error("[Pixels] Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pixels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pixels, user_id: user.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast({
        title: "Pixels sauvegardés ✓",
        description: "Vos pixels sont maintenant actifs sur votre boutique.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Sauvegarde impossible",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const activeCount = PIXEL_INFO.filter((p) => pixels[p.key]).length;

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
        title="Pixels publicitaires"
        subtitle={`${activeCount} pixel${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""} · Trackez vos conversions publicitaires`}
      />

      <motion.div variants={item} className="mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm mb-1">Comment ça marche ?</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Les pixels publicitaires permettent de tracker les actions des visiteurs sur votre boutique
                (vues, ajouts panier, commandes) pour optimiser vos campagnes publicitaires.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background/50">
                  <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> PageView auto
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background/50">
                  <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> ViewContent auto
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background/50">
                  <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> AddToCart auto
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded bg-background/50">
                  <CheckCircle2 className="w-3 h-3 text-yaa-green-500" /> Purchase auto
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {PIXEL_INFO.map((p) => {
          const Icon = p.icon;
          const isActive = !!pixels[p.key];
          return (
            <Card key={p.key} className={cn("p-5", isActive && "border-yaa-green-300")}>
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", p.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-semibold text-sm">{p.label}</h3>
                    {isActive ? (
                      <Badge className="bg-yaa-green-100 text-yaa-green-700 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </Badge>
                    ) : (
                      <Badge variant="outline">Non configuré</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">{p.helpText}</p>
                  <Input
                    placeholder={p.placeholder}
                    value={pixels[p.key]}
                    onChange={(e) => setPixels({ ...pixels, [p.key]: e.target.value })}
                    className="font-mono"
                  />
                  <a
                    href={p.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[10px] text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Ouvrir la plateforme
                  </a>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Tracking enabled toggle */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm">Tracking actif</h3>
              <p className="text-[11px] text-muted-foreground">
                Activez/désactivez tous les pixels en un clic
              </p>
            </div>
            <Switch
              checked={pixels.tracking_enabled}
              onCheckedChange={(v) => setPixels({ ...pixels, tracking_enabled: v })}
            />
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde..." : "Sauvegarder les pixels"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
