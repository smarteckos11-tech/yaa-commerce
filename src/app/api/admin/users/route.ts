import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPER_ADMIN_EMAIL = "kossonouy11@gmail.com";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

/**
 * Vérifie que l'utilisateur courant est le super admin via la session Supabase.
 */
async function isSuperAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return false;
    return session.user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/users
 * Retourne tous les utilisateurs (super admin only).
 */
export async function GET() {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Accès refusé — Super Admin uniquement" },
        { status: 403 }
      );
    }

    // Récupère tous les profils
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Pour chaque profil, compte ses produits et commandes
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const [prodRes, orderRes] = await Promise.all([
          supabaseAdmin
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.id),
          supabaseAdmin
            .from("orders")
            .select("amount", { count: "exact", head: false })
            .eq("user_id", profile.id),
        ]);

        const mrr = profile.plan === "pro" ? 25000 : profile.plan === "business" ? 12000 : 0;
        const totalRevenue = (orderRes.data || []).reduce(
          (sum: number, o: any) => sum + (o.amount || 0),
          0
        );

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          boutique_name: profile.boutique_name,
          plan: profile.plan || "decouverte",
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          product_count: prodRes.count || 0,
          order_count: orderRes.count || 0,
          total_revenue: totalRevenue,
          mrr,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("[Admin Users] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
