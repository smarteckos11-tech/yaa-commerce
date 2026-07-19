import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    });
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch { return null; }
}

/** GET /api/product-settings?userId=xxx — public: get CTA + form config */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("product_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      // Return defaults if no settings configured
      return NextResponse.json({
        settings: {
          cta_text: "Commander maintenant",
          cta_color: "#ffffff",
          cta_background: "#0F8A5F",
          cta_border: "#0F8A5F",
          cta_radius: "12px",
          cta_size: "lg",
          cta_icon: "ShoppingCart",
          cta_position: "after_product_images",
          cta_enabled: true,
          form_display_mode: "modal",
          free_shipping_threshold: 50000,
          skip_cart: true,
          show_default_packs: true,
        },
      });
    }

    return NextResponse.json({ settings: data });
  } catch (error: any) {
    console.error("[Product Settings GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST /api/product-settings — upsert settings (auth required) */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Auth requis" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabaseAdmin
      .from("product_settings")
      .upsert({
        user_id: userId,
        ...body,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    console.error("[Product Settings POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
