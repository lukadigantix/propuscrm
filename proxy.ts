import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths blocked for the `user` (client) role
const USER_BLOCKED_PREFIXES = [
  "/panel/contacts",
  "/panel/companies",
  "/panel/photos",
  "/panel/matterport",
  "/panel/settings",
  "/panel/subscriptions",
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  // Step 1: session check (reads cookie only, no network call) — used for routing only
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && path.startsWith("/panel")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // Step 2: role check — only when path is potentially blocked
  // Role lives in the signed JWT (app_metadata via DB trigger) — no network call needed.
  // Middleware is a UX redirect only; real data security is enforced in Server Components.
  if (session && path.startsWith("/panel")) {
    const isBlocked = USER_BLOCKED_PREFIXES.some((p) => path.startsWith(p));
    if (isBlocked) {
      const role = session.user.app_metadata?.role as string | undefined;

      if (role === "user") {
        return NextResponse.redirect(new URL("/panel/bookings", request.url));
      }

      // Fallback: role not yet in JWT (migration not applied) → DB lookup
      if (!role) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role === "user") {
          return NextResponse.redirect(new URL("/panel/bookings", request.url));
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/panel/:path*", "/login"],
};
