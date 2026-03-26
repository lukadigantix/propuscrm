"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateCompany(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  if (!name) throw new Error("Name is required")

  const description = (formData.get("description") as string)?.trim() || null
  const phone = (formData.get("phone") as string)?.trim() || null
  const email = (formData.get("email") as string)?.trim() || null
  const website = (formData.get("website") as string)?.trim() || null

  const locationsRaw = (formData.get("locations") as string)?.trim()
  const domainsRaw = (formData.get("domains") as string)?.trim()

  const locations = locationsRaw
    ? locationsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const domains = domainsRaw
    ? domainsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const admin = createAdminClient()
  const { error } = await admin
    .from("companies")
    .update({ name, description, phone, email, website, locations, domains })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidatePath(`/panel/companies/${id}`)
  revalidatePath("/panel/companies")
}
