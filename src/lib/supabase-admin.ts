import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client (server-side only).
 * Uses the service_role key — NEVER expose to the browser.
 *
 * Usage in API routes / server components:
 *   import { supabaseAdmin } from "@/lib/supabase-admin";
 *   const { data } = await supabaseAdmin.from("profiles").select("*");
 *
 * Set these in .env (NOT NEXT_PUBLIC_):
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set."
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
