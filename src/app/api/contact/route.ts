import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/contact
 * Receives contact form submissions.
 *
 * For now: just logs + returns success.
 * When Supabase is configured: insert into `contact_messages` table.
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

    // Log for now (replace with Supabase insert or Resend email later)
    console.log("[Contact] Nouveau message:", {
      name,
      email,
      phone,
      subject,
      boutique_name,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: When Supabase is set up, uncomment this:
    // import { supabaseAdmin } from "@/lib/supabase-admin";
    // const { error } = await supabaseAdmin.from("contact_messages").insert({
    //   name, email, phone, subject, boutique_name, message,
    // });
    // if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Message reçu. Nous vous répondons sous 24h.",
    });
  } catch (error) {
    console.error("[Contact] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
