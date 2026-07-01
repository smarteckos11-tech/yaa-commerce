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

/**
 * GET /api/returns
 * Retourne tous les retours de l'utilisateur courant.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("returns")
      .select(`
        *,
        orders:order_id (id, amount, customer_name, items, payment_method)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ returns: data || [] });
  } catch (error) {
    console.error("[Returns GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/returns
 * Crée une nouvelle demande de retour.
 *
 * Body: {
 *   orderId, customerName, customerPhone, customerEmail,
 *   reason, reasonDetails, requestedRefundAmount,
 *   itemsCount, refundMethod
 * }
 *
 * Cette route est publique (les clients n'ont pas de compte),
 * mais on vérifie que la commande existe et on l'associe à son user_id.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      reason,
      reasonDetails,
      requestedRefundAmount,
      itemsCount,
      refundMethod,
    } = body;

    // Validation
    if (!orderId || !customerName || !reason) {
      return NextResponse.json(
        { error: "Champs requis: orderId, customerName, reason" },
        { status: 400 }
      );
    }

    const validReasons = ["defect", "wrong_item", "not_as_described", "damaged_shipping", "changed_mind", "late_delivery", "other"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Raison invalide" },
        { status: 400 }
      );
    }

    // Fetch the order to get user_id (the boutique owner)
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, customer_name, amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Insert the return request
    const { data, error } = await supabaseAdmin
      .from("returns")
      .insert({
        user_id: order.user_id,
        order_id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        reason,
        reason_details: reasonDetails || null,
        requested_refund_amount: requestedRefundAmount || order.amount,
        refund_method: refundMethod || "original",
        items_count: itemsCount || 1,
        status: "requested",
      })
      .select()
      .single();

    if (error) throw error;

    // Send SMS notification to the boutique owner (fire-and-forget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://yaa-commerce.vercel.app"}/api/sms/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "low_stock", // reuse: boutique owner's phone
          customUserId: order.user_id,
          orderId,
        }),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Demande de retour créée",
      returnId: data.id,
      status: "requested",
    });
  } catch (error: any) {
    console.error("[Returns POST] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du retour",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/returns
 * Met à jour le statut d'un retour (admin only).
 *
 * Body: { id, status, approvedRefundAmount?, refundMethod?, refundReference?, adminNotes? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, approvedRefundAmount, refundMethod, refundReference, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id et status requis" },
        { status: 400 }
      );
    }

    const validStatuses = ["requested", "under_review", "approved", "rejected", "refunded", "received_back"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Build update object
    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (approvedRefundAmount !== undefined) update.approved_refund_amount = approvedRefundAmount;
    if (refundMethod) update.refund_method = refundMethod;
    if (refundReference !== undefined) update.refund_reference = refundReference;
    if (adminNotes !== undefined) update.admin_notes = adminNotes;
    if (status === "refunded" || status === "rejected") {
      update.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("returns")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId) // Security: only owner can update
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: "Retour introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    // If refund is processed, optionally notify the customer via SMS
    if (status === "refunded" && data.customer_phone) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/sms/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: data.customer_phone,
            message: `💰 Votre remboursement de ${approvedRefundAmount || data.requested_refund_amount} FCFA a été traité via ${refundMethod || data.refund_method}. Référence: ${refundReference || "N/A"}. Merci de votre patience.`,
            trigger: "refund_processed",
          }),
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Retour mis à jour",
      return: data,
    });
  } catch (error: any) {
    console.error("[Returns PATCH] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
