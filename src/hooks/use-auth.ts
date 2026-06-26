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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
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
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  }, [router]);

  return { user, profile, loading, signOut };
}
