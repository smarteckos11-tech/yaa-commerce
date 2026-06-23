"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Upload, Download, Plus, Sparkles, Search, MoreHorizontal, Eye, Pencil, Copy, Image, FileText, Trash2, AlertTriangle, Infinity as InfinityIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { PRODUCTS, PRODUCT_STATS, PRODUCT_CATEGORIES, CATEGORY_COLORS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ProduitsPage() {
  const [tab, setTab] = React.useState("tous");

  const filtered = React.useMemo(() => {
    if (tab === "physiques") return PRODUCTS.filter((p) => p.type === "physique");
    if (tab === "numeriques") return PRODUCTS.filter((p) => p.type === "digital");
    if (tab === "stock-faible") return PRODUCTS.filter((p) => p.stock !== null && p.stock <= 10);
    return PRODUCTS;
  }, [tab]);

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Produits"
        subtitle="Gérez votre catalogue produits en quelques clics"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Upload className="h-4 w-4" /> Import CSV</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Exporter</Button>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><Plus className="h-4 w-4" /> Ajouter un produit</Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {PRODUCT_STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un produit..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c.toLowerCase().replace(/\s/g, "-")}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50">
              <Sparkles className="h-4 w-4" /> IA: Description
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="tous">Tous ({PRODUCTS.length})</TabsTrigger>
              <TabsTrigger value="physiques">Physiques ({PRODUCTS.filter(p => p.type === "physique").length})</TabsTrigger>
              <TabsTrigger value="numeriques">Numériques ({PRODUCTS.filter(p => p.type === "digital").length})</TabsTrigger>
              <TabsTrigger value="stock-faible">Stock faible ({PRODUCTS.filter(p => p.stock !== null && p.stock <= 10).length})</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Produit</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Catégorie</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Type</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Prix</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Stock</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Vendus</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, idx) => (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-lg flex-shrink-0">{p.emoji}</div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", CATEGORY_COLORS[p.category].bg, CATEGORY_COLORS[p.category].text)}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", p.type === "digital" ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400" : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400")}>
                            {p.type === "digital" ? "Digital" : "Physique"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold">{formatFCFA(p.price)}</td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          {p.stock === null ? (
                            <InfinityIcon className="h-4 w-4 inline text-muted-foreground" />
                          ) : p.stock <= 10 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <AlertTriangle className="h-3 w-3" /> {p.stock}
                            </span>
                          ) : (
                            <span className="text-sm">{p.stock}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right hidden md:table-cell text-muted-foreground">{p.sold}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", p.status === "Actif" ? "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400" : "bg-muted text-muted-foreground")}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir</DropdownMenuItem>
                              <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Dupliquer</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem><Image className="h-4 w-4 mr-2" /> IA: Générer image</DropdownMenuItem>
                              <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> IA: Description SEO</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}
