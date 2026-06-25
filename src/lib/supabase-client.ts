import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client (client-side).
 * Uses the anon key (public, safe to expose).
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase-client";
 *   const { data } = await supabase.from("products").select("*");
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant. " +
      "Configurez-les dans .env.local (voir .env.example)."
  );
}

export const supabase = createBrowserClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
