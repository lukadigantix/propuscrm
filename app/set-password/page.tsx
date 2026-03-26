"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Load email from URL param (passed by auth/callback after token exchange),
  // then load name from the session's user metadata.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));

    console.log("[SET-PASSWORD] URL search:", window.location.search);
    console.log("[SET-PASSWORD] URL hash:", window.location.hash);
    console.log("[SET-PASSWORD] All params:", Object.fromEntries(params.entries()));
    console.log("[SET-PASSWORD] email param:", emailParam);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("[SET-PASSWORD] getUser result:", {
        id: user?.id,
        email: user?.email,
        metadata: user?.user_metadata,
        aud: user?.aud,
      });
      if (!user) return;
      if (!emailParam) setEmail(user.email ?? null);
      const fullName = user.user_metadata?.full_name as string | undefined;
      setName(fullName ?? null);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/panel");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {name ? `Welcome, ${name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Set a password to access your panel anytime</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm px-8 py-8 space-y-5">

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email — read only, shows who's registering */}
            {email && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Your email</label>
                <div className="h-11 rounded-xl border border-zinc-100 bg-zinc-50 px-3.5 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span className="text-sm text-zinc-500 truncate">{email}</span>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-zinc-700">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat password"
                className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                "Save & go to my panel →"
              )}
            </button>

          </div>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Propus AG &mdash; Zürich
        </p>
      </div>
    </div>
  );
}
