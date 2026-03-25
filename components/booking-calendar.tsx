"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  selected:    Date | undefined
  onSelect:    (date: Date) => void
  disabled?:   (date: Date) => boolean
  maxWeeksAhead?: number  // default 4
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

// Monday-based grid offset (0 = Mon … 6 = Sun)
function mondayOffset(date: Date) {
  const day = date.getDay() // 0=Sun
  return day === 0 ? 6 : day - 1
}

export function BookingCalendar({
  selected,
  onSelect,
  disabled,
  maxWeeksAhead = 4,
}: BookingCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxWeeksAhead * 7)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  // Can we navigate prev/next?
  const canPrev = new Date(year, month - 1, 1) >= startOfMonth(today)
  const canNext = new Date(year, month + 1, 1) <= startOfMonth(maxDate)

  // Build grid
  const firstDay   = new Date(year, month, 1)
  const offset     = mondayOffset(firstDay)  // empty cells at start
  const totalDays  = daysInMonth(year, month)
  const totalCells = Math.ceil((offset + totalDays) / 7) * 7

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ...Array(totalCells - offset - totalDays).fill(null),
  ]

  const monthLabel = viewDate.toLocaleDateString("en-CH", {
    month: "long",
    year:  "numeric",
  })

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={prevMonth}
          disabled={!canPrev}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
            canPrev
              ? "hover:bg-accent text-zinc-700"
              : "text-zinc-200 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-base font-semibold text-foreground">{monthLabel}</span>

        <button
          onClick={nextMonth}
          disabled={!canNext}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
            canNext
              ? "hover:bg-accent text-zinc-700"
              : "text-zinc-200 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const date = new Date(year, month, day)
          date.setHours(0, 0, 0, 0)

          const isToday    = isSameDay(date, today)
          const isSelected = selected ? isSameDay(date, selected) : false
          const isDisabled = disabled ? disabled(date) : false

          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelect(date)}
                className={cn(
                  "w-10 h-10 rounded-full text-sm font-medium transition-all duration-100 flex items-center justify-center",
                  // selected
                  isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                  // today (not selected)
                  isToday && !isSelected && "ring-2 ring-zinc-300 ring-offset-1 font-semibold text-foreground",
                  // normal available
                  !isSelected && !isToday && !isDisabled && "text-foreground hover:bg-accent",
                  // disabled
                  isDisabled && "text-muted-foreground/60 cursor-not-allowed",
                )}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
