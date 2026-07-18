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
 * GET /api/chat/conversations
 * Pour le marchand : retourne ses conversations
 * Pour un client : retourne ses conversations (par session_id)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const sessionId = url.searchParams.get("sessionId");

    if (userId) {
      // Marchand : récupère ses conversations
      const userIdCurrent = await getCurrentUserId();
      if (userIdCurrent !== userId) {
        // Le marchand doit être authentifié
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
      const { data, error } = await supabaseAdmin
        .from("live_chat_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ conversations: data || [] });
    }

    if (sessionId) {
      // Client : récupère ses conversations par session_id
      const { data, error } = await supabaseAdmin
        .from("live_chat_conversations")
        .select("*")
        .eq("session_id", sessionId)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ conversations: data || [] });
    }

    return NextResponse.json({ error: "userId ou sessionId requis" }, { status: 400 });
  } catch (error: any) {
    console.error("[Chat Conversations GET] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/chat/conversations
 * Crée une nouvelle conversation (côté client, public)
 * Body: { user_id (marchand), customer_name, customer_email, customer_phone, session_id }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, customer_name, customer_email, customer_phone, session_id } = body;

    if (!user_id || !customer_name) {
      return NextResponse.json({ error: "user_id et customer_name requis" }, { status: 400 });
    }

    // Check if conversation already exists for this session
    if (session_id) {
      const { data: existing } = await supabaseAdmin
        .from("live_chat_conversations")
        .select("*")
        .eq("user_id", user_id)
        .eq("session_id", session_id)
        .single();
      if (existing) {
        return NextResponse.json({ conversation: existing });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("live_chat_conversations")
      .insert({
        user_id,
        customer_name,
        customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        session_id: session_id || null,
        status: "open",
        unread_by_merchant: 0,
        unread_by_customer: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ conversation: data });
  } catch (error: any) {
    console.error("[Chat Conversations POST] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
