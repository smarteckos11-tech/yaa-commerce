import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPER_ADMIN_EMAIL = "kossonouy11@gmail.com";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

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
 * GET /api/admin/stats
 * Retourne les statistiques globales de la plateforme (super admin only).
 */
export async function GET() {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Accès refusé — Super Admin uniquement" },
        { status: 403 }
      );
    }

    // Compte tous les utilisateurs
    const { count: totalUsers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Compte par plan
    const { data: planData } = await supabaseAdmin
      .from("profiles")
      .select("plan");

    const planDistribution = (planData || []).reduce(
      (acc: Record<string, number>, p: any) => {
        const plan = p.plan || "decouverte";
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      },
      {}
    );

    // Compte les produits
    const { count: totalProducts } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true });

    // Compte les commandes
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("amount, created_at");

    const totalOrders = orders?.length || 0;
    const totalRevenue = (orders || []).reduce(
      (sum: number, o: any) => sum + (o.amount || 0),
      0
    );

    // MRR (Monthly Recurring Revenue)
    const planPrices: Record<string, number> = {
      pro: 25000,
      business: 12000,
      decouverte: 0,
    };
    const mrr = Object.entries(planDistribution).reduce(
      (sum, [plan, count]) => sum + (planPrices[plan] || 0) * (count as number),
      0
    );

    // Utilisateurs récents (30 jours)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { count: newUsers30d } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders,
        totalRevenue,
        mrr,
        newUsers30d: newUsers30d || 0,
        planDistribution,
      },
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
