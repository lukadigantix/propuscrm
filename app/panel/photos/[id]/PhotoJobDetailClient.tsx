"use client"

import { useState, useRef, useTransition } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import BackButton from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Camera,
  MapPin,
  Building2,
  CalendarDays,
  User,
  CheckSquare,
  Square,
  Trash2,
  Download,
  MessageSquare,
  Send,
  ImagePlus,
  ChevronDown,
  Star,
  StarOff,
  X,
  Layers,
  Mail,
} from "lucide-react"
import { deliverPhotos } from "./actions"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type PhotoJobStatus = "Scheduled" | "In Progress" | "Delivered" | "Invoiced"

export interface DbPhotoJob {
  id: string
  date: string
  time: string | null
  service: string
  property_address: string | null
  property_type: string | null
  rooms: string | null
  square_meters: number | null
  status: string
  contact_name: string
  contact_company: string | null
}

interface Photo {
  id: number
  url: string
  filename: string
  selected: boolean
  starred: boolean
  comment: string
}

interface Comment {
  id: number
  author: string
  text: string
  timestamp: string
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CH", { day: "numeric", month: "short", year: "numeric" })
}

const STATUS_STYLE: Record<PhotoJobStatus, string> = {
  "Scheduled":   "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "Delivered":   "bg-emerald-100 text-emerald-700",
  "Invoiced":    "bg-violet-100 text-violet-700",
}

const STATUS_OPTIONS: PhotoJobStatus[] = ["Scheduled", "In Progress", "Delivered", "Invoiced"]

