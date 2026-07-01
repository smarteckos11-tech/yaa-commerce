import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import twilio from "twilio";

/**
 * POST /api/sms/send
 * Envoie un SMS via Twilio à un numéro de téléphone.
 *
 * Body: { phone, message, orderId?, customerId?, trigger? }
 *
 * Sécurité : vérifie que l'utilisateur est authentifié via session Supabase.
 * Les credentials Twilio sont lus depuis les env vars (jamais exposées au client).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

async function getCurrentUserId(): Promise<string | null> {
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
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phone, message, orderId, customerId, trigger } = body;

    // Validation
    if (!phone || !message) {
      return NextResponse.json(
        { error: "Numéro de téléphone et message requis" },
        { status: 400 }
      );
    }

    if (message.length > 1600) {
      return NextResponse.json(
        { error: "Message trop long (max 1600 caractères)" },
        { status: 400 }
      );
    }

    // Normalize phone (E.164 format: +225...)
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith("+")) {
      // Assume CI by default if no country code
      normalizedPhone = "+" + normalizedPhone.replace(/^0+/, "");
      if (normalizedPhone.length < 10) {
        normalizedPhone = "+225" + phone.trim().replace(/^0+/, "");
      }
    }
    // Remove spaces and dashes
    normalizedPhone = normalizedPhone.replace(/[\s-]/g, "");

    // Read Twilio credentials from env vars
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Insert log entry (pending status)
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from("sms_logs")
      .insert({
        user_id: userId,
        phone: normalizedPhone,
        message,
        status: "pending",
        order_id: orderId || null,
        customer_id: customerId || null,
        trigger: trigger || "manual",
      })
      .select()
      .single();

    if (logError) {
      console.error("[SMS] Log insert error:", logError);
    }

    // If Twilio not configured, return early (log only)
    if (!accountSid || !authToken || !fromNumber) {
      console.log("[SMS] Twilio not configured — log only mode");

      // Update log as failed (not configured)
      if (logEntry) {
        await supabaseAdmin
          .from("sms_logs")
          .update({
            status: "failed",
            error_message: "Twilio non configuré",
          })
          .eq("id", logEntry.id);
      }

      return NextResponse.json({
        success: false,
        message: "Twilio non configuré. Ajoutez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans les variables d'environnement.",
        logId: logEntry?.id,
        phone: normalizedPhone,
      });
    }

    // Send SMS via Twilio
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: normalizedPhone,
    });

    // Update log with Twilio response
    if (logEntry) {
      await supabaseAdmin
        .from("sms_logs")
        .update({
          status: result.status === "queued" || result.status === "sent" ? "sent" : "failed",
          twilio_sid: result.sid,
          twilio_status: result.status,
          error_message: result.errorMessage || null,
        })
        .eq("id", logEntry.id);
    }

    return NextResponse.json({
      success: true,
      message: "SMS envoyé",
      sid: result.sid,
      status: result.status,
      logId: logEntry?.id,
      phone: normalizedPhone,
    });
  } catch (error: any) {
    console.error("[SMS] Send error:", error);

    // Update log with error if we have a log entry
    // (we'd need to track it outside try/catch, but for now just return error)

    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi du SMS",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
