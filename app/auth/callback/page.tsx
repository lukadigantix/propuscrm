"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

/**
 * Handles Supabase auth redirects — both hash-based (invite, magic link)
 * and PKCE code-based flows.
 *
 * Hash params (#access_token=...) are never sent to the server,
 * so this MUST be a client component.
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Read hash BEFORE Supabase client clears it
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const searchParams = new URLSearchParams(window.location.search)

    const type = hashParams.get("type") // "invite" | "magiclink" | "recovery"
    const next = searchParams.get("next") ?? "/panel"
    const code = searchParams.get("code") // PKCE flow

    const supabase = createClient()

    // PKCE flow: code in query string
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) { router.replace("/login?error=auth_callback_failed"); return }
        router.replace(type === "invite" ? "/set-password" : next)
      })
      return
    }

    // Implicit/hash flow: tokens in URL hash (invite, magic link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        subscription.unsubscribe()
        router.replace(type === "invite" ? "/set-password" : next)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Signing you in…
      </div>
    </div>
  )
}
