"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, DollarSign, Tag, Box, FileText, Settings, Layers, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT_CATEGORIES } from "@/lib/admin-data";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [generatingDesc, setGeneratingDesc] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(isEditing);

  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [type, setType] = React.useState<"physique" | "digital" | "service" | "subscription">("physique");
  const [price, setPrice] = React.useState("");
  const [compareAtPrice, setCompareAtPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [images, setImages] = React.useState<{ secure_url: string; public_id: string }[]>([]);
  const [trackInventory, setTrackInventory] = React.useState(true);

  // Derived from type — true only for physical products
  const isPhysical = type === "physique";

  // Variants
  const [enableVariants, setEnableVariants] = React.useState(false);
  const [variants, setVariants] = React.useState<{ size: string; color: string; sku: string; stock: string; price: string }[]>([
    { size: "", color: "", sku: "", stock: "", price: "" },
  ]);

  const handleGenerateDescription = async () => {
    if (!name) {
      toast({ title: "Nom requis", description: "Entrez d'abord le nom du produit", variant: "destructive" });
      return;
    }
    setGeneratingDesc(true);
    try {
      const generated = `${name} — Produit de qualité premium, idéal pour votre quotidien.

Caractéristiques principales :
- Matériau de première qualité
- Fabrication artisanale
- Design moderne et élégant
- Livraison rapide partout en Afrique

Livraison : Abidjan 2h, partout en Côte d'Ivoire 24h
Paiement : Wave, Orange Money, MTN MoMo, Cash à la livraison
Retour gratuit sous 7 jours`;

      setDescription(generated);
      toast({ title: "Description générée", description: "Modifiez-la selon vos besoins." });
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const productData = {
        user_id: user.id,
        name,
        sku: sku || null,
        category: category || null,
        type: type,
        price: parseInt(price) || 0,
        stock: isPhysical && trackInventory ? parseInt(stock) || 0 : null,
        description: description || null,
        image_url: images[0]?.secure_url || null,
        status: "actif",
      };

      let data: any = null;
      let error: any = null;

      if (isEditing && editId) {
        // Update existing product
        const result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editId)
          .eq("user_id", user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new product
        const result = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Produit mis à jour !" : "Produit créé !",
        description: `${name} ${isEditing ? "modifié" : "ajouté à votre catalogue"}.`,
      });
      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Load existing product data when editing
  React.useEffect(() => {
    if (!editId || !user) return;
    async function loadProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", editId)
          .eq("user_id", user!.id)
          .single();
        if (error) throw error;
        if (data) {
          setName(data.name || "");
          setSku(data.sku || "");
          setCategory(data.category || "");
          setType((data.type as any) || "physique");
          setPrice(data.price ? String(data.price) : "");
          setStock(data.stock !== null ? String(data.stock) : "");
          setDescription(data.description || "");
          if (data.image_url) {
            setImages([{ secure_url: data.image_url, public_id: "" }]);
          }
          if (data.stock === null) setTrackInventory(false);
        }
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le produit",
          variant: "destructive",
        });
        router.push("/admin/produits");
      } finally {
        setLoadingEdit(false);
      }
    }
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user]);

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Chargement du produit...</div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/produits"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl lg:text-2xl">{isEditing ? "Modifier le produit" : "Nouveau produit"}</h1>
            <p className="text-sm text-muted-foreground">Créez un produit comme sur Shopify</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/produits">Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-yaa-green-500" />
                <h2 className="font-display font-semibold">Informations générales</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs font-semibold">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Sac en cuir Faso Dan Fani fait main"
                    required
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] gap-1 text-yaa-orange-600 hover:text-yaa-orange-700"
                      onClick={handleGenerateDescription}
                      disabled={generatingDesc}
                    >
                      <Sparkles className="w-3 h-3" />
                      {generatingDesc ? "Génération..." : "IA: Générer"}
                    </Button>
                  </div>
                  <div className="mt-1">
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Décrivez votre produit en détail. Utilisez l'IA YaaMind pour générer une description optimisée SEO."
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Éditeur riche : titres, gras, listes, images, liens · Optimisez pour le SEO
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-yaa-green-500" />
                <h2 className="font-display font-semibold">Médias</h2>
              </div>
              <ImageUploader
                images={images}
                onChange={setImages}
                multiple
                maxImages={6}
                label="Photos du produit (max 6)"
              />
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-yaa-green-500" />
                <h2 className="font-display font-semibold">Tarification</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price" className="text-xs font-semibold">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="25000"
                    required
                    className="mt-1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice" className="text-xs font-semibold">Prix barré (FCFA)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    min="0"
                    placeholder="35000"
                    className="mt-1"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Pour afficher une promo</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-yaa-green-500" />
                <h2 className="font-display font-semibold">Inventaire</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">Suivre le stock</Label>
                    <p className="text-[10px] text-muted-foreground">Décochez pour les produits illimités</p>
                  </div>
                  <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
                </div>
                {trackInventory && (
                  <div>
                    <Label htmlFor="stock" className="text-xs font-semibold">Stock disponible</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="50"
                      className="mt-1"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="sku" className="text-xs font-semibold">SKU (référence)</Label>
                  <Input
                    id="sku"
                    placeholder="MOD-SC-001"
                    className="mt-1"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div variants={item}>
            <Card className="p-5">
              <h2 className="font-display font-semibold mb-3">Statut</h2>
              <Select defaultValue="actif">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif (visible)</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-2">
                Les produits actifs sont visibles sur votre boutique publique.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5">
              <h2 className="font-display font-semibold mb-3">Organisation</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold">Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.filter((c) => c !== "Toutes").map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Type de produit</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as "physique" | "digital" | "service" | "subscription")}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physique">Physique (livraison)</SelectItem>
                      <SelectItem value="digital">Digital (téléchargement)</SelectItem>
                      <SelectItem value="service">Service (prestation)</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isPhysical && (
                  <div>
                    <Label htmlFor="weight" className="text-xs font-semibold">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.5"
                      className="mt-1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Pour calculer les frais de livraison</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Variants */}
          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-yaa-green-500" />
                  <h2 className="font-display font-semibold">Variantes</h2>
                </div>
                <Switch checked={enableVariants} onCheckedChange={setEnableVariants} />
              </div>
              {enableVariants ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Créez des variantes par taille, couleur, etc. Chaque variante a son propre SKU, stock et prix.
                  </p>
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-end">
                      <div>
                        <Label className="text-[10px] font-semibold">Taille</Label>
                        <Input
                          placeholder="M, L, XL"
                          className="mt-0.5 h-8 text-xs"
                          value={v.size}
                          onChange={(e) => {
                            const next = [...variants];
                            next[i].size = e.target.value;
                            setVariants(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold">Couleur</Label>
                        <Input
                          placeholder="Rouge"
                          className="mt-0.5 h-8 text-xs"
                          value={v.color}
                          onChange={(e) => {
                            const next = [...variants];
                            next[i].color = e.target.value;
                            setVariants(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold">SKU</Label>
                        <Input
                          placeholder="MOD-SC-M"
                          className="mt-0.5 h-8 text-xs font-mono"
                          value={v.sku}
                          onChange={(e) => {
                            const next = [...variants];
                            next[i].sku = e.target.value;
                            setVariants(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold">Stock</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          className="mt-0.5 h-8 text-xs"
                          value={v.stock}
                          onChange={(e) => {
                            const next = [...variants];
                            next[i].stock = e.target.value;
                            setVariants(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-semibold">Prix</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            placeholder="25000"
                            className="mt-0.5 h-8 text-xs"
                            value={v.price}
                            onChange={(e) => {
                              const next = [...variants];
                              next[i].price = e.target.value;
                              setVariants(next);
                            }}
                          />
                          {variants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0 text-rose-600"
                              onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 mt-2"
                    onClick={() => setVariants([...variants, { size: "", color: "", sku: "", stock: "", price: "" }])}
                  >
                    <Plus className="w-3 h-3" /> Ajouter une variante
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Activez les variantes si votre produit existe en plusieurs tailles, couleurs ou formats.
                </p>
              )}
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-yaa-green-500" />
                <h2 className="font-display font-semibold">Aperçu SEO</h2>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-muted/30">
                <p className="text-xs text-yaa-green-600 truncate">
                  yaa-commerce.com/b/{profile?.boutique_name?.toLowerCase().replace(/\s/g, "-") || "boutique"}/p/...
                </p>
                <p className="text-sm font-medium text-blue-700 truncate mt-1">
                  {name || "Nom du produit"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {description || "La description apparaîtra ici pour le référencement Google."}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      </form>
    </motion.div>
  );
}

// Wrap in Suspense for useSearchParams
export default function NewProductPageWrapper() {
  return (
    <React.Suspense fallback={<div className="min-h-[400px]" />}>
      <NewProductPage />
    </React.Suspense>
  );
}
