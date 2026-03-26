"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { sendMatterportReady } from "@/lib/email/matterport-ready"
import { revalidatePath } from "next/cache"

// ── Set status to "pending" (shoot done, waiting for Matterport link) ────────
export async function setMatterportPending(bookingId: string) {
  const admin = createAdminClient()
  await admin.from("bookings").update({ matterport_status: "pending" }).eq("id", bookingId)
  revalidatePath(`/panel/matterport/tours/${bookingId}`)
}

// ── Save link → status = "linked" + notify client ────────────────────────────
export async function saveMatterportLink(formData: FormData) {
  const bookingId = formData.get("bookingId") as string
  const link = (formData.get("link") as string | null)?.trim()

  if (!bookingId || !link) throw new Error("Missing required fields")

  const admin = createAdminClient()

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("id, property_address, contacts(full_name, email)")
    .eq("id", bookingId)
    .single()

  if (bookingError) console.error("[saveMatterportLink] booking fetch error:", bookingError)
  if (!booking) throw new Error("Booking not found")

  const { error: updateError } = await admin
    .from("bookings")
    .update({ matterport_link: link, matterport_status: "linked" })
    .eq("id", bookingId)

  if (updateError) console.error("[saveMatterportLink] update error:", updateError)

  const contact = (Array.isArray(booking.contacts) ? booking.contacts[0] : booking.contacts) as {
    full_name: string
    email: string | null
  } | null

  if (contact?.email) {
    try {
      const result = await sendMatterportReady({
        to: contact.email,
        clientName: contact.full_name,
        address: booking.property_address ?? "",
        tourLink: `${process.env.NEXT_PUBLIC_SITE_URL}/panel/my-matterport`,
        panelLink: link,
      })
      console.log("[saveMatterportLink] email result:", result)
    } catch (emailError) {
      console.error("[saveMatterportLink] email send failed:", emailError)
    }
  }

  revalidatePath(`/panel/matterport/tours/${bookingId}`)
}

// ── Archive tour ──────────────────────────────────────────────────────────────
export async function setMatterportArchived(bookingId: string) {
  const admin = createAdminClient()
  await admin.from("bookings").update({ matterport_status: "archived" }).eq("id", bookingId)
  revalidatePath(`/panel/matterport/tours/${bookingId}`)
}
