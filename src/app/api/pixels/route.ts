import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/pixels?userId=xxx
 * Retourne les pixels publics d'une boutique (pour injection côté client).
 * Pas d'auth requise — les pixel IDs sont publics (comme sur Shopify).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("pixel_settings")
      .select("meta_pixel_id, tiktok_pixel_id, google_ads_id, snapchat_pixel_id, twitter_pixel_id, tracking_enabled")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ pixels: null });
    }

    return NextResponse.json({ pixels: data });
  } catch (error: any) {
    console.error("[Pixels GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/pixels
 * Sauvegarde les pixels pour l'utilisateur courant.
 * Body: { meta_pixel_id, tiktok_pixel_id, google_ads_id, snapchat_pixel_id, twitter_pixel_id, tracking_enabled }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      meta_pixel_id,
      tiktok_pixel_id,
      google_ads_id,
      snapchat_pixel_id,
      twitter_pixel_id,
      tracking_enabled,
    } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id requis" }, { status: 400 });
    }

    // Upsert (insert or update)
    const { data, error } = await supabaseAdmin
      .from("pixel_settings")
      .upsert({
        user_id,
        meta_pixel_id: meta_pixel_id || null,
        tiktok_pixel_id: tiktok_pixel_id || null,
        google_ads_id: google_ads_id || null,
        snapchat_pixel_id: snapchat_pixel_id || null,
        twitter_pixel_id: twitter_pixel_id || null,
        tracking_enabled: tracking_enabled ?? true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, pixels: data });
  } catch (error: any) {
    console.error("[Pixels POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
