"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Loader2, MessageSquare, ThumbsUp, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/ui-bits";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string;
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  created_at: string;
  products?: { name: string } | null;
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("pending");

  const loadReviews = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get all product IDs owned by this user
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", user.id);

      if (!products || products.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const productIds = products.map((p) => p.id);
      const productNameMap = new Map(products.map((p) => [p.id, p.name]));

      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewList = (data || []).map((r: any) => ({
        ...r,
        products: { name: productNameMap.get(r.product_id) || "Produit" },
      })) as Review[];

      setReviews(reviewList);
    } catch (err) {
      console.warn("[Reviews] Error:", err);
      // Table might not exist yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const updateStatus = async (reviewId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ status })
        .eq("id", reviewId);

      if (error) throw error;

      setReviews(reviews.map((r) => r.id === reviewId ? { ...r, status } : r));
      toast({
        title: status === "approved" ? "Avis approuvé ✓" : "Avis rejeté",
        description: status === "approved" ? "L'avis est maintenant visible publiquement." : "L'avis a été masqué.",
      });
    } catch (err) {
      toast({ title: "Erreur", description: "Action impossible", variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const stats = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    avgRating: reviews.filter((r) => r.status === "approved").length > 0
      ? (reviews.filter((r) => r.status === "approved").reduce((s, r) => s + r.rating, 0) / reviews.filter((r) => r.status === "approved").length).toFixed(1)
      : "—",
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yaa-green-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Avis clients"
        subtitle="Modérez les avis laissés par vos clients"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-amber-600" /></div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yaa-green-100 flex items-center justify-center"><Check className="w-4 h-4 text-yaa-green-600" /></div>
            <p className="text-xs text-muted-foreground">Approuvés</p>
          </div>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><X className="w-4 h-4 text-rose-600" /></div>
            <p className="text-xs text-muted-foreground">Rejetés</p>
          </div>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /></div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </div>
          <p className="text-2xl font-bold">{stats.avgRating}</p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: "pending", label: "En attente", count: stats.pending },
          { key: "approved", label: "Approuvés", count: stats.approved },
          { key: "rejected", label: "Rejetés", count: stats.rejected },
          { key: "all", label: "Tous", count: reviews.length },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              filter === f.key
                ? "bg-yaa-green-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">Aucun avis à modérer</p>
          <p className="text-xs text-muted-foreground mt-1">
            Les avis de vos clients apparaîtront ici pour validation.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full bg-yaa-green-100 flex items-center justify-center text-xs font-bold text-yaa-green-700">
                        {review.author_name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{review.author_name}</p>
                          <Badge className={cn(
                            "text-[9px]",
                            review.status === "pending" && "bg-amber-100 text-amber-700",
                            review.status === "approved" && "bg-yaa-green-100 text-yaa-green-700",
                            review.status === "rejected" && "bg-rose-100 text-rose-700",
                          )}>
                            {review.status === "pending" ? "En attente" : review.status === "approved" ? "Approuvé" : "Rejeté"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <Star key={j} className={cn("w-3.5 h-3.5", j <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                        ))}
                      </div>
                    </div>

                    {/* Product name */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                      <Package className="w-3 h-3" />
                      {review.products?.name || "Produit"}
                    </div>

                    {/* Title + comment */}
                    {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" /> {review.helpful_count} utile(s)
                    </div>
                  </div>

                  {/* Actions */}
                  {review.status === "pending" && (
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(review.id, "approved")}
                        className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1 h-7 text-[11px]"
                      >
                        <Check className="w-3 h-3" /> Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(review.id, "rejected")}
                        className="border-rose-300 text-rose-600 hover:bg-rose-50 gap-1 h-7 text-[11px]"
                      >
                        <X className="w-3 h-3" /> Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
