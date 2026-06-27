import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client (client-side).
 * Uses the anon key (public, safe to expose).
 *
 * The URL and anon key are hardcoded as fallback so the app
 * works even if env vars are not configured (e.g., on Vercel).
 * These are PUBLIC values — safe to expose in client code.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dhselafnjecrwsdicuqe.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2VsYWZuamVjcndzZGljdXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTQ0MjQsImV4cCI6MjA5Nzk3MDQyNH0.zTSPKy01SYIwcagNohM9ELolvx7KQnKg7zQWf9ltJyk";

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
