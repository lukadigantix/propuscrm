import type { Service, TeamMemberId, BusySlot, AvailabilityResult, TravelBuffer } from "./types";
import { OUTLOOK_CALENDAR, BASE_LOCATION } from "./data";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatMins(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

export function serviceDuration(s: Service | null): number {
  if (s === "photos") return 120;
  if (s === "matterport") return 180;
  return 240;
}

export function slotOverlaps(startMin: number, endMin: number, busy: BusySlot[]): boolean {
  return busy.some((b) => toMin(b.start) < endMin && toMin(b.end) > startMin);
}

export function estimatedTravelMinutes(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const distKm     = haversineKm(fromLat, fromLon, toLat, toLon);
  const driveMin   = (distKm / 30) * 60;
  const withBuffer = driveMin + 10;
  const ceiled     = Math.ceil(withBuffer / 5) * 5;
  return Math.max(15, ceiled);
}

export function getAvailableSlots(
  date: Date,
  memberId: TeamMemberId,
  service: Service,
  bookingLat?: number,
  bookingLon?: number,
): AvailabilityResult {
  const busy = [...(OUTLOOK_CALENDAR[memberId]?.[dateKey(date)] ?? [])]
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  const duration = serviceDuration(service);
  const slots: string[] = [];
  let afterBlockInfo: TravelBuffer["afterBlock"] | undefined;
  let beforeBlockInfo: TravelBuffer["beforeBlock"] | undefined;

  for (let start = 8 * 60; start <= 18 * 60 - duration; start += 30) {
    const end = start + duration;

    if (slotOverlaps(start, end, busy)) continue;

    if (bookingLat !== undefined && bookingLon !== undefined) {
      const prevEvent = busy.filter((b) => toMin(b.end) <= start).at(-1);

      if (prevEvent) {
        const fromLoc = prevEvent.location ?? BASE_LOCATION;
        const travelMin = estimatedTravelMinutes(fromLoc.lat, fromLoc.lon, bookingLat, bookingLon);
        const earliestStart = toMin(prevEvent.end) + travelMin;

        if (start < earliestStart) {
          if (!afterBlockInfo) {
            afterBlockInfo = {
              blocksUntil:      formatMins(earliestStart),
              prevEventEnd:     prevEvent.end,
              prevEventSubject: prevEvent.subject,
              travelMinutes:    travelMin,
            };
          }
          continue;
        }
      }

      const nextEvent = busy.filter((b) => toMin(b.start) >= end).at(0);

      if (nextEvent) {
        const toLoc = nextEvent.location ?? BASE_LOCATION;
        const travelMin = estimatedTravelMinutes(bookingLat, bookingLon, toLoc.lat, toLoc.lon);
        const mustEndBy = toMin(nextEvent.start) - travelMin;

        if (end > mustEndBy) {
          if (!beforeBlockInfo) {
            beforeBlockInfo = {
              mustEndBy:        formatMins(mustEndBy),
              nextEventStart:   nextEvent.start,
              nextEventSubject: nextEvent.subject,
              travelMinutes:    travelMin,
            };
          }
          continue;
        }
      }
    }

    slots.push(formatMins(start));
  }

  const travelBuffer: TravelBuffer | null =
    afterBlockInfo || beforeBlockInfo
      ? { afterBlock: afterBlockInfo, beforeBlock: beforeBlockInfo }
      : null;

  return { slots, travelBuffer };
}

export function isDayAvailable(date: Date): boolean {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  if (d < today) return false;
  if (d.getDay() === 0 || d.getDay() === 6) return false;
  const fourWeeks = new Date(today); fourWeeks.setDate(today.getDate() + 28);
  if (d > fourWeeks) return false;
  return true;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
