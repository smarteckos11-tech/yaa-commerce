import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses the service_role key.
 *
 * ⚠️  SECURITY: NEVER expose this client to the browser.
 *    Use it ONLY in:
 *    - Server Actions (with "use server")
 *    - Route handlers (/app/api/*)
 *    - Server components
 *
 * This bypasses Row Level Security (RLS) — use with extreme care.
 *
 * Usage:
 *   import { supabaseAdmin } from "@/lib/supabase-admin";
 *   const { data } = await supabaseAdmin.from("contact_messages").insert({...});
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
