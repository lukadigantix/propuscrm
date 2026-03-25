import { NextRequest, NextResponse } from "next/server"
import { getBusySlots, computeAvailableSlots, SERVICE_DURATION } from "@/lib/google-calendar"

// GET /api/availability?date=2026-03-25&service=photos&lat=47.37&lon=8.54
export async function GET(req: NextRequest) {
  const date    = req.nextUrl.searchParams.get("date")
  const service = req.nextUrl.searchParams.get("service") ?? "photos"
  const latStr  = req.nextUrl.searchParams.get("lat")
  const lonStr  = req.nextUrl.searchParams.get("lon")

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Missing or invalid 'date' param. Use YYYY-MM-DD." },
      { status: 400 },
    )
  }

  if (new Date(date) < new Date(new Date().toDateString())) {
    return NextResponse.json(
      { error: "Date must be today or in the future." },
      { status: 400 },
    )
  }

  const duration   = SERVICE_DURATION[service] ?? SERVICE_DURATION.photos
  const bookingLat = latStr  ? parseFloat(latStr)  : undefined
  const bookingLon = lonStr  ? parseFloat(lonStr)  : undefined

  try {
    const busySlots              = await getBusySlots(date)
    const { slots, travelBuffer } = computeAvailableSlots(date, busySlots, duration, bookingLat, bookingLon)

    return NextResponse.json({ date, service, duration, availableSlots: slots, busySlots, travelBuffer })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
