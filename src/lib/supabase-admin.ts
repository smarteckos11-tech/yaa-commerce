import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses the service_role key.
 * ⚠️ SECURITY: NEVER expose this client to the browser.
 *    Use it ONLY in server-side code (API routes, server components).
 *
 * The service_role key is hardcoded as fallback for Vercel deployments
 * where env vars may not be configured yet.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM5NDQyNCwiZXhwIjoyMDk3OTcwNDI0fQ.acCvst14QY9kgqJhtrnv8d35XgyUXMgJt-mjZ3ho-cg";

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
