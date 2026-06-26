import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/health
 * Health check — verifies Supabase connection.
 * Returns: { ok, supabase: connected|error, env: {hasUrl, hasAnonKey, hasServiceKey} }
 */
export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Only test connection if all env vars are set
  if (!hasUrl || !hasServiceKey) {
    return NextResponse.json({
      ok: false,
      error: "Variables d'environnement Supabase manquantes",
      env: { hasUrl, hasAnonKey, hasServiceKey },
    }, { status: 503 });
  }

  try {
    // Try a simple query to verify the connection + service role key works
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .select("id")
      .limit(1);

    if (error) {
      // Table doesn't exist yet = schema not run
      if (error.code === "42P01") {
        return NextResponse.json({
          ok: false,
          error: "Table 'contact_messages' introuvable. Exécutez supabase-schema.sql dans Supabase Dashboard.",
          env: { hasUrl, hasAnonKey, hasServiceKey },
          hint: "Copiez le contenu de supabase-schema.sql → Supabase Dashboard → SQL Editor → Run",
        }, { status: 503 });
      }
      throw error;
    }

    return NextResponse.json({
      ok: true,
      supabase: "connected",
      env: { hasUrl, hasAnonKey, hasServiceKey },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Health] Supabase error:", error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Erreur Supabase",
      env: { hasUrl, hasAnonKey, hasServiceKey },
    }, { status: 503 });
  }
}
