"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  boutique_name: string | null;
  plan: "decouverte" | "business" | "pro";
  avatar_url: string | null;
};

/**
 * Hook d'authentification global.
 */
export function useAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    // Récupère la session courante
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    async function loadProfile(userId: string) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!error && data) {
          setProfile(data as Profile);
        }
      } catch (e) {
        // Profile not yet created
      }
    }

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = React.useCallback(async () => {
    // 1. Sign out from Supabase (clears JWT + session cookies)
    await supabase.auth.signOut();

    // 2. Clear all localStorage (Supabase stores tokens here)
    try {
      localStorage.clear();
    } catch {}

    // 3. Clear all sessionStorage
    try {
      sessionStorage.clear();
    } catch {}

    // 4. Clear any remaining cookies related to auth
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
        // Delete across all paths and domains
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Also try with leading dot for subdomain cookies
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
    }

    // 5. Reset state
    setUser(null);
    setProfile(null);

    // 6. Redirect to login (hard navigation to clear any cached state)
    window.location.href = "/login";
  }, []);

  return { user, profile, loading, signOut };
}
