import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipGroupProps<T extends string> {
  options: { id: T; label: string; icon?: React.ElementType }[];
  value: T | "";
  onChange: (v: T) => void;
}

export function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id} type="button" onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
              active
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
            {active && <Check className="w-3 h-3 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
