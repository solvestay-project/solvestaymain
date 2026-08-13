import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Keep Nominatim-style display_name only through the second comma. */
export function shortDisplayName(displayName: string | null | undefined): string {
  if (!displayName?.trim()) return ""
  const parts = displayName.split(",").map((p) => p.trim()).filter(Boolean)
  if (parts.length <= 2) return parts.join(", ")
  return parts.slice(0, 2).join(", ")
}
