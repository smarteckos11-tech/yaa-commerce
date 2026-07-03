import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    });
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch { return null; }
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

/**
 * GET /api/marketplace/apps
 * Retourne les apps approuvées (catalogue public).
 * Query params: ?category=Paiement&search=wave
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    let query = supabaseAdmin
      .from("marketplace_apps")
      .select("*")
      .eq("status", "approved")
      .order("install_count", { ascending: false });

    if (category && category !== "all") query = query.eq("category", category);
    if (search) query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%,developer_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ apps: data || [] });
  } catch (error: any) {
    console.error("[Marketplace GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/marketplace/apps
 * Soumet une nouvelle application (développeur).
 * Body: { name, short_description, description, category, developer_name, developer_email, developer_website, icon_url, pricing_model, price_monthly, setup_fee, webhook_url, permissions[], features[] }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, short_description, description, category,
      developer_name, developer_email, developer_website,
      icon_url, pricing_model, price_monthly, setup_fee,
      webhook_url, permissions, features,
    } = body;

    if (!name || !category || !developer_name || !developer_email) {
      return NextResponse.json(
        { error: "Champs requis: name, category, developer_name, developer_email" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("marketplace_apps")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const { data, error } = await supabaseAdmin
      .from("marketplace_apps")
      .insert({
        slug: finalSlug,
        name,
        short_description: short_description || null,
        description: description || null,
        category,
        developer_name,
        developer_email,
        developer_website: developer_website || null,
        icon_url: icon_url || null,
        pricing_model: pricing_model || "free",
        price_monthly: price_monthly || 0,
        setup_fee: setup_fee || 0,
        webhook_url: webhook_url || null,
        permissions: permissions || [],
        features: features || [],
        status: "pending_review",
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Application soumise ! Elle sera examinée par notre équipe sous 48h.",
      app: data,
    });
  } catch (error: any) {
    console.error("[Marketplace POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission", details: error?.message },
      { status: 500 }
    );
  }
}
