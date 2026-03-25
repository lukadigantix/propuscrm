import { motion, AnimatePresence } from "framer-motion";
import { Bed, Car, Sofa } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PropertyDetails } from "../types";
import { PROPERTY_TYPES, ROOM_OPTIONS, PARKING_OPTIONS, FURNISHED_OPTIONS } from "../data";
import { ChipGroup } from "./ChipGroup";

interface PropertyDetailsFormProps {
  details: PropertyDetails;
  onChange: (d: PropertyDetails) => void;
}

export function PropertyDetailsForm({ details, onChange }: PropertyDetailsFormProps) {
  const set = <K extends keyof PropertyDetails>(field: K, value: PropertyDetails[K]) =>
    onChange({ ...details, [field]: value });

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-zinc-800">
          Property type <span className="text-red-400">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button"
              onClick={() => set("type", details.type === id ? null : id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                details.type === id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sqm">
          Size (m²) <span className="text-red-400">*</span>
        </Label>
        <Input id="sqm" type="number" min={1} placeholder="e.g. 85" required
          value={details.squareMeters} onChange={(e) => set("squareMeters", e.target.value)} className="w-32" />
      </div>

      <AnimatePresence>
        {details.type === "apartment" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" placeholder="3" value={details.floor} onChange={(e) => set("floor", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entrance">Entrance</Label>
                <Input id="entrance" placeholder="B" value={details.entrance} onChange={(e) => set("entrance", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aptnum">Apt. no.</Label>
                <Input id="aptnum" placeholder="12" value={details.apartmentNumber} onChange={(e) => set("apartmentNumber", e.target.value)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-zinc-400" />
          Number of rooms
          <span className="text-zinc-400 font-normal text-xs">— helps estimate shoot duration</span>
        </p>
        <ChipGroup options={ROOM_OPTIONS} value={details.rooms} onChange={(v) => set("rooms", v)} />
      </div>

      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-zinc-400" />
          Parking
          <span className="text-zinc-400 font-normal text-xs">— our team arrives with equipment</span>
        </p>
        <ChipGroup options={PARKING_OPTIONS} value={details.parking} onChange={(v) => set("parking", v)} />
      </div>

      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5">
          <Sofa className="w-3.5 h-3.5 text-zinc-400" />
          Furnishing
          <span className="text-zinc-400 font-normal text-xs">— affects lighting & staging</span>
        </p>
        <ChipGroup options={FURNISHED_OPTIONS} value={details.furnished} onChange={(v) => set("furnished", v)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="access">Access notes <span className="text-zinc-400 font-normal">— optional</span></Label>
        <textarea id="access" rows={3}
          placeholder="e.g. Intercom code: 12#45 · Key at reception · Ring bell on arrival"
          value={details.accessNotes} onChange={(e) => set("accessNotes", e.target.value)}
          className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
