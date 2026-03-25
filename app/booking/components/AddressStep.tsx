"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, AlertTriangle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { SelectedAddress, AddressSuggestion, PropertyDetails } from "../types";
import { ZURICH, MAX_RADIUS_KM } from "../data";
import { haversineKm, stripHtml } from "../helpers";
import { PropertyDetailsForm } from "./PropertyDetailsForm";

const MapPicker = dynamic(() => import("../MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-70 rounded-xl bg-zinc-100 flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
    </div>
  ),
});

interface AddressStepProps {
  selected: SelectedAddress | null;
  onSelect: (a: SelectedAddress) => void;
  propertyDetails: PropertyDetails;
  onPropertyDetailsChange: (d: PropertyDetails) => void;
}

export function AddressStep({ selected, onSelect, propertyDetails, onPropertyDetailsChange }: AddressStepProps) {
  const [query, setQuery] = useState(selected?.label ?? "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [outOfRange, setOutOfRange] = useState(() =>
    selected ? haversineKm(selected.lat, selected.lon, ZURICH.lat, ZURICH.lon) > MAX_RADIUS_KM : false
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = new URL("https://api3.geo.admin.ch/rest/services/api/SearchServer");
        url.searchParams.set("searchText", query);
        url.searchParams.set("type", "locations");
        url.searchParams.set("origins", "address");
        url.searchParams.set("limit", "8");
        url.searchParams.set("lang", "de");
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const results: AddressSuggestion[] = (data.results ?? []).map(
          (r: { attrs: { label: string; lat: number; lon: number } }) => ({
            label: r.attrs.label, lat: r.attrs.lat, lon: r.attrs.lon,
          })
        );
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [query]);

  const applySelection = (label: string, lat: number, lon: number) => {
    setOutOfRange(haversineKm(lat, lon, ZURICH.lat, ZURICH.lon) > MAX_RADIUS_KM);
    onSelect({ label, lat, lon });
  };

  const handleSearchSelect = (s: AddressSuggestion) => {
    const plain = stripHtml(s.label);
    setQuery(plain);
    setIsOpen(false);
    setSuggestions([]);
    applySelection(plain, s.lat, s.lon);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Property address</h2>
        <p className="text-sm text-zinc-500 mt-1">Click the map to pin the location, or search by address.</p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
        <MapPicker selected={selected} onSelect={(lat, lon, label) => applySelection(label, lat, lon)} />
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <div className="flex-1 h-px bg-zinc-100" />
        or type an address
        <div className="flex-1 h-px bg-zinc-100" />
      </div>

      <div className="space-y-1.5 relative" ref={wrapperRef}>
        <Label htmlFor="address">Search address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <Input
            id="address" autoComplete="off"
            placeholder="Bahnhofstrasse 1, Zürich"
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9 h-11"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
        </div>
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden mt-1">
            {suggestions.map((s, i) => (
              <button key={i} type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSearchSelect(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-start gap-3 border-b border-zinc-100 last:border-0 transition-colors"
              >
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-800" dangerouslySetInnerHTML={{ __html: s.label }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected?.label && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3"
          >
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-sm text-indigo-800 font-medium flex-1">{selected.label}</span>
            <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {selected && outOfRange && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Outside our service area</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This address is more than 30&nbsp;km from Zürich. Please contact us to check availability.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected?.label && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Separator className="my-2" />
            <div className="mb-5">
              <p className="text-base font-bold text-zinc-900">Property details</p>
              <p className="text-xs text-zinc-500 mt-0.5">Help us prepare for the visit.</p>
            </div>
            <PropertyDetailsForm details={propertyDetails} onChange={onPropertyDetailsChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
