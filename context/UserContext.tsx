"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserContextValue = {
  user: User | null;
  /** true while the initial session check is in flight */
  loading: boolean;
  /** role from user.app_metadata (set by JWT sync trigger, no extra DB call) */
  role: string | null;
  /** contact row id — fetched once for role=user, null for admins */
  contactId: string | null;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  role: null,
  contactId: null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1️⃣ On mount: pull the current session from the Supabase cookie / localStorage
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.log("[UserContext] getUser error:", error.message);
      } else {
        console.log(
          "[UserContext] initial user loaded:",
          data.user?.email ?? "no session"
        );
      }
      const u = data.user ?? null;
      setUser(u);
      // role is in the signed JWT app_metadata — zero extra DB call
      const r = (u?.app_metadata?.role as string) ?? null;
      setRole(r);
      // contactId only needed for "user" role; fetch once and cache in context
      if (r === "user" && u) {
        fetch("/api/me")
          .then((res) => res.json())
          .then((meData) => {
            setContactId(meData.contactId ?? null);
            console.log("[UserContext] contactId:", meData.contactId ?? "not found");
          })
          .catch(() => null)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2️⃣ Stay in sync with auth state changes (login, logout, token refresh, invite accept…)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[UserContext] auth state change →", event, "| user:", session?.user?.email ?? "none");
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, role, contactId }}>
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser() {
  return useContext(UserContext);
}
