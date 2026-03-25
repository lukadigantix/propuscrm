import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderActionButtonProps {
  label: string
  onClick?: () => void
}

export function HeaderActionButton({ label, onClick }: HeaderActionButtonProps) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus className="size-4 mr-1.5" />
      {label}
    </Button>
  )
}
