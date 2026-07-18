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

// Auto-responses IA (templates)
const AUTO_RESPONSES = [
  "Bonjour 👋 Merci de votre message ! Un conseiller vous répondra sous quelques minutes.",
  "Merci pour votre intérêt ! Notre équipe revient vers vous très vite.",
  "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
  "Bien reçu ! Patientez un instant, on vous répond.",
];

/**
 * GET /api/chat/messages?conversationId=xxx
 * Retourne les messages d'une conversation
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("live_chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    console.error("[Chat Messages GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/chat/messages
 * Envoie un message
 * Body: { conversation_id, sender (customer|merchant|bot), content }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation_id, sender, content } = body;

    if (!conversation_id || !sender || !content) {
      return NextResponse.json({ error: "conversation_id, sender, content requis" }, { status: 400 });
    }

    // Insert message
    const { data, error } = await supabaseAdmin
      .from("live_chat_messages")
      .insert({
        conversation_id,
        sender,
        content,
        is_ai_suggestion: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last_message + unread counts
    const { data: conv } = await supabaseAdmin
      .from("live_chat_conversations")
      .select("user_id")
      .eq("id", conversation_id)
      .single();

    if (conv) {
      const updates: any = {
        last_message: content,
        last_message_at: new Date().toISOString(),
      };
      if (sender === "customer") {
        updates.unread_by_merchant = (await supabaseAdmin.from("live_chat_conversations").select("unread_by_merchant").eq("id", conversation_id).single()).data?.unread_by_merchant + 1;
      } else if (sender === "merchant") {
        updates.unread_by_customer = (await supabaseAdmin.from("live_chat_conversations").select("unread_by_customer").eq("id", conversation_id).single()).data?.unread_by_customer + 1;
      }
      await supabaseAdmin.from("live_chat_conversations").update(updates).eq("id", conversation_id);
    }

    // If customer sent first message → auto-reply with bot
    if (sender === "customer") {
      const { count } = await supabaseAdmin
        .from("live_chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversation_id)
        .eq("sender", "customer");

      if (count === 1) {
        // First message → auto-reply
        const autoReply = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
        await new Promise((r) => setTimeout(r, 800));
        const { data: botMsg } = await supabaseAdmin
          .from("live_chat_messages")
          .insert({
            conversation_id,
            sender: "bot",
            content: autoReply,
            is_ai_suggestion: false,
          })
          .select()
          .single();

        if (botMsg) {
          // Update conversation
          await supabaseAdmin
            .from("live_chat_conversations")
            .update({
              last_message: autoReply,
              last_message_at: new Date().toISOString(),
              unread_by_customer: 1,
            })
            .eq("id", conversation_id);

          return NextResponse.json({ message: data, autoReply: botMsg });
        }
      }
    }

    return NextResponse.json({ message: data });
  } catch (error: any) {
    console.error("[Chat Messages POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/chat/messages
 * Mark messages as read
 * Body: { conversation_id, reader (customer|merchant) }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversation_id, reader } = body;

    if (!conversation_id || !reader) {
      return NextResponse.json({ error: "conversation_id et reader requis" }, { status: 400 });
    }

    // Mark unread messages from the other party as read
    const senderFilter = reader === "merchant" ? "customer" : "merchant";
    await supabaseAdmin
      .from("live_chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversation_id)
      .eq("sender", senderFilter)
      .is("read_at", "null");

    // Reset unread counter
    const field = reader === "merchant" ? "unread_by_merchant" : "unread_by_customer";
    await supabaseAdmin
      .from("live_chat_conversations")
      .update({ [field]: 0 })
      .eq("id", conversation_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Chat Messages PATCH] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
