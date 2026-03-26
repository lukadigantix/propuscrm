"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

type LoginAction = (
  formData: FormData
) => Promise<{ error: string } | undefined>;

export default function LoginForm({ action }: { action: LoginAction }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | undefined, formData: FormData) => {
      return await action(formData);
    },
    undefined
  );

  return (
    <form action={formAction}>
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm px-8 py-8 space-y-5">

        {/* Error */}
        {state?.error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@propus.ch"
            className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <a href="#" className="text-xs text-zinc-700 hover:text-zinc-900 font-medium">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white text-sm font-semibold shadow-md shadow-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </form>
  );
}
