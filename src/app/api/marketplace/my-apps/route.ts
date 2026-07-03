import { NextResponse } from "next/server";
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
 * GET /api/marketplace/my-apps
 * Retourne les apps installées par l'utilisateur courant + les apps qu'il a soumises.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    // Apps installées
    const { data: installed, error: installedError } = await supabaseAdmin
      .from("marketplace_extensions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (installedError) throw installedError;

    // Apps soumises par le développeur
    const { data: submitted, error: submittedError } = await supabaseAdmin
      .from("marketplace_apps")
      .select("*")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false });

    if (submittedError) throw submittedError;

    return NextResponse.json({
      installed: installed || [],
      submitted: submitted || [],
    });
  } catch (error: any) {
    console.error("[My Apps] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
