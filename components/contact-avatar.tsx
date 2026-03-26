import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

interface ContactAvatarProps {
  name: string
  avatarUrl?: string | null
  /** "md" (default) for list rows, "lg" for detail header */
  size?: "md" | "lg"
  className?: string
}

export function ContactAvatar({ name, avatarUrl, size = "md", className }: ContactAvatarProps) {
  const sizeClass = size === "lg" ? "size-16" : "size-10"
  const textClass = size === "lg" ? "text-xl font-semibold" : "text-sm font-medium"
  return (
    <Avatar className={`${sizeClass} shrink-0 ${className ?? ""}`}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
      <AvatarFallback className={textClass}>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
