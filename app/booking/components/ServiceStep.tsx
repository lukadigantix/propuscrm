import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "../types";
import { SERVICES } from "../data";

interface ServiceStepProps {
  selected: Service | null;
  onSelect: (s: Service) => void;
}

export function ServiceStep({ selected, onSelect }: ServiceStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">What do you need?</h2>
        <p className="text-sm text-zinc-500 mt-1">Select the service for this property.</p>
      </div>
      <div className="grid gap-3">
        {SERVICES.map((svc, i) => {
          const Icon = svc.icon;
          const isSelected = selected === svc.id;
          return (
            <motion.button
              key={svc.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(svc.id)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100" : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
                isSelected ? `${svc.accentBg} ${svc.accent}` : "bg-zinc-100 text-zinc-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900">{svc.label}</span>
                  {"badge" in svc && svc.badge && (
                    <Badge className="text-[10px] bg-indigo-100 text-indigo-700 border-0 px-2 py-0">{svc.badge}</Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-0.5">{svc.description}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{svc.detail}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-500" : "border-zinc-300"
              )}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
