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

/**
 * POST /api/marketplace/install
 * Installe une app pour l'utilisateur courant.
 * Body: { appId }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const body = await req.json();
    const { appId } = body;

    if (!appId) {
      return NextResponse.json({ error: "appId requis" }, { status: 400 });
    }

    // Vérifie que l'app est approuvée
    const { data: app, error: appError } = await supabaseAdmin
      .from("marketplace_apps")
      .select("id, name, category, developer_name, pricing_model, price_monthly, status")
      .eq("id", appId)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: "Application introuvable" }, { status: 404 });
    }

    if (app.status !== "approved") {
      return NextResponse.json({ error: "Cette application n'est pas encore approuvée" }, { status: 403 });
    }

    // Vérifie si déjà installée
    const { data: existing } = await supabaseAdmin
      .from("marketplace_extensions")
      .select("id")
      .eq("user_id", userId)
      .eq("extension_name", app.name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Application déjà installée", alreadyInstalled: true }, { status: 409 });
    }

    // Insère l'installation
    const { data, error } = await supabaseAdmin
      .from("marketplace_extensions")
      .insert({
        user_id: userId,
        extension_name: app.name,
        extension_category: app.category,
        developer: app.developer_name,
        price: app.pricing_model === "free" ? "Gratuit" : `${app.price_monthly} FCFA/mois`,
        status: "active",
        config: { appId: app.id, pricing_model: app.pricing_model },
      })
      .select()
      .single();

    if (error) throw error;

    // Incrémente install_count
    try {
      const { data: appRow } = await supabaseAdmin
        .from("marketplace_apps")
        .select("install_count")
        .eq("id", appId)
        .single();
      if (appRow) {
        await supabaseAdmin
          .from("marketplace_apps")
          .update({ install_count: (appRow.install_count || 0) + 1 })
          .eq("id", appId);
      }
    } catch (incrErr) {
      console.warn("[Marketplace Install] increment error:", incrErr);
    }

    return NextResponse.json({
      success: true,
      message: `${app.name} installée avec succès`,
      install: data,
    });
  } catch (error: any) {
    console.error("[Marketplace Install] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'installation", details: error?.message }, { status: 500 });
  }
}

/**
 * DELETE /api/marketplace/install
 * Désinstalle une app.
 * Body: { installId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const body = await req.json();
    const { installId } = body;

    if (!installId) {
      return NextResponse.json({ error: "installId requis" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("marketplace_extensions")
      .delete()
      .eq("id", installId)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Application désinstallée" });
  } catch (error: any) {
    console.error("[Marketplace Uninstall] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la désinstallation" }, { status: 500 });
  }
}
