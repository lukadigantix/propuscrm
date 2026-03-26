"use client"

import { useState, useRef, useActionState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Camera, Check, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { saveProfile } from "@/app/panel/profile/actions"

const inputCls =
  "w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type User = { name: string; email: string; avatar: string; phone?: string }

// Inner component holds all form state — remounted via `key` on each open so state resets
function ProfileForm({ user, onClose }: { user: User; onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, action, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      // Inject compressed blob instead of raw file
      if (compressedBlob) {
        formData.set("avatar", compressedBlob, "avatar.jpg")
      } else {
        formData.delete("avatar")
      }
      const result = await saveProfile(_prev, formData)
      if (result.success) {
        router.refresh()
        onClose()
        return undefined
      }
      return result
    },
    undefined
  )

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new window.Image()
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
        else { width = Math.round((width * MAX) / height); height = MAX }
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          setCompressedBlob(blob)
          setAvatarPreview(URL.createObjectURL(blob))
        },
        "image/jpeg",
        0.82
      )
    }
    img.src = URL.createObjectURL(file)
  }

  return (
    <form action={action} className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex-1 px-6 py-5 space-y-5">

        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="size-16">
              {avatarPreview && (
                <AvatarImage src={avatarPreview} alt={name} className="object-cover" />
              )}
              <AvatarFallback className="text-lg font-semibold">
                {initials(name) || "?"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{name || "—"}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-0.5 text-xs text-indigo-600 hover:underline"
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Full name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Full name
          </label>
          <input
            name="full_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </div>

        {/* Email (readonly) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            defaultValue={user.email}
            disabled
            className={`${inputCls} opacity-50 cursor-not-allowed`}
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+41 ..."
            className={inputCls}
          />
        </div>

      </div>

      <div className="px-6 py-4 border-t bg-background flex gap-3 justify-end shrink-0">
        <Dialog.Close
          type="button"
          className="h-9 px-4 rounded-lg border border-border bg-card text-sm font-medium text-zinc-700 hover:bg-background transition"
        >
          Cancel
        </Dialog.Close>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-sm font-medium transition flex items-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
          ) : (
            <><Check className="w-3.5 h-3.5" /> Save changes</>
          )}
        </button>
      </div>
    </form>
  )
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  openCount: number
}

export function EditProfileModal({ open, onOpenChange, user, openCount }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card shadow-2xl transition duration-200 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 flex flex-col max-h-[90vh]">

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b shrink-0">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                Edit Profile
              </Dialog.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your personal information and profile photo.
              </p>
            </div>
            <Dialog.Close className="p-1.5 rounded-lg text-muted-foreground hover:text-zinc-700 hover:bg-accent transition">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <ProfileForm key={openCount} user={user} onClose={() => onOpenChange(false)} />

        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

