import { NextRequest, NextResponse } from "next/server"
import { SERVICE_DURATION } from "@/lib/google-calendar"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendBookingConfirmation } from "@/lib/email/booking-confirmation"

const TOKEN_URL    = "https://oauth2.googleapis.com/token"
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3"

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type:    "refresh_token",
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error("Failed to obtain access token")
  return data.access_token
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    date,           // "2026-03-25"
    time,           // "10:00"
    service,        // "photos" | "matterport" | "both"
    address,        // "Bahnhofstrasse 1, 8001 Zürich"
    lat,            // 47.37
    lon,            // 8.54
    clientName,     // "Anna Brunner"
    clientEmail,    // "anna@example.com"
    clientPhone,    // "+41 79 123 45 67"
    clientCompany,  // "Real Estate AG"
    propertyType,   // "apartment" | "house" | ...
    rooms,
    floor,
    squareMeters,
    parking,
    furnished,
    accessNotes,
    teamMemberName, // "Marco"
  } = body

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📥 [BOOKING] Incoming request body:")
  console.log(JSON.stringify({
    date, time, service, address, lat, lon,
    clientName, clientEmail, clientPhone, clientCompany,
    propertyType, rooms, floor, squareMeters, parking, furnished, accessNotes,
    teamMemberName,
  }, null, 2))

  if (!date || !time || !service || !address || !clientName) {
    console.log("❌ [BOOKING] Validation failed — missing required fields:", {
      date: !!date, time: !!time, service: !!service, address: !!address, clientName: !!clientName,
    })
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const durationMinutes = SERVICE_DURATION[service] ?? 120

  const [h, m]   = time.split(":").map(Number)
  const startDate = new Date(`${date}T00:00:00`)
  startDate.setHours(h, m, 0, 0)
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + durationMinutes)

  console.log("⏱  [BOOKING] Calculated event time:", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    durationMinutes,
  })

  const serviceLabel: Record<string, string> = {
    photos:     "📷 Photography Shoot",
    matterport: "📦 Matterport 3D Scan",
    both:       "📷📦 Full Package (Photos + Matterport)",
  }

  const event = {
    summary:     `${serviceLabel[service] ?? service} — ${clientName}`,
    location:    address,
    description: [
      `Client: ${clientName}`,
      clientEmail   ? `Email: ${clientEmail}`     : null,
      clientPhone   ? `Phone: ${clientPhone}`     : null,
      clientCompany ? `Company: ${clientCompany}` : null,
      accessNotes   ? `Notes: ${accessNotes}`     : null,
      `Service: ${serviceLabel[service] ?? service}`,
      `Duration: ${durationMinutes} min`,
    ].filter(Boolean).join("\n"),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Europe/Zurich",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Europe/Zurich",
    },
    colorId: "9", // blueberry
  }

  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🔑 [STEP 1] Getting Google OAuth access token...")
    const accessToken  = await getAccessToken()
    console.log("✅ [STEP 1] Access token obtained")

    const calendarId   = process.env.GOOGLE_CALENDAR_ID ?? "primary"
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📅 [STEP 2] Creating Google Calendar event:")
    console.log(JSON.stringify(event, null, 2))

    const res = await fetch(
      `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? "Google Calendar API error")
    console.log("✅ [STEP 2] Google Calendar event created:", {
      eventId: data.id,
      htmlLink: data.htmlLink,
      status: data.status,
    })

    // --- Save contact + booking to Supabase ---
    const supabaseAdmin = createAdminClient()

    // Find or create contact
    let contactId: string | null = null
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("👤 [STEP 3] Contact lookup — email:", clientEmail ?? "(no email)")

    if (clientEmail) {
      // Check if contact already exists by email
      const { data: existing } = await supabaseAdmin
        .from("contacts")
        .select("id")
        .eq("email", clientEmail)
        .single()

      if (existing) {
        console.log("🔄 [STEP 3] Existing contact found → updating:", existing.id)
        await supabaseAdmin
          .from("contacts")
          .update({ full_name: clientName, phone: clientPhone ?? null, company: clientCompany ?? null })
          .eq("id", existing.id)
        contactId = existing.id
        console.log("✅ [STEP 3] Contact updated:", { contactId, clientName, clientPhone, clientCompany })
      } else {
        console.log("🆕 [STEP 3] No existing contact → inserting new contact")
        const { data: created, error: contactError } = await supabaseAdmin
          .from("contacts")
          .insert({ full_name: clientName, email: clientEmail, phone: clientPhone ?? null, company: clientCompany ?? null, source: "booking" })
          .select("id")
          .single()
        if (contactError) throw new Error(`Contact insert failed: ${contactError.message}`)
        contactId = created.id
        console.log("✅ [STEP 3] New contact created:", { contactId, clientName, clientEmail, clientPhone, clientCompany, source: "booking" })
      }
    } else {
      console.log("⚠️  [STEP 3] No email provided → inserting anonymous contact")
      const { data: created, error: contactError } = await supabaseAdmin
        .from("contacts")
        .insert({ full_name: clientName, phone: clientPhone ?? null, company: clientCompany ?? null, source: "booking" })
        .select("id")
        .single()
      if (contactError) throw new Error(`Contact insert failed: ${contactError.message}`)
      contactId = created?.id ?? null
      console.log("✅ [STEP 3] Anonymous contact created:", { contactId, clientName, clientPhone, clientCompany })
    }

    // Insert booking linked to contact
    const bookingPayload = {
      contact_id:               contactId,
      date,
      time,
      service,
      property_address:         address ?? null,
      property_lat:             lat ?? null,
      property_lon:             lon ?? null,
      property_type:            propertyType ?? null,
      rooms:                    rooms ?? null,
      floor:                    floor ?? null,
      square_meters:            squareMeters ?? null,
      parking:                  parking ?? null,
      furnished:                furnished ?? null,
      access_notes:             accessNotes ?? null,
      assigned_team_member:     teamMemberName ?? null,
      google_calendar_event_id: data.id,
      status:                   "Scheduled",
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📋 [STEP 4] Inserting booking into DB:")
    console.log(JSON.stringify(bookingPayload, null, 2))
    const { error: bookingError } = await supabaseAdmin.from("bookings").insert(bookingPayload)
    if (bookingError) {
      console.log("❌ [STEP 4] Booking insert FAILED:", bookingError.message)
      throw new Error(`Booking insert failed: ${bookingError.message}`)
    }
    console.log("✅ [STEP 4] Booking saved to DB")

    // --- Free 6-month Matterport subscription on first booking ---
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(`🔍 [STEP 5] Subscription check — service: "${service}", contactId: ${contactId}`)
    if (contactId && (service === "matterport" || service === "both")) {
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("contact_id", contactId)
        .eq("service", "matterport")
        .limit(1)
        .maybeSingle()

      if (!existingSub) {
        const endsDate = new Date(date)
        endsDate.setMonth(endsDate.getMonth() + 6)
        const endsAt = endsDate.toISOString().split("T")[0]
        const subPayload = {
          contact_id: contactId,
          service:    "matterport",
          status:     "active",
          starts_at:  date,
          ends_at:    endsAt,
          is_free:    true,
        }
        console.log("🆓 [STEP 5] No existing Matterport sub → creating free 6-month subscription:")
        console.log(JSON.stringify(subPayload, null, 2))
        await supabaseAdmin.from("subscriptions").insert(subPayload)
        console.log("✅ [STEP 5] Subscription created — valid until:", endsAt)
      } else {
        console.log("ℹ️  [STEP 5] Matterport subscription already exists, skipping:", existingSub.id)
      }
    } else {
      console.log("ℹ️  [STEP 5] Service is photos-only — no subscription created")
    }

    // --- Invite user + send confirmation email ---
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    if (clientEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      console.log("📧 [STEP 6] Generating auth link for:", clientEmail)

      // Try invite (new user → must set password first).
      // Fall back to magic link if user already exists.
      let panelLink: string | null = null
      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "invite",
          email: clientEmail,
          options: {
            redirectTo: `${appUrl}/auth/callback?next=/set-password`,
            data: { full_name: clientName, phone: clientPhone ?? null },
          },
        })

      if (!inviteError) {
        panelLink = inviteData.properties.action_link
        console.log("✅ [STEP 6] Invite link generated (new user)")

        // Upsert profile with name + phone so it's ready when user logs in
        const newUserId = inviteData.user?.id
        if (newUserId) {
          console.log("👤 [STEP 6] Upserting profile for new user:", newUserId)
          await supabaseAdmin.from("profiles").upsert(
            { id: newUserId, full_name: clientName, phone: clientPhone ?? null, role: "user" },
            { onConflict: "id" }
          )
          console.log("✅ [STEP 6] Profile upserted:", { userId: newUserId, full_name: clientName, role: "user" })
          // Also link the auth user back to the contact row
          if (contactId) {
            await supabaseAdmin
              .from("contacts")
              .update({ auth_user_id: newUserId })
              .eq("id", contactId)
            console.log("🔗 [STEP 6] Linked auth_user_id on contact:", { contactId, auth_user_id: newUserId })
          }
        }
      } else {
        console.log("ℹ️  [STEP 6] User already registered →", inviteError.message, "→ sending magic link instead")
        // User already registered — send straight to panel via magic link
        const { data: magicData } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: clientEmail,
          options: { redirectTo: `${appUrl}/auth/callback?next=/panel` },
        })
        panelLink = magicData?.properties?.action_link ?? null
        console.log("✅ [STEP 6] Magic link generated for existing user")
      }

      if (panelLink) {
        console.log("📨 [STEP 7] Sending booking confirmation email to:", clientEmail)
        await sendBookingConfirmation({
          to: clientEmail,
          clientName,
          service,
          date,
          time,
          address,
          panelLink,
        })
        console.log("✅ [STEP 7] Confirmation email sent")
      } else {
        console.log("⚠️  [STEP 7] No panel link available — email NOT sent")
      }
    } else {
      console.log("⚠️  [STEP 6/7] No email — skipping auth invite and confirmation email")
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎉 [BOOKING] All steps complete. Event ID:", data.id)

    return NextResponse.json({ success: true, eventId: data.id, htmlLink: data.htmlLink })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