/* ------------------------------------------------------------------ */
/* InfoRow                                                              */
/* ------------------------------------------------------------------ */

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 px-5 py-3.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function PhotoJobDetail({ job }: { job: DbPhotoJob }) {
  const [photos, setPhotos]         = useState<Photo[]>([])
  const [status, setStatus]         = useState<PhotoJobStatus>((job.status as PhotoJobStatus) ?? "Scheduled")
  const [statusOpen, setStatusOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDeliver() {
    startTransition(async () => {
      await deliverPhotos(job.id)
      setStatus("Delivered")
    })
  }
  const [notes, setNotes]           = useState("")
  const [comments, setComments]     = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [lightbox, setLightbox]     = useState<Photo | null>(null)
  const [activePhotoComment, setActivePhotoComment] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selected = photos.filter((p) => p.selected)
  const allSelected = photos.length > 0 && photos.every((p) => p.selected)

  function toggleSelect(id: number) {
    setPhotos((ps) => ps.map((p) => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  function toggleStar(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setPhotos((ps) => ps.map((p) => p.id === id ? { ...p, starred: !p.starred } : p))
  }

  function toggleSelectAll() {
    const next = !allSelected
    setPhotos((ps) => ps.map((p) => ({ ...p, selected: next })))
  }

  function deleteSelected() {
    setPhotos((ps) => ps.filter((p) => !p.selected))
  }

  function savePhotoComment(id: number, text: string) {
    setPhotos((ps) => ps.map((p) => p.id === id ? { ...p, comment: text } : p))
    setActivePhotoComment(null)
  }

  function sendComment() {
    if (!newComment.trim()) return
    setComments((cs) => [...cs, {
      id: Date.now(),
      author: "You",
      text: newComment.trim(),
      timestamp: new Date().toLocaleDateString("en-CH", { day: "numeric", month: "short" }),
    }])
    setNewComment("")
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-6 py-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <BackButton label="Back" />
        <div className="flex items-center gap-2 min-w-0">
          <Camera className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{job.property_address}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                STATUS_STYLE[status]
              )}
            >
              {status}
              <ChevronDown className={cn("size-3 transition-transform", statusOpen && "rotate-180")} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-20 w-36 rounded-xl border bg-card shadow-lg overflow-hidden">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatus(s); setStatusOpen(false) }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted",
                      status === s ? "bg-muted" : ""
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {status !== "Delivered" && status !== "Invoiced" && (
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={handleDeliver}
              disabled={isPending}
            >
              <Mail className="size-3.5" />
              {isPending ? "Notifying…" : "Deliver & Notify Client"}
            </Button>
          )}
          <Button size="sm" variant="outline">Save changes</Button>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-4">

        {/* Meta strip */}
        <div className="rounded-xl border bg-card px-5 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span><span className="font-medium">Customer:</span> <span className="text-muted-foreground">{job.contact_company ?? "—"}</span></span>
          <span><span className="font-medium">Contact:</span> <span className="text-muted-foreground">{job.contact_name}</span></span>
          <span><span className="font-medium">Date:</span> <span className="text-muted-foreground">{fmtDate(job.date)}{job.time ? ` · ${job.time}` : ""}</span></span>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* LEFT — 1/3 */}
          <div className="md:col-span-1 flex flex-col gap-4">

            {/* Contact & Property */}
            <div className="rounded-xl border bg-card overflow-hidden divide-y">
              <div className="px-5 py-3 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
              </div>
              <InfoRow icon={<User className="size-4 text-muted-foreground" />} label="Name" value={job.contact_name} />
              <InfoRow icon={<Building2 className="size-4 text-muted-foreground" />} label="Company" value={job.contact_company ?? "—"} />
              <div className="px-5 py-3 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property</p>
              </div>
              <InfoRow icon={<MapPin className="size-4 text-muted-foreground" />} label="Address" value={job.property_address ?? "—"} />
              <InfoRow icon={<Building2 className="size-4 text-muted-foreground" />} label="Type" value={job.property_type ?? "—"} />
              <div className="flex items-start gap-4 px-5 py-3.5">
                <span className="mt-0.5 shrink-0"><Layers className="size-4 text-muted-foreground" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Details</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.rooms && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{job.rooms} rooms</span>
                    )}
                    {job.square_meters && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{job.square_meters} m²</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 px-5 py-3.5">
                <span className="mt-0.5 shrink-0"><CalendarDays className="size-4 text-muted-foreground" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Scheduled</p>
                  <p className="text-sm text-foreground">{fmtDate(job.date)}{job.time ? ` · ${job.time}` : ""}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              </div>
              <div className="px-5 py-4">
                <textarea
                  className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-25"
                  placeholder="Add notes about this job…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Comments */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-3 bg-muted/30 flex items-center gap-2">
                <MessageSquare className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comments</p>
              </div>
              <div className="divide-y">
                {comments.map((c) => (
                  <div key={c.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{c.author}</span>
                      <span className="text-xs text-muted-foreground">{c.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 border-t flex gap-2">
                <Input
                  placeholder="Write a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendComment() }}
                  className="flex-1 h-8 text-sm"
                />
                <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={sendComment}>
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT — 2/3 */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* Photo toolbar */}
            <div className="rounded-xl border bg-card px-5 py-3 flex items-center gap-3 flex-wrap">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected
                  ? <CheckSquare className="size-4 text-primary" />
                  : <Square className="size-4" />
                }
                {allSelected ? "Deselect all" : "Select all"}
              </button>

              {selected.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">{selected.length} selected</span>
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1.5">
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={deleteSelected}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-3.5" /> Upload
                </Button>
              </div>
            </div>

            {/* Photo grid */}
            {photos.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No photos yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Click to upload</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                      photo.selected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                    )}
                    onClick={() => toggleSelect(photo.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full aspect-4/3 object-cover"
                      loading="lazy"
                    />

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Select checkbox */}
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
                      onClick={(e) => toggleStar(photo.id, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {photo.starred
                        ? <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow" />
                        : <StarOff className="size-4 text-white drop-shadow" />
                      }
                    </button>

                    {/* Comment + expand */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActivePhotoComment(photo.id); setLightbox(null) }}
                        className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                      >
                        <MessageSquare className="size-3" />
                        {photo.comment ? "Edit" : "Comment"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLightbox(photo); setActivePhotoComment(null) }}
                        className="ml-auto rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                      >
                        View
                      </button>
                    </div>

                    {/* Comment indicator */}
                    {photo.comment && (
                      <div className="absolute bottom-2 left-2 size-2 rounded-full bg-blue-400 ring-1 ring-white" />
                    )}

                    {/* Starred indicator */}
                    {photo.starred && (
                      <div className="absolute top-2 right-2 group-hover:hidden">
                        <Star className="size-4 fill-amber-400 text-amber-400 drop-shadow" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Photo comment modal */}
      {activePhotoComment !== null && (() => {
        const photo = photos.find((p) => p.id === activePhotoComment)!
        let draft = photo.comment
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setActivePhotoComment(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">{photo.filename}</p>
                <button onClick={() => setActivePhotoComment(null)}>
                  <X className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <textarea
                className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-25"
                placeholder="Add a comment for this photo…"
                defaultValue={photo.comment}
                onChange={(e) => { draft = e.target.value }}
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setActivePhotoComment(null)}>Cancel</Button>
                <Button size="sm" onClick={() => savePhotoComment(activePhotoComment, draft)}>Save</Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <div className="flex flex-col items-center gap-3 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.filename}
              className="max-h-[80vh] rounded-xl object-contain shadow-2xl"
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">{lightbox.filename}</span>
              {lightbox.comment && (
                <span className="text-sm text-white/50 italic">&ldquo;{lightbox.comment}&rdquo;</span>
              )}
              <button
                onClick={() => { toggleStar(lightbox.id, { stopPropagation: () => {} } as React.MouseEvent); setLightbox((l) => l ? { ...l, starred: !l.starred } : null) }}
                className="text-white/70 hover:text-amber-400 transition-colors"
              >
                {lightbox.starred
                  ? <Star className="size-4 fill-amber-400 text-amber-400" />
                  : <StarOff className="size-4" />
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
