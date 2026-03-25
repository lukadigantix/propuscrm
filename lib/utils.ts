import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a company name to a URL-friendly slug.
 * e.g. "Wüest Partner AG" → "wuest-partner-ag"
 *      "Engel & Völkers Zürich" → "engel-volkers-zurich"
 */
export function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip diacritics: ü→u, ö→o, ä→a
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")           // special chars → space
    .trim()
    .replace(/[\s_]+/g, "-")            // spaces/underscores → hyphens
    .replace(/-+/g, "-")                // collapse consecutive hyphens
}
