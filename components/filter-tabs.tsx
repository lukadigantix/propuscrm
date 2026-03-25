import { Button } from "@/components/ui/button"

interface FilterTab<T extends string> {
  label: string
  value: T
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterTabs<T extends string>({ tabs, value, onChange }: FilterTabsProps<T>) {
  return (
    <div className="flex gap-1 rounded-lg border p-1">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={value === tab.value ? "default" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
