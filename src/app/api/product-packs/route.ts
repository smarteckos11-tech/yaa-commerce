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

/** GET /api/product-packs?productId=xxx — public: list packs for a product */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId requis" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("product_packs")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ packs: data || [] });
  } catch (error: any) {
    console.error("[Product Packs GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST /api/product-packs — create a pack (auth required) */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Auth requis" }, { status: 401 });

    const body = await req.json();
    const { product_id, title, quantity, price, original_price, badge, badge_color, marketing_text, background_color, text_color, display_order, is_default, is_active } = body;

    if (!product_id || !title || !quantity || !price) {
      return NextResponse.json({ error: "product_id, title, quantity, price requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("product_packs")
      .insert({
        product_id, user_id: userId, title, quantity, price,
        original_price: original_price || null,
        badge: badge || null, badge_color: badge_color || "gray",
        marketing_text: marketing_text || null,
        background_color: background_color || null, text_color: text_color || null,
        display_order: display_order || 0, is_default: is_default || false,
        is_active: is_active !== false,
      })
      .select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, pack: data });
  } catch (error: any) {
    console.error("[Product Packs POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH /api/product-packs — update a pack */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Auth requis" }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("product_packs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, pack: data });
  } catch (error: any) {
    console.error("[Product Packs PATCH] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE /api/product-packs — delete a pack */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Auth requis" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("product_packs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Product Packs DELETE] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
