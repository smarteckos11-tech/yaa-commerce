"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, ChevronDown, Loader2, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  comment: string;
  helpful_count: number;
  created_at: string;
};

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [openReviewId, setOpenReviewId] = React.useState<string | null>(null);

  // Form
  const [authorName, setAuthorName] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");

  const loadReviews = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, author_name, rating, title, comment, helpful_count, created_at")
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews((data || []) as Review[]);
    } catch (err) {
      // Table might not exist yet — silently fail
      console.warn("[Reviews] Table not ready:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        author_name: authorName,
        rating,
        title: title || null,
        comment,
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
      setAuthorName("");
      setTitle("");
      setComment("");
      setRating(5);
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      alert("Erreur lors de l'envoi de l'avis. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-4">Avis clients</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Rating summary */}
        <Card className="p-5 text-center">
          <p className="text-4xl font-display font-extrabold text-amber-500">{avgRating}</p>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "w-5 h-5",
                  i <= Math.round(parseFloat(avgRating) || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{reviews.length} avis</p>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Laisser un avis
          </Button>
        </Card>

        {/* Distribution */}
        <div className="md:col-span-2 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs font-semibold w-8 flex items-center gap-0.5">
                {d.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-5">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 mx-auto rounded-full bg-yaa-green-100 flex items-center justify-center mb-3">
                    <Check className="w-7 h-7 text-yaa-green-600" />
                  </div>
                  <p className="font-semibold text-sm">Merci pour votre avis !</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Votre avis sera visible après validation par le marchand.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h3 className="font-display font-semibold text-sm">Laisser un avis</h3>

                  {/* Star rating selector */}
                  <div>
                    <Label className="text-xs font-semibold">Note *</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={cn(
                              "w-6 h-6 transition-colors",
                              i <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 hover:text-amber-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="review-name" className="text-xs font-semibold">Votre nom *</Label>
                      <Input
                        id="review-name"
                        required
                        placeholder="Aminata T."
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-title" className="text-xs font-semibold">Titre (optionnel)</Label>
                      <Input
                        id="review-title"
                        placeholder="Excellent produit !"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="review-comment" className="text-xs font-semibold">Commentaire *</Label>
                    <Textarea
                      id="review-comment"
                      required
                      rows={4}
                      placeholder="Partagez votre expérience avec ce produit..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-yaa-green-500 hover:bg-yaa-green-600 gap-1.5">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : "Publier mon avis"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">Aucun avis pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">
            Soyez le premier à laisser un avis sur ce produit !
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-yaa-green-100 flex items-center justify-center text-xs font-bold text-yaa-green-700">
                      {review.author_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.author_name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Star
                        key={j}
                        className={cn(
                          "w-3.5 h-3.5",
                          j <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <p className="text-sm font-semibold mb-1">{review.title}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100">
                  <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="w-3 h-3" /> Utile ({review.helpful_count})
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
