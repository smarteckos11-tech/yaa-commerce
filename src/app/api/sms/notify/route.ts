import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import twilio from "twilio";

/**
 * POST /api/sms/notify
 * Envoie un SMS automatique basé sur un événement de commande.
 *
 * Body: { event, orderId, userId }
 * event: "order_created" | "order_shipped" | "order_delivered" | "order_cancelled" | "low_stock"
 *
 * Cette route est appelée automatiquement par :
 * - /checkout (après création commande) → event="order_created"
 * - /admin/commandes (changement statut) → event="order_shipped" / "order_delivered" / "order_cancelled"
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

type NotifyEvent = "order_created" | "order_shipped" | "order_delivered" | "order_cancelled" | "low_stock";

const MESSAGE_TEMPLATES: Record<NotifyEvent, (data: any) => string> = {
  order_created: (d) =>
    `🛍️ ${d.boutiqueName}: Commande ${d.orderRef} reçue ! Montant: ${d.amount}. Nous vous tiendrons informé(e) de l'expédition. Merci !`,
  order_shipped: (d) =>
    `📦 ${d.boutiqueName}: Votre commande ${d.orderRef} a été expédiée${d.carrier ? ` via ${d.carrier}` : ""}${d.trackingCode ? ` (suivi: ${d.trackingCode})` : ""}. Livraison estimée: ${d.eta || "sous 48-72h"}.`,
  order_delivered: (d) =>
    `✅ ${d.boutiqueName}: Votre commande ${d.orderRef} a été livrée ! Merci de votre confiance. À bientôt sur ${d.storeUrl || "notre boutique"} 🙏`,
  order_cancelled: (d) =>
    `❌ ${d.boutiqueName}: Votre commande ${d.orderRef} a été annulée. Pour toute question, contactez-nous.`,
  low_stock: (d) =>
    `⚠️ ${d.boutiqueName}: Alerte stock ! "${d.productName}" n'a plus que ${d.stock} unité(s). Pensez à réapprovisionner.`,
};

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
    const { event, orderId, productId, customUserId } = body;

    // Use customUserId if provided (for server-side calls), else use session userId
    const effectiveUserId = customUserId || userId;

    const validEvents: NotifyEvent[] = ["order_created", "order_shipped", "order_delivered", "order_cancelled", "low_stock"];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Événement invalide. Valides: ${validEvents.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch order details if orderId provided
    let orderData: any = null;
    let boutiqueName = "Votre Boutique";
    let customerPhone: string | null = null;
    let customerName: string | null = null;
    let orderRef: string | null = null;
    let amount: number | null = null;
    let carrier: string | null = null;
    let trackingCode: string | null = null;

    if (orderId) {
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select(`
          id, customer_name, customer_phone, amount, status, created_at,
          user_id,
          profiles:user_id (boutique_name)
        `)
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { error: "Commande introuvable" },
          { status: 404 }
        );
      }

      orderData = order;
      boutiqueName = order.profiles?.boutique_name || "Boutique";
      customerPhone = order.customer_phone;
      customerName = order.customer_name;
      orderRef = order.id.slice(0, 8).toUpperCase();
      amount = order.amount;

      // Fetch shipment info if exists
      const { data: shipment } = await supabaseAdmin
        .from("shipments")
        .select("carrier, tracking_code, eta")
        .eq("order_id", orderId)
        .single();

      if (shipment) {
        carrier = shipment.carrier;
        trackingCode = shipment.tracking_code;
      }
    }

    // Fetch product details if low_stock event
    let productName: string | null = null;
    let stock: number | null = null;
    if (event === "low_stock" && productId) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("name, stock, user_id, profiles:user_id (boutique_name)")
        .eq("id", productId)
        .single();

      if (product) {
        productName = product.name;
        stock = product.stock;
        boutiqueName = product.profiles?.boutique_name || "Boutique";
      }
    }

    // Determine recipient phone
    let recipientPhone: string | null = null;
    if (event === "low_stock") {
      // Send to the boutique owner's profile phone
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("id", effectiveUserId)
        .single();
      recipientPhone = profile?.phone;
    } else {
      recipientPhone = customerPhone;
    }

    if (!recipientPhone) {
      return NextResponse.json({
        success: false,
        message: "Aucun numéro de téléphone pour le destinataire",
      });
    }

    // Build message from template
    const templateData = {
      boutiqueName,
      orderRef,
      amount: amount ? `${amount.toLocaleString("fr-FR")} FCFA` : "",
      carrier,
      trackingCode,
      eta: trackingCode ? "sous 48h" : null,
      storeUrl: "yaa-commerce.com",
      productName,
      stock: stock?.toString(),
    };

    const message = MESSAGE_TEMPLATES[event as NotifyEvent](templateData);

    // Insert log entry
    const { data: logEntry } = await supabaseAdmin
      .from("sms_logs")
      .insert({
        user_id: effectiveUserId,
        phone: recipientPhone,
        message,
        status: "pending",
        order_id: orderId || null,
        trigger: event,
      })
      .select()
      .single();

    // Read Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      // Log only mode
      if (logEntry) {
        await supabaseAdmin
          .from("sms_logs")
          .update({
            status: "failed",
            error_message: "Twilio non configuré",
          })
          .eq("id", logEntry.id);
      }

      console.log(`[SMS Notify] Twilio not configured — would send to ${recipientPhone}: ${message}`);

      return NextResponse.json({
        success: false,
        message: "Twilio non configuré — SMS loggé uniquement",
        logId: logEntry?.id,
        wouldSendTo: recipientPhone,
        preview: message,
      });
    }

    // Normalize phone
    let normalizedPhone = recipientPhone.trim();
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone.replace(/^0+/, "");
      if (normalizedPhone.length < 10) {
        normalizedPhone = "+225" + recipientPhone.trim().replace(/^0+/, "");
      }
    }
    normalizedPhone = normalizedPhone.replace(/[\s-]/g, "");

    // Send via Twilio
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: normalizedPhone,
    });

    // Update log
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
      recipient: normalizedPhone,
      event,
    });
  } catch (error: any) {
    console.error("[SMS Notify] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'envoi de la notification SMS",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
