"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveProfile(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const full_name = (formData.get("full_name") as string)?.trim() || null
  const phone = (formData.get("phone") as string)?.trim() || null
  const avatarFile = formData.get("avatar") as File | null

  const patch: Record<string, unknown> = { full_name, phone }

  if (avatarFile && avatarFile.size > 0) {
    const ext =
      avatarFile.type === "image/webp"
        ? "webp"
        : avatarFile.type === "image/png"
        ? "png"
        : "jpg"

    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path)

    patch.avatar_url = publicUrl
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/panel", "layout")
  return { success: true }
}
