"use client"

import { useActionState, useState } from "react"
import { Loader2, Eye, EyeOff, Plus, Check, X } from "lucide-react"
import { Dialog } from "@base-ui/react/dialog"
import { createTeamMember } from "./actions"

const SPECIALIZATIONS = [
  { value: "matterport", label: "Matterport" },
  { value: "photos",     label: "Photos" },
]

const inputCls =
  "w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"

export function AddMemberSheet() {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  function toggle(val: string) {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  const [state, action, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await createTeamMember(formData)
      if (result.success) {
        setOpen(false)
        setSelected([])
        return undefined
      }
      return result
    },
    undefined
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-medium transition">
        <Plus className="w-4 h-4" />
        Add member
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card shadow-2xl transition duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 flex flex-col max-h-[90vh]">

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Add team member
            </Dialog.Title>
            <Dialog.Close className="p-1.5 rounded-lg text-muted-foreground hover:text-zinc-700 hover:bg-accent transition">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

        <form action={action} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex-1 px-6 py-5 space-y-4">

            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Full name
              </label>
              <input
                name="full_name"
                type="text"
                required
                autoComplete="off"
                placeholder="Jonas Rüegg"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="off"
                placeholder="jonas@propus.ch"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                autoComplete="off"
                placeholder="+41 79 000 00 00"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Specialization
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map((s) => {
                  const active = selected.includes(s.value)
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggle(s.value)}
                      className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                      {s.label}
                    </button>
                  )
                })}
              </div>
              {selected.map((v) => (
                <input key={v} type="hidden" name="specializations" value={v} />
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The member will use this password to sign in.
              </p>
            </div>

          </div>

          <div className="px-6 py-4 border-t bg-background flex gap-3 justify-end shrink-0">
            <Dialog.Close
              className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-zinc-700 hover:bg-background transition"
              type="button"
            >
              Cancel
            </Dialog.Close>
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-60 text-primary-foreground text-sm font-medium transition flex items-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</>
              ) : (
                "Create member"
              )}
            </button>
          </div>
        </form>

        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
