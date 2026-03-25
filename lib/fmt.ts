export function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
