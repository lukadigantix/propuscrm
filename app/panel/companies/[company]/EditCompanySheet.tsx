"use client"

import { useState, useTransition } from "react"
import { Pencil, X, Loader2 } from "lucide-react"
import { Dialog } from "@base-ui/react/dialog"
import { updateCompany } from "./actions"

type Company = {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  domains: string[]
  locations: string[]
}

const inputCls =
  "w-full h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"

export function EditCompanySheet({ company }: { company: Company }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateCompany(company.id, formData)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save")
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition"
      >
        <Pencil className="size-3.5" />
        Edit
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card shadow-2xl transition duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 flex flex-col max-h-[90vh]">

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Edit Company
            </Dialog.Title>
            <Dialog.Close className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex-1 px-6 py-5 space-y-4">

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name *</label>
                <input name="name" type="text" required autoComplete="off" defaultValue={company.name} className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                <textarea
                  name="description"
                  defaultValue={company.description ?? ""}
                  rows={3}
                  placeholder="Short description..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <input name="email" type="email" autoComplete="off" defaultValue={company.email ?? ""} placeholder="company@example.com" className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                <input name="phone" type="tel" autoComplete="off" defaultValue={company.phone ?? ""} placeholder="+381 ..." className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</label>
                <input name="website" type="url" autoComplete="off" defaultValue={company.website ?? ""} placeholder="https://..." className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Locations
                  <span className="ml-1.5 normal-case font-normal text-muted-foreground">comma-separated</span>
                </label>
                <input name="locations" type="text" autoComplete="off" defaultValue={(company.locations ?? []).join(", ")} placeholder="Belgrade, Novi Sad" className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Domains
                  <span className="ml-1.5 normal-case font-normal text-muted-foreground">comma-separated</span>
                </label>
                <input name="domains" type="text" autoComplete="off" defaultValue={(company.domains ?? []).join(", ")} placeholder="real estate, photography" className={inputCls} />
              </div>

            </div>

            <div className="px-6 py-4 border-t bg-background flex gap-3 justify-end shrink-0">
              <Dialog.Close
                type="button"
                className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition"
              >
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-60 text-primary-foreground text-sm font-medium transition flex items-center gap-2"
              >
                {isPending ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</> : "Save changes"}
              </button>
            </div>
          </form>

        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

