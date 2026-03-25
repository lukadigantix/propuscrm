"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Loader2, AlertTriangle, Navigation } from "lucide-react";
import { BookingCalendar } from "@/components/booking-calendar";
import { cn } from "@/lib/utils";
import type { Service, TeamMemberId, BusySlot, TravelBuffer } from "../types";
import { TEAM_MEMBERS } from "../data";
import { dateKey, toMin, formatMins, serviceDuration, isDayAvailable } from "../helpers";

interface DayAvail {
  slots: string[];
  busy: BusySlot[];
  travelBuffer: TravelBuffer | null;
  error: string | null;
  fetchKey: string | null;
}

const EMPTY_AVAIL: DayAvail = {
  slots: [], busy: [], travelBuffer: null, error: null, fetchKey: null,
};

interface DateStepProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onSelectDate: (d: Date | undefined) => void;
  onSelectTime: (t: string) => void;
  memberId: TeamMemberId | null;
  service: Service | null;
  bookingLat?: number;
  bookingLon?: number;
}

export function DateStep({
  selectedDate, selectedTime, onSelectDate, onSelectTime,
  memberId, service, bookingLat, bookingLon,
}: DateStepProps) {
  const memberName = TEAM_MEMBERS.find((m) => m.id === memberId)?.name ?? "your specialist";
  const duration = serviceDuration(service);
  const durationH = duration / 60;

  const [avail, setAvail] = useState<DayAvail>(EMPTY_AVAIL);

  const fetchKey = selectedDate && service
    ? `${dateKey(selectedDate)}-${service}-${bookingLat ?? ""}-${bookingLon ?? ""}`
    : null;
  const isLoading = fetchKey !== null && avail.fetchKey !== fetchKey && !avail.error;

  useEffect(() => {
    if (!fetchKey || !selectedDate || !service) return;

    const dateStr = dateKey(selectedDate);
    const serviceParam = service === "both" ? "both" : service;
    const params = new URLSearchParams({ date: dateStr, service: serviceParam });
    if (bookingLat !== undefined) params.set("lat", String(bookingLat));
    if (bookingLon !== undefined) params.set("lon", String(bookingLon));

    let cancelled = false;

    fetch(`/api/availability?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setAvail({ slots: [], busy: [], travelBuffer: null, error: data.error, fetchKey });
        } else {
          const busy: BusySlot[] = (data.busySlots ?? []).map(
            (b: { title: string; start: string; end: string }) => ({
              subject: b.title,
              start: new Date(b.start).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", hour12: false }),
              end:   new Date(b.end).toLocaleTimeString("de-CH",   { hour: "2-digit", minute: "2-digit", hour12: false }),
            })
          );
          setAvail({
            slots: data.availableSlots ?? [],
            busy,
            travelBuffer: data.travelBuffer ?? null,
            error: null,
            fetchKey,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setAvail({ ...EMPTY_AVAIL, error: "Failed to load availability.", fetchKey });
      });

    return () => { cancelled = true; };
  }, [fetchKey, selectedDate, service, bookingLat, bookingLon]);

  const endTime = selectedTime ? formatMins(toMin(selectedTime) + duration) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Pick a date & time</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Showing{" "}
          <span className="font-semibold text-zinc-700">{memberName}</span>
          &apos;s availability. Greyed-out days have no free slots.
        </p>
      </div>

      <BookingCalendar
        selected={selectedDate}
        onSelect={(d) => onSelectDate(d)}
        disabled={(date) => !isDayAvailable(date)}
      />

      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={dateKey(selectedDate)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-100" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                {selectedDate.toLocaleDateString("en-CH", { weekday: "long", month: "long", day: "numeric" })}
              </span>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking availability…
              </div>
            )}
            {avail.error && (
              <div className="flex items-center gap-2 text-sm text-rose-500">
                <AlertTriangle className="w-4 h-4" />
                {avail.error}
              </div>
            )}

            {!isLoading && avail.busy.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Existing appointments
                </p>
                {avail.busy.map((slot, i) => (
                  <div key={i} className="flex items-stretch gap-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
                    <div className="w-1 bg-rose-400 rounded-full shrink-0" />
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-rose-700 tabular-nums whitespace-nowrap">
                        {slot.start} – {slot.end}
                      </span>
                      <span className="text-xs text-rose-600 truncate">{slot.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {avail.travelBuffer?.afterBlock && (
                <motion.div
                  key="after-block"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                    <Navigation className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-800">Travel buffer — arriving</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        After <span className="font-semibold">{avail.travelBuffer.afterBlock.prevEventSubject}</span>{" "}
                        (ends {avail.travelBuffer.afterBlock.prevEventEnd}), the specialist needs
                        ~{avail.travelBuffer.afterBlock.travelMinutes}&thinsp;min to reach your location.
                        Earliest start: <span className="font-semibold">{avail.travelBuffer.afterBlock.blocksUntil}</span>.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {avail.travelBuffer?.beforeBlock && (
                <motion.div
                  key="before-block"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                    <Navigation className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-800">Travel buffer — departing</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        The specialist must leave by <span className="font-semibold">{avail.travelBuffer.beforeBlock.mustEndBy}</span>{" "}
                        to reach <span className="font-semibold">{avail.travelBuffer.beforeBlock.nextEventSubject}</span>{" "}
                        (starts {avail.travelBuffer.beforeBlock.nextEventStart}) ~{avail.travelBuffer.beforeBlock.travelMinutes}&thinsp;min away.
                        Some slots end too late and are hidden.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Check className="w-3 h-3" />
                Available start times &mdash; {durationH}h shoot
              </p>
              {avail.slots.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">No slots available for this day.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {avail.slots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onSelectTime(selectedTime === time ? "" : time)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                        selectedTime === time
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                {selectedDate.toLocaleDateString("en-CH", { weekday: "long", month: "long", day: "numeric" })}
                {" at "}
                {selectedTime}
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">
                {durationH}h shoot &mdash; ends at {endTime}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
