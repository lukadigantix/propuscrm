import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "@/app/booking/data";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center w-full mb-10">
      {STEPS.map((label, index) => {
        const num = index + 1;
        const completed = num < currentStep;
        const active = num === currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                completed && "bg-zinc-900 text-white shadow-md shadow-zinc-200",
                active && "bg-zinc-900 text-white shadow-lg shadow-zinc-300 ring-4 ring-zinc-100",
                !completed && !active && "bg-zinc-100 text-zinc-400"
              )}>
                {completed ? <Check className="w-4 h-4" /> : num}
              </div>
              <span className={cn(
                "text-[10px] font-bold text-center hidden sm:block tracking-widest uppercase",
                active ? "text-zinc-900" : completed ? "text-zinc-400" : "text-zinc-300"
              )}>
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 mb-4 transition-all duration-500",
                num < currentStep ? "bg-zinc-900" : "bg-zinc-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
