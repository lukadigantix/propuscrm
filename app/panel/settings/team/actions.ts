"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createTeamMember(formData: FormData) {
  const fullName       = (formData.get("full_name") as string).trim()
  const email          = (formData.get("email") as string).trim()
  const password       = (formData.get("password") as string)
  const phone          = (formData.get("phone") as string | null)?.trim() || null
  const specializations = formData.getAll("specializations") as string[]

  if (!fullName || !email || !password) {
    return { error: "Name, email and password are required." }
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const supabase = createAdminClient()

  // 1. Create user in auth (role: admin in metadata so trigger sets it immediately)
  const { data, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
  })

  if (createError) {
    if (createError.message.includes("already been registered")) {
      return { error: "A user with this email already exists." }
    }
    return { error: createError.message }
  }

  // 2. Upsert profile (handles both: trigger ran already, or hasn't run yet)
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: data.user.id, role: "admin", full_name: fullName, phone, specializations })

  if (upsertError) {
    return { error: upsertError.message }
  }

  revalidatePath("/panel/settings/team")
  return { success: true }
}

export async function deleteTeamMember(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  revalidatePath("/panel/settings/team")
  return { success: true }
}
