const TOKEN_URL = "https://oauth2.googleapis.com/token"
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3"

// Service durations in minutes
export const SERVICE_DURATION: Record<string, number> = {
  photos:     120, // 2h
  matterport: 150, // 2.5h
  both:       270, // photos + matterport back-to-back
}

// Working hours
const WORK_START_H = 8   // 08:00
const WORK_END_H   = 18  // 18:00
const SLOT_STEP    = 30  // generate candidate slots every 30 min

export interface BusySlot {
  start: string
  end:   string
  title: string
}

export interface TravelBuffer {
  afterBlock?: {
    blocksUntil:      string
    prevEventEnd:     string
    prevEventTitle:   string
    travelMinutes:    number
  }
  beforeBlock?: {
    mustEndBy:        string
    nextEventStart:   string
    nextEventTitle:   string
    travelMinutes:    number
  }
}

// --- Helpers ---
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estimatedTravelMinutes(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const distKm   = haversineKm(fromLat, fromLon, toLat, toLon)
  const driveMin = (distKm / 30) * 60
  const withBuf  = driveMin + 10
  const ceiled   = Math.ceil(withBuf / 5) * 5
  return Math.max(15, ceiled)
}

function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatMins(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`
}

// Propus base location — Zürich HB area
const BASE_LAT = 47.3779
const BASE_LON = 8.5404

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

export async function getBusySlots(date: string): Promise<BusySlot[]> {
  const accessToken = await getAccessToken()
  const calendarId  = process.env.GOOGLE_CALENDAR_ID ?? "primary"

  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd   = new Date(`${date}T23:59:59`)

  const url = new URL(`${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`)
  url.searchParams.set("timeMin",      dayStart.toISOString())
  url.searchParams.set("timeMax",      dayEnd.toISOString())
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy",      "startTime")
  url.searchParams.set("fields",       "items(summary,start,end)")

  const res  = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error?.message ?? "Google Calendar API error")

  return (data.items ?? []).map((ev: { summary?: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string } }) => ({
    title: ev.summary ?? "(busy)",
    start: ev.start.dateTime ?? ev.start.date ?? "",
    end:   ev.end.dateTime   ?? ev.end.date   ?? "",
  }))
}

export function computeAvailableSlots(
  date: string,
  busySlots: BusySlot[],
  durationMinutes: number,
  bookingLat?: number,
  bookingLon?: number,
): { slots: string[]; travelBuffer: TravelBuffer | null } {
  // Normalize busy slots to HH:MM using local date parsing
  const normalized = busySlots
    .map((b) => ({
      ...b,
      startMin: toMin(new Date(b.start).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false })),
      endMin:   toMin(new Date(b.end).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false })),
    }))
    .sort((a, b) => a.startMin - b.startMin)

  const available: string[]                     = []
  let afterBlock: TravelBuffer["afterBlock"]    | undefined
  let beforeBlock: TravelBuffer["beforeBlock"]  | undefined

  for (let h = WORK_START_H; h < WORK_END_H; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP) {
      const slotStartMin = h * 60 + m
      const slotEndMin   = slotStartMin + durationMinutes

      // Must end within working hours
      if (slotEndMin > WORK_END_H * 60) break

      // Rule 1: direct overlap
      const overlaps = normalized.some(
        (b) => slotStartMin < b.endMin && slotEndMin > b.startMin
      )
      if (overlaps) continue

      if (bookingLat !== undefined && bookingLon !== undefined) {
        // Rule 2: travel FROM previous event TO booking
        const prevEvent = normalized.filter((b) => b.endMin <= slotStartMin).at(-1)
        if (prevEvent) {
          // We don't have per-event location from Google Calendar yet — use base
          const travelMin     = estimatedTravelMinutes(BASE_LAT, BASE_LON, bookingLat, bookingLon)
          const earliestStart = prevEvent.endMin + travelMin
          if (slotStartMin < earliestStart) {
            if (!afterBlock) {
              afterBlock = {
                blocksUntil:    formatMins(earliestStart),
                prevEventEnd:   formatMins(prevEvent.endMin),
                prevEventTitle: prevEvent.title,
                travelMinutes:  travelMin,
              }
            }
            continue
          }
        }

        // Rule 3: travel FROM booking TO next event
        const nextEvent = normalized.filter((b) => b.startMin >= slotEndMin).at(0)
        if (nextEvent) {
          const travelMin = estimatedTravelMinutes(bookingLat, bookingLon, BASE_LAT, BASE_LON)
          const mustEndBy = nextEvent.startMin - travelMin
          if (slotEndMin > mustEndBy) {
            if (!beforeBlock) {
              beforeBlock = {
                mustEndBy:      formatMins(mustEndBy),
                nextEventStart: formatMins(nextEvent.startMin),
                nextEventTitle: nextEvent.title,
                travelMinutes:  travelMin,
              }
            }
            continue
          }
        }
      }

      available.push(formatMins(slotStartMin))
    }
  }

  const travelBuffer: TravelBuffer | null =
    afterBlock || beforeBlock ? { afterBlock, beforeBlock } : null

  return { slots: available, travelBuffer }
}

