"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Camera, MapPin, CalendarDays, Star, StarOff,
  CheckSquare, MessageSquare, X, ImagePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DbClientPhotoBooking, DbClientPhoto } from "./page"

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
}

const STATUS_STYLE: Record<string, string> = {
  Scheduled:     "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Delivered:     "bg-emerald-100 text-emerald-700",
  Invoiced:      "bg-violet-100 text-violet-700",
}

type LocalPhoto = DbClientPhoto & { _dirty?: boolean }

async function savePhotoChange(photoId: string, patch: Partial<{ selected: boolean; starred: boolean; client_note: string }>) {
  await fetch("/api/my-photos/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: photoId, ...patch }),
  })
}

function PhotoCard({
  photo,
  onChange,
  onOpenNote,
}: {
  photo: LocalPhoto
  onChange: (updated: LocalPhoto) => void
  onOpenNote: (photo: LocalPhoto) => void
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
        photo.selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-muted-foreground/30"
      )}
      onClick={() => {
        const updated = { ...photo, selected: !photo.selected, _dirty: true }
        onChange(updated)
        savePhotoChange(photo.id, { selected: updated.selected })
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.photo_url} alt={photo.filename} className="w-full aspect-4/3 object-cover" loading="lazy" />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      {/* Select */}
      <div className="absolute top-2 left-2">
        <div className={cn(
          "size-5 rounded flex items-center justify-center transition-all",
          photo.selected ? "bg-primary" : "bg-white/80 opacity-0 group-hover:opacity-100"
        )}>
          {photo.selected && <CheckSquare className="size-3.5 text-white" />}
        </div>
      </div>

      {/* Star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          const updated = { ...photo, starred: !photo.starred }
          onChange(updated)
          savePhotoChange(photo.id, { starred: updated.starred })
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {photo.starred
          ? <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow" />
          : <StarOff className="size-4 text-white drop-shadow" />
        }
      </button>

      {/* Starred indicator (when not hovering) */}
      {photo.starred && (
        <div className="absolute top-2 right-2 group-hover:hidden">
          <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow" />
        </div>
      )}

      {/* Note button */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenNote(photo) }}
          className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
        >
          <MessageSquare className="size-3" />
          {photo.client_note ? "Edit note" : "Add note"}
        </button>
      </div>

      {/* Note indicator */}
      {photo.client_note && (
        <div className="absolute bottom-2 left-2 size-2 rounded-full bg-blue-400 ring-1 ring-white" />
      )}
    </div>
  )
}

function NoteModal({
  photo,
  onSave,
  onClose,
}: {
  photo: LocalPhoto
  onSave: (photoId: string, note: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(photo.client_note ?? "")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold truncate">{photo.filename}</p>
          <button onClick={onClose}><X className="size-4 text-muted-foreground hover:text-foreground" /></button>
        </div>
        <textarea
          className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-25"
          placeholder="Leave a note for this photo…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => { onSave(photo.id, draft); onClose() }}>Save</Button>
        </div>
      </div>
    </div>
  )
}

function BookingSection({ booking }: { booking: DbClientPhotoBooking }) {
  const [photos, setPhotos] = useState<LocalPhoto[]>(booking.photos)
  const [noteTarget, setNoteTarget] = useState<LocalPhoto | null>(null)

  const selectedCount = photos.filter((p) => p.selected).length

  function handleChange(updated: LocalPhoto) {
    setPhotos((ps) => ps.map((p) => p.id === updated.id ? updated : p))
  }

  function handleSaveNote(photoId: string, note: string) {
    setPhotos((ps) => ps.map((p) => p.id === photoId ? { ...p, client_note: note } : p))
    savePhotoChange(photoId, { client_note: note })
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="size-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-semibold truncate">{booking.property_address ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedCount > 0 && (
            <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
          )}
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLE[booking.status] ?? "bg-muted text-muted-foreground")}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {fmtDate(booking.date)}{booking.time ? ` · ${booking.time}` : ""}
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed bg-muted/20 text-center">
            <ImagePlus className="size-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Photos not uploaded yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">They will appear here once your photographer delivers them.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Click a photo to select it. Use the star to mark favourites. Leave notes for specific photos.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onChange={handleChange}
                  onOpenNote={setNoteTarget}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {noteTarget && (
        <NoteModal
          photo={noteTarget}
          onSave={handleSaveNote}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  )
}

export default function MyPhotosClientView({ bookings }: { bookings: DbClientPhotoBooking[] }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Camera className="size-4 text-muted-foreground" />
        <h1 className="text-sm font-medium">My Photos</h1>
      </header>

      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
        {bookings.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
            <Camera className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No photo jobs yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your photos will appear here after your shoot.</p>
          </div>
        ) : (
          bookings.map((b) => <BookingSection key={b.id} booking={b} />)
        )}
      </div>
    </div>
  )
}
