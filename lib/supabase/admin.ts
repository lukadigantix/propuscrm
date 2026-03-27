import { createClient } from "@supabase/supabase-js"
import { cache } from "react";

/**
 * Admin client with service role key — server-side only.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Cached per-request — deduplicates profile DB queries across layout + pages.
 * React cache() ensures this runs at most once per server render pass per userId.
 */
export const getProfile = cache(async (userId: string) => {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name, role, phone, avatar_url")
    .eq("id", userId)
    .single();
  return data;
});
