"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [label, setLabel] = useState("Signing you in…")

  useEffect(() => {
    // Read hash BEFORE Supabase client clears it
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const searchParams = new URLSearchParams(window.location.search)

    const next = searchParams.get("next") ?? "/panel"
    const code = searchParams.get("code") // PKCE flow

    const supabase = createClient()

    const finish = (email?: string | null) => {
      setLabel("Opening your panel…")
      let dest = next
      if (email && !next.includes("email=")) {
        const sep = next.includes("?") ? "&" : "?"
        dest = `${next}${sep}email=${encodeURIComponent(email)}`
      }
      setTimeout(() => router.replace(dest), 450)
    }

    // PKCE flow: code in query string
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) { router.replace("/login?error=auth_callback_failed"); return }
        finish(data.session?.user.email)
      })
      return
    }

    // Hash flow: if hash contains an access_token the token hasn't been processed yet —
    // wait for SIGNED_IN / PASSWORD_RECOVERY so we get the invited user's session, not
    // the currently logged-in admin's INITIAL_SESSION.
    const hasHashToken = hashParams.has("access_token")
    const hashType = hashParams.get("type")

    console.log("[AUTH_CALLBACK] next:", next)
    console.log("[AUTH_CALLBACK] hasHashToken:", hasHashToken)
    console.log("[AUTH_CALLBACK] hashType:", hashType)
    console.log("[AUTH_CALLBACK] hash keys:", [...hashParams.keys()])

    if (hasHashToken) {
      const accessToken  = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      console.log("[AUTH_CALLBACK] calling setSession with hash tokens...")

      supabase.auth.setSession({
        access_token:  accessToken!,
        refresh_token: refreshToken!,
      }).then(({ data, error }) => {
        console.log("[AUTH_CALLBACK] setSession result — email:", data.session?.user?.email ?? "no session", "| error:", error?.message ?? "none")
        if (error || !data.session) {
          router.replace("/login?error=auth_callback_failed")
          return
        }
        finish(data.session.user.email)
      })
      return
    }

    // No hash token: Supabase already consumed it before this effect ran.
    // Use the current session which is already set to the invited user.
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AUTH_CALLBACK] no-hash getSession — email:", session?.user?.email ?? "no session")
      if (session) {
        finish(session.user.email)
      } else {
        router.replace("/login?error=auth_callback_failed")
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">

        {/* Propus logo mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <span className="absolute inset-0 rounded-2xl animate-ping bg-indigo-400 opacity-20" />
        </div>

        <p className="text-xs font-bold tracking-[.2em] text-zinc-400 uppercase">Propus</p>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              style={{ animation: `bncpropus 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

        <p className="text-sm text-zinc-500 transition-all duration-300">{label}</p>
      </div>

      <style>{`
        @keyframes bncpropus {
          0%, 80%, 100% { transform: translateY(0); opacity: .35; }
          40% { transform: translateY(-7px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
