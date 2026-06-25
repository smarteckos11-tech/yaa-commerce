import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/contact
 * Receives contact form submissions and stores them in Supabase.
 *
 * Uses the service_role key (server-side only) to insert into the
 * contact_messages table. RLS policy allows anyone to insert.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, boutique_name, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Champs requis manquants : name, email, message" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        boutique_name: boutique_name || null,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error("[Contact] Supabase error:", error);
      // Fallback: log the message so it's not lost
      console.log("[Contact] Fallback log:", {
        name, email, phone, subject, boutique_name, message,
        timestamp: new Date().toISOString(),
      });
      // Still return success to user (don't expose DB errors)
      return NextResponse.json({
        success: true,
        message: "Message reçu. Nous vous répondons sous 24h.",
      });
    }

    console.log("[Contact] Message stored:", data.id);

    return NextResponse.json({
      success: true,
      message: "Message reçu. Nous vous répondons sous 24h.",
      id: data.id,
    });
  } catch (error) {
    console.error("[Contact] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Returns all contact messages (admin only — should be protected)
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error("[Contact GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
